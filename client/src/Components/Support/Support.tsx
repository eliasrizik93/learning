import { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import {
  Box,
  Typography,
  TextField,
  Button,
  Card,
  CardContent,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Chip,
  Divider,
  Avatar,
  Paper,
  CircularProgress,
  Alert,
  Snackbar,
  IconButton,
  Collapse,
} from '@mui/material';
import {
  Support as SupportIcon,
  Add,
  Send,
  ExpandMore,
  ExpandLess,
  BugReport,
  QuestionAnswer,
} from '@mui/icons-material';
import type { AppDispatch, RootState } from '../../store/store';
import {
  createTicket,
  fetchUserTickets,
  replyToTicket,
} from '../../store/slices/supportSlice';
import type { TicketPriority, SupportTicket } from '../../types';

const statusColors: Record<string, 'default' | 'info' | 'success' | 'warning'> = {
  OPEN: 'info',
  IN_PROGRESS: 'warning',
  RESOLVED: 'success',
  CLOSED: 'default',
};

const priorityColors: Record<string, 'default' | 'warning' | 'error'> = {
  LOW: 'default',
  MEDIUM: 'warning',
  HIGH: 'error',
};

const Support = () => {
  const dispatch = useDispatch<AppDispatch>();
  const { tickets, isLoading } = useSelector((state: RootState) => state.support);
  const user = useSelector((state: RootState) => state.auth.user);

  const [createOpen, setCreateOpen] = useState(false);
  const [subject, setSubject] = useState('');
  const [description, setDescription] = useState('');
  const [priority, setPriority] = useState<TicketPriority>('MEDIUM');
  const [expandedTicket, setExpandedTicket] = useState<string | null>(null);
  const [replyMessage, setReplyMessage] = useState('');
  const [replyingTo, setReplyingTo] = useState<string | null>(null);
  const [snackbar, setSnackbar] = useState<{ open: boolean; message: string; severity: 'success' | 'error' }>({
    open: false,
    message: '',
    severity: 'success',
  });

  useEffect(() => {
    dispatch(fetchUserTickets());
  }, [dispatch]);

  const handleCreateTicket = async () => {
    if (!subject.trim() || !description.trim()) return;

    try {
      await dispatch(createTicket({ subject, description, priority })).unwrap();
      setSnackbar({ open: true, message: 'Ticket created successfully', severity: 'success' });
      setCreateOpen(false);
      setSubject('');
      setDescription('');
      setPriority('MEDIUM');
    } catch (err) {
      setSnackbar({ open: true, message: String(err), severity: 'error' });
    }
  };

  const handleReply = async (ticketId: string) => {
    if (!replyMessage.trim()) return;

    try {
      await dispatch(replyToTicket({ ticketId, message: replyMessage })).unwrap();
      setReplyMessage('');
      setReplyingTo(null);
    } catch (err) {
      setSnackbar({ open: true, message: String(err), severity: 'error' });
    }
  };

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  return (
    <Box sx={{ p: 3, maxWidth: 900, mx: 'auto' }}>
      <Box sx={{ mb: 4, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Box>
          <Typography variant="h4" fontWeight={700} sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <SupportIcon color="primary" />
            Support
          </Typography>
          <Typography color="text.secondary">
            Report issues or ask questions
          </Typography>
        </Box>
        <Button variant="contained" startIcon={<Add />} onClick={() => setCreateOpen(true)}>
          New Ticket
        </Button>
      </Box>

      {isLoading && (
        <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
          <CircularProgress />
        </Box>
      )}

      {!isLoading && tickets.length === 0 && (
        <Box sx={{ textAlign: 'center', py: 8 }}>
          <BugReport sx={{ fontSize: 64, color: 'text.disabled', mb: 2 }} />
          <Typography variant="h6" color="text.secondary">
            No tickets yet
          </Typography>
          <Typography color="text.disabled" mb={2}>
            Create a ticket if you need help or want to report an issue
          </Typography>
          <Button variant="outlined" startIcon={<Add />} onClick={() => setCreateOpen(true)}>
            Create your first ticket
          </Button>
        </Box>
      )}

      {/* Tickets List */}
      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
        {tickets.map((ticket) => (
          <Card key={ticket.id} variant="outlined">
            <CardContent>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 1 }}>
                <Box sx={{ flexGrow: 1 }}>
                  <Typography variant="h6" fontWeight={600}>
                    {ticket.subject}
                  </Typography>
                  <Typography variant="caption" color="text.secondary">
                    Created {formatDate(ticket.createdAt)}
                  </Typography>
                </Box>
                <Box sx={{ display: 'flex', gap: 1, alignItems: 'center' }}>
                  <Chip 
                    label={ticket.status.replace('_', ' ')} 
                    size="small" 
                    color={statusColors[ticket.status]}
                  />
                  <Chip 
                    label={ticket.priority} 
                    size="small" 
                    color={priorityColors[ticket.priority]}
                    variant="outlined"
                  />
                  <IconButton 
                    size="small" 
                    onClick={() => setExpandedTicket(expandedTicket === ticket.id ? null : ticket.id)}
                  >
                    {expandedTicket === ticket.id ? <ExpandLess /> : <ExpandMore />}
                  </IconButton>
                </Box>
              </Box>

              <Typography color="text.secondary" sx={{ mb: 1 }}>
                {ticket.description}
              </Typography>

              {ticket.replies.length > 0 && (
                <Chip 
                  icon={<QuestionAnswer />} 
                  label={`${ticket.replies.length} replies`} 
                  size="small" 
                  variant="outlined"
                />
              )}

              <Collapse in={expandedTicket === ticket.id}>
                <Divider sx={{ my: 2 }} />

                {/* Replies */}
                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, mb: 2 }}>
                  {ticket.replies.map((reply) => (
                    <Paper 
                      key={reply.id} 
                      elevation={0}
                      sx={{ 
                        p: 2, 
                        bgcolor: reply.userId === user?.id ? 'primary.50' : 'grey.100',
                        borderRadius: 2,
                      }}
                    >
                      <Box sx={{ display: 'flex', gap: 1.5, alignItems: 'flex-start' }}>
                        <Avatar sx={{ width: 32, height: 32, fontSize: 14 }}>
                          {reply.user.name.charAt(0).toUpperCase()}
                        </Avatar>
                        <Box sx={{ flexGrow: 1 }}>
                          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                            <Typography variant="subtitle2" fontWeight={600}>
                              {reply.user.name}
                            </Typography>
                            <Typography variant="caption" color="text.secondary">
                              {formatDate(reply.createdAt)}
                            </Typography>
                          </Box>
                          <Typography variant="body2">{reply.message}</Typography>
                        </Box>
                      </Box>
                    </Paper>
                  ))}
                </Box>

                {/* Reply Form */}
                {ticket.status !== 'CLOSED' && (
                  <Box sx={{ display: 'flex', gap: 1 }}>
                    <TextField
                      fullWidth
                      size="small"
                      placeholder="Write a reply..."
                      value={replyingTo === ticket.id ? replyMessage : ''}
                      onChange={(e) => {
                        setReplyingTo(ticket.id);
                        setReplyMessage(e.target.value);
                      }}
                      onFocus={() => setReplyingTo(ticket.id)}
                    />
                    <Button 
                      variant="contained" 
                      startIcon={<Send />}
                      onClick={() => handleReply(ticket.id)}
                      disabled={replyingTo !== ticket.id || !replyMessage.trim()}
                    >
                      Send
                    </Button>
                  </Box>
                )}
              </Collapse>
            </CardContent>
          </Card>
        ))}
      </Box>

      {/* Create Ticket Dialog */}
      <Dialog open={createOpen} onClose={() => setCreateOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Create Support Ticket</DialogTitle>
        <DialogContent>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, mt: 1 }}>
            <TextField
              label="Subject"
              fullWidth
              value={subject}
              onChange={(e) => setSubject(e.target.value)}
              placeholder="Brief description of your issue"
            />
            <TextField
              label="Description"
              fullWidth
              multiline
              rows={4}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Provide as much detail as possible..."
            />
            <FormControl fullWidth>
              <InputLabel>Priority</InputLabel>
              <Select
                value={priority}
                label="Priority"
                onChange={(e) => setPriority(e.target.value as TicketPriority)}
              >
                <MenuItem value="LOW">Low</MenuItem>
                <MenuItem value="MEDIUM">Medium</MenuItem>
                <MenuItem value="HIGH">High</MenuItem>
              </Select>
            </FormControl>
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setCreateOpen(false)}>Cancel</Button>
          <Button 
            variant="contained" 
            onClick={handleCreateTicket}
            disabled={!subject.trim() || !description.trim()}
          >
            Create Ticket
          </Button>
        </DialogActions>
      </Dialog>

      {/* Snackbar */}
      <Snackbar
        open={snackbar.open}
        autoHideDuration={4000}
        onClose={() => setSnackbar({ ...snackbar, open: false })}
      >
        <Alert severity={snackbar.severity} onClose={() => setSnackbar({ ...snackbar, open: false })}>
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default Support;

