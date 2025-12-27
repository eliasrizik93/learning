import { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import {
  Box,
  Typography,
  TextField,
  Card,
  CardContent,
  CardActions,
  Button,
  Grid,
  Chip,
  InputAdornment,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Pagination,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  CircularProgress,
  Alert,
  Snackbar,
} from '@mui/material';
import {
  Search,
  Public,
  Add,
  Style,
  Language,
  Person,
} from '@mui/icons-material';
import type { AppDispatch, RootState } from '../../store/store';
import {
  searchPublicGroups,
  fetchLanguages,
  fetchPopularTags,
  getGroupPreview,
  copyPublicGroup,
  checkAddedGroups,
  clearPreview,
} from '../../store/slices/discoverSlice';
import { getAllGroups } from '../../store/slices/groupSlice';

const Discover = () => {
  const dispatch = useDispatch<AppDispatch>();
  const { groups, pagination, languages, popularTags, currentPreview, isLoading, addedGroups } = useSelector(
    (state: RootState) => state.discover
  );
  const isAuth = useSelector((state: RootState) => state.auth.isAuth);

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedLanguage, setSelectedLanguage] = useState('');
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [previewOpen, setPreviewOpen] = useState(false);
  const [copying, setCopying] = useState<string | null>(null);
  const [snackbar, setSnackbar] = useState<{ open: boolean; message: string; severity: 'success' | 'error' }>({
    open: false,
    message: '',
    severity: 'success',
  });

  useEffect(() => {
    dispatch(searchPublicGroups({}));
    dispatch(fetchLanguages());
    dispatch(fetchPopularTags());
  }, [dispatch]);

  // Check which groups user has already added
  useEffect(() => {
    if (isAuth && groups.length > 0) {
      const groupIds = groups.map((g) => g.id);
      dispatch(checkAddedGroups(groupIds));
    }
  }, [dispatch, isAuth, groups]);

  const handleSearch = () => {
    dispatch(searchPublicGroups({
      query: searchQuery || undefined,
      language: selectedLanguage || undefined,
      tags: selectedTags.length > 0 ? selectedTags : undefined,
      page: 1,
    }));
  };

  const handlePageChange = (_: unknown, page: number) => {
    dispatch(searchPublicGroups({
      query: searchQuery || undefined,
      language: selectedLanguage || undefined,
      tags: selectedTags.length > 0 ? selectedTags : undefined,
      page,
    }));
  };

  const handleTagClick = (tag: string) => {
    if (selectedTags.includes(tag)) {
      setSelectedTags(selectedTags.filter((t) => t !== tag));
    } else {
      setSelectedTags([...selectedTags, tag]);
    }
  };

  const handlePreview = (groupId: string) => {
    dispatch(getGroupPreview(groupId));
    setPreviewOpen(true);
  };

  const handleClosePreview = () => {
    setPreviewOpen(false);
    dispatch(clearPreview());
  };

  const handleAddGroup = async (groupId: string) => {
    if (!isAuth) {
      setSnackbar({ open: true, message: 'Please sign in to add groups', severity: 'error' });
      return;
    }

    // Check if already added
    if (addedGroups[groupId]) {
      setSnackbar({ open: true, message: 'You have already added this group', severity: 'error' });
      return;
    }

    setCopying(groupId);
    try {
      const result = await dispatch(copyPublicGroup(groupId)).unwrap();
      if (result) {
        setSnackbar({ open: true, message: 'Group added to your collection!', severity: 'success' });
        dispatch(getAllGroups());
        handleClosePreview();
      }
    } catch (err: unknown) {
      const error = err as { message?: string; alreadyExists?: boolean };
      if (error.alreadyExists) {
        setSnackbar({ open: true, message: 'You have already added this group', severity: 'error' });
      } else {
        setSnackbar({ open: true, message: error.message || 'Failed to add group', severity: 'error' });
      }
    } finally {
      setCopying(null);
    }
  };

  return (
    <Box sx={{ p: 3, maxWidth: 1200, mx: 'auto' }}>
      <Box sx={{ mb: 4 }}>
        <Typography variant="h4" fontWeight={700} gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <Public color="primary" />
          Discover Public Groups
        </Typography>
        <Typography color="text.secondary">
          Find and add flashcard groups created by the community
        </Typography>
      </Box>

      {/* Search and Filters */}
      <Box sx={{ mb: 4, display: 'flex', gap: 2, flexWrap: 'wrap' }}>
        <TextField
          placeholder="Search groups..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <Search />
              </InputAdornment>
            ),
          }}
          sx={{ flexGrow: 1, minWidth: 200 }}
        />

        <FormControl sx={{ minWidth: 150 }}>
          <InputLabel>Language</InputLabel>
          <Select
            value={selectedLanguage}
            onChange={(e) => setSelectedLanguage(e.target.value)}
            label="Language"
          >
            <MenuItem value="">All Languages</MenuItem>
            {languages.map((lang) => (
              <MenuItem key={lang} value={lang}>{lang}</MenuItem>
            ))}
          </Select>
        </FormControl>

        <Button variant="contained" onClick={handleSearch} startIcon={<Search />}>
          Search
        </Button>
      </Box>

      {/* Popular Tags */}
      {popularTags.length > 0 && (
        <Box sx={{ mb: 3 }}>
          <Typography variant="subtitle2" color="text.secondary" gutterBottom>
            Popular Tags:
          </Typography>
          <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
            {popularTags.slice(0, 12).map(({ tag, count }) => (
              <Chip
                key={tag}
                label={`${tag} (${count})`}
                onClick={() => handleTagClick(tag)}
                color={selectedTags.includes(tag) ? 'primary' : 'default'}
                variant={selectedTags.includes(tag) ? 'filled' : 'outlined'}
                size="small"
              />
            ))}
          </Box>
        </Box>
      )}

      {/* Loading */}
      {isLoading && (
        <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
          <CircularProgress />
        </Box>
      )}

      {/* Groups Grid */}
      {!isLoading && (
        <Grid container spacing={3}>
          {groups.map((group) => (
            <Grid item xs={12} sm={6} md={4} key={group.id}>
              <Card 
                sx={{ 
                  height: '100%', 
                  display: 'flex', 
                  flexDirection: 'column',
                  transition: 'transform 0.2s, box-shadow 0.2s',
                  '&:hover': {
                    transform: 'translateY(-4px)',
                    boxShadow: 4,
                  },
                }}
              >
                <CardContent sx={{ flexGrow: 1 }}>
                  <Typography variant="h6" fontWeight={600} gutterBottom noWrap>
                    {group.name}
                  </Typography>
                  
                  {group.description && (
                    <Typography 
                      variant="body2" 
                      color="text.secondary" 
                      sx={{ 
                        mb: 2,
                        display: '-webkit-box',
                        WebkitLineClamp: 2,
                        WebkitBoxOrient: 'vertical',
                        overflow: 'hidden',
                      }}
                    >
                      {group.description}
                    </Typography>
                  )}

                  <Box sx={{ display: 'flex', gap: 1, mb: 2, flexWrap: 'wrap' }}>
                    <Chip 
                      icon={<Style />} 
                      label={`${group.cardCount} cards`} 
                      size="small" 
                      variant="outlined" 
                    />
                    {group.language && (
                      <Chip 
                        icon={<Language />} 
                        label={group.language} 
                        size="small" 
                        variant="outlined" 
                      />
                    )}
                  </Box>

                  {group.tags && group.tags.length > 0 && (
                    <Box sx={{ display: 'flex', gap: 0.5, flexWrap: 'wrap' }}>
                      {group.tags.slice(0, 3).map((tag) => (
                        <Chip key={tag} label={tag} size="small" />
                      ))}
                      {group.tags.length > 3 && (
                        <Chip label={`+${group.tags.length - 3}`} size="small" variant="outlined" />
                      )}
                    </Box>
                  )}
                </CardContent>

                <Box sx={{ px: 2, pb: 1 }}>
                  <Typography variant="caption" color="text.secondary" sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                    <Person fontSize="inherit" />
                    {group.creator.name}
                  </Typography>
                </Box>

                <CardActions>
                  <Button size="small" onClick={() => handlePreview(group.id)}>
                    Preview
                  </Button>
                  {addedGroups[group.id] ? (
                    <Button 
                      size="small" 
                      variant="outlined" 
                      color="success"
                      disabled
                    >
                      ✓ Added
                    </Button>
                  ) : (
                    <Button 
                      size="small" 
                      variant="contained" 
                      startIcon={copying === group.id ? undefined : <Add />}
                      onClick={() => handleAddGroup(group.id)}
                      disabled={copying !== null}
                    >
                      {copying === group.id ? 'Adding...' : 'Add'}
                    </Button>
                  )}
                </CardActions>
              </Card>
            </Grid>
          ))}
        </Grid>
      )}

      {/* No Results */}
      {!isLoading && groups.length === 0 && (
        <Box sx={{ textAlign: 'center', py: 8 }}>
          <Public sx={{ fontSize: 64, color: 'text.disabled', mb: 2 }} />
          <Typography variant="h6" color="text.secondary">
            No public groups found
          </Typography>
          <Typography color="text.disabled">
            Try a different search or check back later
          </Typography>
        </Box>
      )}

      {/* Pagination */}
      {pagination.totalPages > 1 && (
        <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}>
          <Pagination
            count={pagination.totalPages}
            page={pagination.page}
            onChange={handlePageChange}
            color="primary"
          />
        </Box>
      )}

      {/* Preview Dialog */}
      <Dialog open={previewOpen} onClose={handleClosePreview} maxWidth="sm" fullWidth>
        {currentPreview && (
          <>
            <DialogTitle sx={{ pb: 1 }}>
              <Typography variant="h5" fontWeight={600}>
                {currentPreview.name}
              </Typography>
            </DialogTitle>
            <DialogContent>
              {currentPreview.description && (
                <Typography color="text.secondary" paragraph>
                  {currentPreview.description}
                </Typography>
              )}

              <Box sx={{ display: 'flex', gap: 2, mb: 3 }}>
                <Chip icon={<Style />} label={`${currentPreview.cardCount} cards`} />
                {currentPreview.language && (
                  <Chip icon={<Language />} label={currentPreview.language} />
                )}
                <Chip icon={<Person />} label={currentPreview.creator.name} variant="outlined" />
              </Box>

              {currentPreview.tags && currentPreview.tags.length > 0 && (
                <Box sx={{ mb: 3 }}>
                  <Typography variant="subtitle2" gutterBottom>Tags:</Typography>
                  <Box sx={{ display: 'flex', gap: 0.5, flexWrap: 'wrap' }}>
                    {currentPreview.tags.map((tag) => (
                      <Chip key={tag} label={tag} size="small" />
                    ))}
                  </Box>
                </Box>
              )}

              {currentPreview.sampleCards && currentPreview.sampleCards.length > 0 && (
                <Box>
                  <Typography variant="subtitle2" gutterBottom>Sample Cards:</Typography>
                  <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                    {currentPreview.sampleCards.map((card) => (
                      <Box 
                        key={card.id} 
                        sx={{ 
                          p: 1.5, 
                          bgcolor: 'grey.100', 
                          borderRadius: 1,
                          borderLeft: '3px solid',
                          borderColor: 'primary.main',
                        }}
                      >
                        <Typography variant="body2">
                          {card.questionText || 'Media card'}
                        </Typography>
                      </Box>
                    ))}
                  </Box>
                </Box>
              )}
            </DialogContent>
            <DialogActions>
              <Button onClick={handleClosePreview}>Close</Button>
              {addedGroups[currentPreview.id] ? (
                <Button 
                  variant="outlined" 
                  color="success"
                  disabled
                >
                  ✓ Already Added
                </Button>
              ) : (
                <Button 
                  variant="contained" 
                  startIcon={copying === currentPreview.id ? undefined : <Add />}
                  onClick={() => handleAddGroup(currentPreview.id)}
                  disabled={copying !== null}
                >
                  {copying === currentPreview.id ? 'Adding...' : 'Add to My Groups'}
                </Button>
              )}
            </DialogActions>
          </>
        )}
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

export default Discover;

