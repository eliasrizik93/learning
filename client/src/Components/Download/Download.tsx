import { useEffect, useState } from 'react';
import {
  Box,
  Typography,
  Card,
  CardContent,
  Button,
  Chip,
  Grid,
  CircularProgress,
  Alert,
  Snackbar,
  Divider,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Paper,
  Accordion,
  AccordionSummary,
  AccordionDetails,
} from '@mui/material';
import {
  Download as DownloadIcon,
  Computer,
  Apple,
  Code,
  CheckCircle,
  ExpandMore,
  Security,
  Speed,
  Keyboard,
  MusicNote,
  Screenshot,
  School,
} from '@mui/icons-material';

interface DownloadableFile {
  id: string;
  name: string;
  displayName: string;
  description: string;
  version: string;
  fileName: string;
  fileSize: number;
  sha256?: string;
  supportedOS: string[];
  requirements: string[];
}

const BASE_URL = 'http://localhost:3000';

const formatFileSize = (bytes: number): string => {
  if (bytes === 0) return '0 Bytes';
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
};

const OSIcon = ({ os }: { os: string }) => {
  switch (os.toLowerCase()) {
    case 'windows':
      return <Computer />;
    case 'macos':
      return <Apple />;
    case 'linux':
      return <Code />;
    default:
      return <Computer />;
  }
};

