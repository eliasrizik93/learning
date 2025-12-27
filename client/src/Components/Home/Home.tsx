import { Box, Button, Container, Typography, Grid, Card, CardContent } from '@mui/material';
import { School, Speed, Psychology, TrendingUp } from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import type { RootState } from '../../store/store';

const features = [
  {
    icon: <Psychology sx={{ fontSize: 48, color: '#667eea' }} />,
    title: 'Spaced Repetition',
    description: 'Our smart algorithm schedules reviews at optimal intervals to maximize long-term retention.',
  },
  {
    icon: <Speed sx={{ fontSize: 48, color: '#667eea' }} />,
    title: 'Learn Faster',
    description: 'Focus on what you need to learn. Skip what you already know.',
  },
  {
    icon: <TrendingUp sx={{ fontSize: 48, color: '#667eea' }} />,
    title: 'Track Progress',
    description: 'See your learning stats and watch your knowledge grow over time.',
  },
];

const Home = () => {
  const navigate = useNavigate();
  const isAuth = useSelector((state: RootState) => state.auth.isAuth);

  return (
    <Box sx={{ minHeight: '100vh', backgroundColor: '#f8fafc' }}>
      {/* Hero Section */}
      <Box
        sx={{
          background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
          color: 'white',
          py: { xs: 8, md: 12 },
          textAlign: 'center',
        }}
      >
        <Container maxWidth="md">
          <Box sx={{ display: 'flex', justifyContent: 'center', mb: 3 }}>
            <School sx={{ fontSize: 64 }} />
          </Box>
          <Typography
            variant="h2"
            sx={{
              fontWeight: 800,
              mb: 2,
              fontSize: { xs: '2.5rem', md: '3.5rem' },
              letterSpacing: '-1px',
            }}
          >
            FlashLearn
          </Typography>
          <Typography
            variant="h5"
            sx={{
              mb: 4,
              opacity: 0.9,
              fontWeight: 400,
              fontSize: { xs: '1.1rem', md: '1.5rem' },
              maxWidth: 600,
              mx: 'auto',
            }}
          >
            Master anything with smart flashcards powered by spaced repetition
          </Typography>
          <Box sx={{ display: 'flex', gap: 2, justifyContent: 'center', flexWrap: 'wrap' }}>
            {isAuth ? (
              <Button
                variant="contained"
                size="large"
                onClick={() => navigate('/flashcards')}
                sx={{
                  backgroundColor: 'white',
                  color: '#667eea',
                  fontWeight: 600,
                  px: 4,
                  py: 1.5,
                  borderRadius: 2,
                  textTransform: 'none',
                  fontSize: '1.1rem',
                  '&:hover': {
                    backgroundColor: '#f1f5f9',
                  },
                }}
              >
                Go to Flashcards
              </Button>
            ) : (
              <>
                <Button
                  variant="contained"
                  size="large"
                  onClick={() => navigate('/signup')}
                  sx={{
                    backgroundColor: 'white',
                    color: '#667eea',
                    fontWeight: 600,
                    px: 4,
                    py: 1.5,
                    borderRadius: 2,
                    textTransform: 'none',
                    fontSize: '1.1rem',
                    '&:hover': {
                      backgroundColor: '#f1f5f9',
                    },
                  }}
                >
                  Sign Up Free
                </Button>
                <Button
                  variant="outlined"
                  size="large"
                  onClick={() => navigate('/signin')}
                  sx={{
                    borderColor: 'white',
                    color: 'white',
                    fontWeight: 600,
                    px: 4,
                    py: 1.5,
                    borderRadius: 2,
                    textTransform: 'none',
                    fontSize: '1.1rem',
                    '&:hover': {
                      borderColor: 'white',
                      backgroundColor: 'rgba(255,255,255,0.1)',
                    },
                  }}
                >
                  Sign In
                </Button>
              </>
            )}
          </Box>
        </Container>
      </Box>

      {/* Features Section */}
      <Container maxWidth="lg" sx={{ py: { xs: 6, md: 10 } }}>
        <Typography
          variant="h4"
          sx={{
            textAlign: 'center',
            fontWeight: 700,
            mb: 6,
            color: '#1e293b',
          }}
        >
          Why FlashLearn?
        </Typography>
        <Grid container spacing={4}>
          {features.map((feature, index) => (
            <Grid size={{ xs: 12, md: 4 }} key={index}>
              <Card
                elevation={0}
                sx={{
                  height: '100%',
                  textAlign: 'center',
                  p: 3,
                  borderRadius: 3,
                  border: '1px solid #e2e8f0',
                  transition: 'all 0.3s ease',
                  '&:hover': {
                    transform: 'translateY(-4px)',
                    boxShadow: '0 12px 40px rgba(0,0,0,0.1)',
                  },
                }}
              >
                <CardContent>
                  <Box sx={{ mb: 2 }}>{feature.icon}</Box>
                  <Typography
                    variant="h6"
                    sx={{ fontWeight: 600, mb: 1, color: '#1e293b' }}
                  >
                    {feature.title}
                  </Typography>
                  <Typography variant="body2" sx={{ color: '#64748b' }}>
                    {feature.description}
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>
      </Container>

      {/* CTA Section */}
      <Box sx={{ backgroundColor: '#1e293b', py: { xs: 6, md: 8 } }}>
        <Container maxWidth="md" sx={{ textAlign: 'center' }}>
          <Typography
            variant="h4"
            sx={{ color: 'white', fontWeight: 700, mb: 2 }}
          >
            Ready to start learning?
          </Typography>
          <Typography
            variant="body1"
            sx={{ color: '#94a3b8', mb: 4, maxWidth: 500, mx: 'auto' }}
          >
            Join thousands of learners who use FlashLearn to master new skills and knowledge.
          </Typography>
          {!isAuth && (
            <Button
              variant="contained"
              size="large"
              onClick={() => navigate('/signup')}
              sx={{
                background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                fontWeight: 600,
                px: 4,
                py: 1.5,
                borderRadius: 2,
                textTransform: 'none',
                fontSize: '1.1rem',
              }}
            >
              Create Free Account
            </Button>
          )}
        </Container>
      </Box>

      {/* Footer */}
      <Box sx={{ py: 3, textAlign: 'center', borderTop: '1px solid #e2e8f0' }}>
        <Typography variant="body2" sx={{ color: '#64748b' }}>
          © 2024 FlashLearn. Built for learners.
        </Typography>
      </Box>
    </Box>
  );
};

export default Home;
