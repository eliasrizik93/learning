import React, { Component, type ReactNode } from 'react';
import { Box, Typography, Button, Paper } from '@mui/material';
import { Error as ErrorIcon, Refresh } from '@mui/icons-material';

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
}

interface State {
  hasError: boolean;
  error?: Error;
}

export class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error('Error caught by boundary:', error, errorInfo);
  }

  handleRetry = () => {
    this.setState({ hasError: false, error: undefined });
  };

  render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback;
      }

      return (
        <Box
          sx={{
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            minHeight: '200px',
            p: 3,
          }}
        >
          <Paper
            elevation={2}
            sx={{
              p: 4,
              textAlign: 'center',
              maxWidth: 400,
              borderRadius: 2,
            }}
          >
            <ErrorIcon
              sx={{
                fontSize: 48,
                color: 'error.main',
                mb: 2,
              }}
            />
            <Typography variant='h6' gutterBottom>
              Something went wrong
            </Typography>
            <Typography variant='body2' color='text.secondary' sx={{ mb: 3 }}>
              {this.state.error?.message || 'An unexpected error occurred'}
            </Typography>
            <Button
              variant='contained'
              startIcon={<Refresh />}
              onClick={this.handleRetry}
              sx={{
                background: 'linear-gradient(45deg, #2196F3 30%, #21CBF3 90%)',
                '&:hover': {
                  background:
                    'linear-gradient(45deg, #1976D2 30%, #1CB5E0 90%)',
                },
              }}
            >
              Try Again
            </Button>
          </Paper>
        </Box>
      );
    }

    return this.props.children;
  }
}