const Download = () => {
  const [downloads, setDownloads] = useState<DownloadableFile[]>([]);
  const [loading, setLoading] = useState(true);
  const [downloading, setDownloading] = useState<string | null>(null);
  const [snackbar, setSnackbar] = useState<{ open: boolean; message: string; severity: 'success' | 'error' }>({
    open: false,
    message: '',
    severity: 'success',
  });

  useEffect(() => {
    fetchDownloads();
  }, []);

  const fetchDownloads = async () => {
    try {
      const res = await fetch(`${BASE_URL}/download/list`);
      const { data } = await res.json();
      setDownloads(data || []);
    } catch (e) {
      console.error('Failed to fetch downloads:', e);
    } finally {
      setLoading(false);
    }
  };

  const handleDownload = async (fileId: string, fileName: string) => {
    setDownloading(fileId);
    try {
      const res = await fetch(`${BASE_URL}/download/file/${fileId}`);
      
      if (!res.ok) {
        throw new Error('Download failed');
      }

      const blob = await res.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = fileName;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);

      setSnackbar({ open: true, message: 'Download started!', severity: 'success' });
    } catch (e) {
      setSnackbar({ open: true, message: 'Download failed. Please try again.', severity: 'error' });
    } finally {
      setDownloading(null);
    }
  };

  const features = [
    { icon: <MusicNote />, title: 'Audio Capture', desc: 'Record audio from any application in real-time' },
    { icon: <Screenshot />, title: 'Screenshot Capture', desc: 'Take screenshots with customizable regions' },
    { icon: <Keyboard />, title: 'Hotkey Support', desc: 'Create flashcards instantly with keyboard shortcuts' },
    { icon: <School />, title: 'Anki Integration', desc: 'Export directly to Anki deck format (.apkg)' },
    { icon: <Speed />, title: 'Fast & Lightweight', desc: 'Minimal resource usage, runs in the background' },
    { icon: <Security />, title: 'Privacy First', desc: 'All processing happens locally on your machine' },
  ];

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '60vh' }}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box sx={{ minHeight: '100vh', bgcolor: 'grey.50' }}>
      {/* Hero Section */}
      <Box
        sx={{
          background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
          color: 'white',
          py: 8,
          px: 3,
          textAlign: 'center',
        }}
      >
        <Typography variant="h2" fontWeight={800} gutterBottom>
          Anki Capture Studio
        </Typography>
        <Typography variant="h5" sx={{ opacity: 0.9, maxWidth: 700, mx: 'auto', mb: 4 }}>
          Create flashcards from audio and screenshots with a single hotkey
        </Typography>
        <Box sx={{ display: 'flex', gap: 2, justifyContent: 'center', flexWrap: 'wrap' }}>
          <Chip icon={<Computer />} label="Windows" sx={{ bgcolor: 'rgba(255,255,255,0.2)', color: 'white' }} />
          <Chip icon={<Apple />} label="macOS" sx={{ bgcolor: 'rgba(255,255,255,0.2)', color: 'white' }} />
          <Chip icon={<Code />} label="Linux" sx={{ bgcolor: 'rgba(255,255,255,0.2)', color: 'white' }} />
        </Box>
      </Box>

      {/* Main Content */}
      <Box sx={{ maxWidth: 1200, mx: 'auto', p: 4 }}>
        {/* Features Grid */}
        <Typography variant="h4" fontWeight={700} textAlign="center" gutterBottom sx={{ mb: 4 }}>
          Features
        </Typography>
        <Grid container spacing={3} sx={{ mb: 6 }}>
          {features.map((feature, idx) => (
            <Grid item xs={12} sm={6} md={4} key={idx}>
              <Paper elevation={0} sx={{ p: 3, height: '100%', bgcolor: 'white', borderRadius: 3 }}>
                <Box sx={{ color: 'primary.main', mb: 2 }}>{feature.icon}</Box>
                <Typography variant="h6" fontWeight={600} gutterBottom>
                  {feature.title}
                </Typography>
                <Typography color="text.secondary">{feature.desc}</Typography>
              </Paper>
            </Grid>
          ))}
        </Grid>

        {/* Download Cards */}
        <Typography variant="h4" fontWeight={700} textAlign="center" gutterBottom sx={{ mb: 4 }}>
          Download
        </Typography>

        {downloads.length === 0 ? (
          <Alert severity="info" sx={{ maxWidth: 600, mx: 'auto' }}>
            No downloads available at the moment. Please check back later.
          </Alert>
        ) : (
          <Grid container spacing={4} justifyContent="center">
            {downloads.map((download) => (
              <Grid item xs={12} md={8} key={download.id}>
                <Card elevation={3} sx={{ borderRadius: 3 }}>
                  <CardContent sx={{ p: 4 }}>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 3 }}>
                      <Box>
                        <Typography variant="h5" fontWeight={700}>
                          {download.displayName}
                        </Typography>
                        <Chip label={`v${download.version}`} size="small" sx={{ mt: 1 }} />
                      </Box>
                      <Button
                        variant="contained"
                        size="large"
                        startIcon={downloading === download.id ? <CircularProgress size={20} color="inherit" /> : <DownloadIcon />}
                        onClick={() => handleDownload(download.id, download.fileName)}
                        disabled={downloading !== null}
                        sx={{
                          px: 4,
                          py: 1.5,
                          borderRadius: 2,
                          textTransform: 'none',
                          fontSize: '1.1rem',
                        }}
                      >
                        {downloading === download.id ? 'Downloading...' : 'Download'}
                      </Button>
                    </Box>

                    <Typography color="text.secondary" paragraph>
                      {download.description}
                    </Typography>

                    <Divider sx={{ my: 3 }} />

                    <Grid container spacing={4}>
                      {/* File Info */}
                      <Grid item xs={12} sm={6}>
                        <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                          File Information
                        </Typography>
                        <List dense disablePadding>
                          <ListItem disablePadding sx={{ py: 0.5 }}>
                            <ListItemText
                              primary="File Name"
                              secondary={download.fileName}
                            />
                          </ListItem>
                          <ListItem disablePadding sx={{ py: 0.5 }}>
                            <ListItemText
                              primary="Size"
                              secondary={download.fileSize > 0 ? formatFileSize(download.fileSize) : 'Calculating...'}
                            />
                          </ListItem>
                          {download.sha256 && (
                            <ListItem disablePadding sx={{ py: 0.5 }}>
                              <ListItemText
                                primary="SHA256 Checksum"
                                secondary={
                                  <Typography
                                    variant="caption"
                                    sx={{
                                      fontFamily: 'monospace',
                                      wordBreak: 'break-all',
                                      display: 'block',
                                      mt: 0.5,
                                    }}
                                  >
                                    {download.sha256}
                                  </Typography>
                                }
                              />
                            </ListItem>
                          )}
                        </List>
                      </Grid>

                      {/* Supported OS */}
                      <Grid item xs={12} sm={6}>
                        <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                          Supported Operating Systems
                        </Typography>
                        <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap', mb: 2 }}>
                          {download.supportedOS.map((os) => (
                            <Chip
                              key={os}
                              icon={<OSIcon os={os} />}
                              label={os}
                              variant="outlined"
                              size="small"
                            />
                          ))}
                        </Box>

                        <Typography variant="subtitle2" color="text.secondary" gutterBottom sx={{ mt: 2 }}>
                          Requirements
                        </Typography>
                        <List dense disablePadding>
                          {download.requirements.map((req, idx) => (
                            <ListItem key={idx} disablePadding sx={{ py: 0.25 }}>
                              <ListItemIcon sx={{ minWidth: 28 }}>
                                <CheckCircle fontSize="small" color="success" />
                              </ListItemIcon>
                              <ListItemText primary={req} />
                            </ListItem>
                          ))}
                        </List>
                      </Grid>
                    </Grid>
                  </CardContent>
                </Card>
              </Grid>
            ))}
          </Grid>
        )}

        {/* Installation Instructions */}
        <Box sx={{ mt: 6, maxWidth: 800, mx: 'auto' }}>
          <Typography variant="h5" fontWeight={700} gutterBottom>
            Installation Instructions
          </Typography>

          <Accordion defaultExpanded>
            <AccordionSummary expandIcon={<ExpandMore />}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <Computer />
                <Typography fontWeight={600}>Windows</Typography>
              </Box>
            </AccordionSummary>
            <AccordionDetails>
              <List dense>
                <ListItem>1. Download and extract the ZIP file</ListItem>
                <ListItem>2. Open a terminal in the extracted folder</ListItem>
                <ListItem>3. Run: <code>pip install -r requirements.txt</code></ListItem>
                <ListItem>4. Run: <code>python src/main.py</code></ListItem>
              </List>
            </AccordionDetails>
          </Accordion>

          <Accordion>
            <AccordionSummary expandIcon={<ExpandMore />}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <Apple />
                <Typography fontWeight={600}>macOS</Typography>
              </Box>
            </AccordionSummary>
            <AccordionDetails>
              <List dense>
                <ListItem>1. Download and extract the ZIP file</ListItem>
                <ListItem>2. Open Terminal in the extracted folder</ListItem>
                <ListItem>3. Run: <code>pip3 install -r requirements.txt</code></ListItem>
                <ListItem>4. Run: <code>python3 src/main.py</code></ListItem>
                <ListItem>5. Grant necessary permissions for screen/audio capture</ListItem>
              </List>
            </AccordionDetails>
          </Accordion>

          <Accordion>
            <AccordionSummary expandIcon={<ExpandMore />}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <Code />
                <Typography fontWeight={600}>Linux</Typography>
              </Box>
            </AccordionSummary>
            <AccordionDetails>
              <List dense>
                <ListItem>1. Download and extract the ZIP file</ListItem>
                <ListItem>2. Open a terminal in the extracted folder</ListItem>
                <ListItem>3. Install system dependencies: <code>sudo apt install python3-tk</code></ListItem>
                <ListItem>4. Run: <code>pip3 install -r requirements.txt</code></ListItem>
                <ListItem>5. Run: <code>python3 src/main.py</code></ListItem>
              </List>
            </AccordionDetails>
          </Accordion>
        </Box>

        {/* Hotkeys Section */}
        <Box sx={{ mt: 6, maxWidth: 800, mx: 'auto' }}>
          <Typography variant="h5" fontWeight={700} gutterBottom>
            Default Hotkeys
          </Typography>
          <Paper elevation={0} sx={{ p: 3, bgcolor: 'grey.100', borderRadius: 2 }}>
            <Grid container spacing={2}>
              <Grid item xs={6} sm={4}>
                <Typography variant="subtitle2" color="text.secondary">Audio → Image</Typography>
                <Chip label="F9" sx={{ fontFamily: 'monospace', fontWeight: 700 }} />
              </Grid>
              <Grid item xs={6} sm={4}>
                <Typography variant="subtitle2" color="text.secondary">Image → Audio</Typography>
                <Chip label="F10" sx={{ fontFamily: 'monospace', fontWeight: 700 }} />
              </Grid>
              <Grid item xs={6} sm={4}>
                <Typography variant="subtitle2" color="text.secondary">Both Directions</Typography>
                <Chip label="F11" sx={{ fontFamily: 'monospace', fontWeight: 700 }} />
              </Grid>
              <Grid item xs={6} sm={4}>
                <Typography variant="subtitle2" color="text.secondary">Audio → Video</Typography>
                <Chip label="F12" sx={{ fontFamily: 'monospace', fontWeight: 700 }} />
              </Grid>
              <Grid item xs={6} sm={4}>
                <Typography variant="subtitle2" color="text.secondary">Audio → Screenshots</Typography>
                <Chip label="F8" sx={{ fontFamily: 'monospace', fontWeight: 700 }} />
              </Grid>
            </Grid>
          </Paper>
        </Box>
      </Box>

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

export default Download;

