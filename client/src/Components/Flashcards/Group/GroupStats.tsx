import { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import {
  Box,
  Card,
  CardContent,
  CircularProgress,
  Chip,
  Stack,
} from '@mui/material';
import {
  School,
  Schedule,
  TrendingUp,
  CheckCircle,
} from '@mui/icons-material';
import type { AppDispatch, RootState } from '../../../store/store';
import { getGroupStats } from '../../../store/slices/cardSlice';

interface GroupStatsProps {
  groupId: string;
}

const GroupStats = ({ groupId }: GroupStatsProps) => {
  const dispatch = useDispatch<AppDispatch>();
  const { groupStats, isLoading } = useSelector(
    (state: RootState) => state.cards
  );

  useEffect(() => {
    dispatch(getGroupStats({ groupId }));
  }, [dispatch, groupId]);

  if (isLoading || !groupStats) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', p: 2 }}>
        <CircularProgress size={24} />
      </Box>
    );
  }

  const stats = [
    {
      label: 'Total Cards',
      value: groupStats.totalCards,
      icon: <School />,
      color: 'primary.main',
    },
    {
      label: 'Due Today',
      value: groupStats.dueCards,
      icon: <Schedule />,
      color: 'warning.main',
    },
    {
      label: 'New',
      value: groupStats.newCards,
      icon: <TrendingUp />,
      color: 'info.main',
    },
    {
      label: 'Learning',
      value: groupStats.learningCards,
      icon: <TrendingUp />,
      color: 'secondary.main',
    },
    {
      label: 'Mature',
      value: groupStats.matureCards,
      icon: <CheckCircle />,
      color: 'success.main',
    },
  ];

  return (
    <Card variant="outlined" sx={{ mb: 2 }}>
      <CardContent sx={{ py: 1.5 }}>
        <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap>
          {stats.map((stat) => (
            <Chip
              key={stat.label}
              icon={stat.icon}
              label={`${stat.label}: ${stat.value}`}
              variant="outlined"
              sx={{
                '& .MuiChip-icon': { color: stat.color },
              }}
            />
          ))}
        </Stack>
      </CardContent>
    </Card>
  );
};

export default GroupStats;
