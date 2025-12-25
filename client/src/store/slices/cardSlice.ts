import {
  createAsyncThunk,
  createSlice,
  type PayloadAction,
} from '@reduxjs/toolkit';
import type { RootState } from '../store';
import { apiFetch } from '../../lib/apiFetch';
import type {
  Card,
  CardFormData,
  CardStats,
  GroupStats,
  ReviewResponse,
} from '../../types';

interface CardState {
  dueCards: Card[];
  currentStudyCards: Card[];
  currentCardIndex: number;
  cardStats: CardStats | null;
  groupStats: GroupStats | null;
  isLoading: boolean;
  isReviewing: boolean;
  error: string | null;
}

const initialState: CardState = {
  dueCards: [],
  currentStudyCards: [],
  currentCardIndex: 0,
  cardStats: null,
  groupStats: null,
  isLoading: false,
  isReviewing: false,
  error: null,
};

const parseApiError = async (res: Response): Promise<string> => {
  try {
    const data = await res.json();
    return data.message || data.error || `Error: ${res.status}`;
  } catch {
    return `Error: ${res.status} ${res.statusText}`;
  }
};

const handleAsyncError = (error: unknown): string => {
  if (error instanceof Error) return error.message;
  if (typeof error === 'string') return error;
  return 'An unexpected error occurred';
};

// Create a new card
export const createCard = createAsyncThunk<
  Card,
  { groupId: string } & CardFormData,
  { state: RootState; rejectValue: string }
>('cards/create', async (payload, thunkAPI) => {
  try {
    const res = await apiFetch(
      `/group/${payload.groupId}/card`,
      {
        method: 'POST',
        body: JSON.stringify({
          questionText: payload.questionText,
          questionType: payload.questionType || 'TEXT',
          questionMediaUrl: payload.questionMediaUrl,
          answerText: payload.answerText,
          answerType: payload.answerType || 'TEXT',
          answerMediaUrl: payload.answerMediaUrl,
        }),
      },
      thunkAPI.getState
    );
    if (!res.ok) return thunkAPI.rejectWithValue(await parseApiError(res));
    const { data } = await res.json();
    return data;
  } catch (e) {
    return thunkAPI.rejectWithValue(handleAsyncError(e));
  }
});

// Update a card
export const updateCard = createAsyncThunk<
  Card,
  { cardId: number } & CardFormData,
  { state: RootState; rejectValue: string }
>('cards/update', async (payload, thunkAPI) => {
  try {
    const res = await apiFetch(
      `/card/${payload.cardId}`,
      {
        method: 'PUT',
        body: JSON.stringify({
          questionText: payload.questionText,
          questionType: payload.questionType,
          questionMediaUrl: payload.questionMediaUrl,
          answerText: payload.answerText,
          answerType: payload.answerType,
          answerMediaUrl: payload.answerMediaUrl,
        }),
      },
      thunkAPI.getState
    );
    if (!res.ok) return thunkAPI.rejectWithValue(await parseApiError(res));
    const { data } = await res.json();
    return data;
  } catch (e) {
    return thunkAPI.rejectWithValue(handleAsyncError(e));
  }
});

// Delete a card
export const deleteCard = createAsyncThunk<
  number,
  { cardId: number },
  { state: RootState; rejectValue: string }
>('cards/delete', async (payload, thunkAPI) => {
  try {
    const res = await apiFetch(
      `/card/${payload.cardId}`,
      { method: 'DELETE' },
      thunkAPI.getState
    );
    if (!res.ok) return thunkAPI.rejectWithValue(await parseApiError(res));
    return payload.cardId;
  } catch (e) {
    return thunkAPI.rejectWithValue(handleAsyncError(e));
  }
});

// Get cards due for review
export const getDueCards = createAsyncThunk<
  Card[],
  { groupId?: string } | void,
  { state: RootState; rejectValue: string }
>('cards/getDue', async (payload, thunkAPI) => {
  try {
    const groupId = payload?.groupId;
    const url = groupId ? `/card/due?groupId=${groupId}` : '/card/due';
    const res = await apiFetch(url, { method: 'GET' }, thunkAPI.getState);
    if (!res.ok) return thunkAPI.rejectWithValue(await parseApiError(res));
    const { data } = await res.json();
    return data ?? [];
  } catch (e) {
    return thunkAPI.rejectWithValue(handleAsyncError(e));
  }
});

// Get due cards for a specific group
export const getGroupDueCards = createAsyncThunk<
  Card[],
  { groupId: string },
  { state: RootState; rejectValue: string }
>('cards/getGroupDue', async (payload, thunkAPI) => {
  try {
    const res = await apiFetch(
      `/group/${payload.groupId}/due`,
      { method: 'GET' },
      thunkAPI.getState
    );
    if (!res.ok) return thunkAPI.rejectWithValue(await parseApiError(res));
    const { data } = await res.json();
    return data ?? [];
  } catch (e) {
    return thunkAPI.rejectWithValue(handleAsyncError(e));
  }
});

// Get ALL cards for a group (for practice mode)
export const getGroupAllCards = createAsyncThunk<
  Card[],
  { groupId: string },
  { state: RootState; rejectValue: string }
>('cards/getGroupAll', async (payload, thunkAPI) => {
  try {
    const res = await apiFetch(
      `/group/${payload.groupId}/cards`,
      { method: 'GET' },
      thunkAPI.getState
    );
    if (!res.ok) return thunkAPI.rejectWithValue(await parseApiError(res));
    const { data } = await res.json();
    return data ?? [];
  } catch (e) {
    return thunkAPI.rejectWithValue(handleAsyncError(e));
  }
});

// Review a card (EASY, HARD, AGAIN)
export const reviewCard = createAsyncThunk<
  Card,
  { cardId: number; response: ReviewResponse },
  { state: RootState; rejectValue: string }
>('cards/review', async (payload, thunkAPI) => {
  try {
    const res = await apiFetch(
      '/card/review',
      {
        method: 'POST',
        body: JSON.stringify({
          cardId: payload.cardId,
          response: payload.response,
        }),
      },
      thunkAPI.getState
    );
    if (!res.ok) return thunkAPI.rejectWithValue(await parseApiError(res));
    const { data } = await res.json();
    return data;
  } catch (e) {
    return thunkAPI.rejectWithValue(handleAsyncError(e));
  }
});

// Get card statistics
export const getCardStats = createAsyncThunk<
  CardStats,
  { cardId: number },
  { state: RootState; rejectValue: string }
>('cards/getStats', async (payload, thunkAPI) => {
  try {
    const res = await apiFetch(
      `/card/${payload.cardId}/stats`,
      { method: 'GET' },
      thunkAPI.getState
    );
    if (!res.ok) return thunkAPI.rejectWithValue(await parseApiError(res));
    const { data } = await res.json();
    return data;
  } catch (e) {
    return thunkAPI.rejectWithValue(handleAsyncError(e));
  }
});

// Get group statistics
export const getGroupStats = createAsyncThunk<
  GroupStats,
  { groupId: string },
  { state: RootState; rejectValue: string }
>('cards/getGroupStats', async (payload, thunkAPI) => {
  try {
    const res = await apiFetch(
      `/group/${payload.groupId}/stats`,
      { method: 'GET' },
      thunkAPI.getState
    );
    if (!res.ok) return thunkAPI.rejectWithValue(await parseApiError(res));
    const { data } = await res.json();
    return data;
  } catch (e) {
    return thunkAPI.rejectWithValue(handleAsyncError(e));
  }
});

// Reset group progress (forget all learning, start fresh)
export const resetGroupProgress = createAsyncThunk<
  void,
  { groupId: string },
  { state: RootState; rejectValue: string }
>('cards/resetGroupProgress', async (payload, thunkAPI) => {
  try {
    const res = await apiFetch(
      `/group/${payload.groupId}/reset`,
      { method: 'POST' },
      thunkAPI.getState
    );
    if (!res.ok) return thunkAPI.rejectWithValue(await parseApiError(res));
  } catch (e) {
    return thunkAPI.rejectWithValue(handleAsyncError(e));
  }
});

const cardSlice = createSlice({
  name: 'cards',
  initialState,
  reducers: {
    setCurrentCardIndex: (state, action: PayloadAction<number>) => {
      state.currentCardIndex = action.payload;
    },
    nextCard: (state) => {
      if (state.currentCardIndex < state.currentStudyCards.length - 1) {
        state.currentCardIndex += 1;
      }
    },
    // For practice mode - removes current card without API call
    skipCard: (state) => {
      if (state.currentStudyCards.length > 0) {
        state.currentStudyCards = state.currentStudyCards.filter(
          (_, index) => index !== state.currentCardIndex
        );
        if (state.currentCardIndex >= state.currentStudyCards.length) {
          state.currentCardIndex = Math.max(0, state.currentStudyCards.length - 1);
        }
      }
    },
    prevCard: (state) => {
      if (state.currentCardIndex > 0) {
        state.currentCardIndex -= 1;
      }
    },
    startStudySession: (state, action: PayloadAction<Card[]>) => {
      state.currentStudyCards = action.payload;
      state.currentCardIndex = 0;
    },
    endStudySession: (state) => {
      state.currentStudyCards = [];
      state.currentCardIndex = 0;
    },
    clearError: (state) => {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      // Create card
      .addCase(createCard.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(createCard.fulfilled, (state) => {
        state.isLoading = false;
      })
      .addCase(createCard.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload ?? 'Failed to create card';
      })
      // Update card
      .addCase(updateCard.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(updateCard.fulfilled, (state, action) => {
        state.isLoading = false;
        // Update in study cards if present
        const idx = state.currentStudyCards.findIndex(
          (c) => c.id === action.payload.id
        );
        if (idx !== -1) {
          state.currentStudyCards[idx] = action.payload;
        }
      })
      .addCase(updateCard.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload ?? 'Failed to update card';
      })
      // Delete card
      .addCase(deleteCard.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(deleteCard.fulfilled, (state, action) => {
        state.isLoading = false;
        state.dueCards = state.dueCards.filter((c) => c.id !== action.payload);
        state.currentStudyCards = state.currentStudyCards.filter(
          (c) => c.id !== action.payload
        );
      })
      .addCase(deleteCard.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload ?? 'Failed to delete card';
      })
      // Get due cards
      .addCase(getDueCards.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(getDueCards.fulfilled, (state, action) => {
        state.isLoading = false;
        state.dueCards = action.payload;
      })
      .addCase(getDueCards.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload ?? 'Failed to fetch due cards';
      })
      // Get group due cards
      .addCase(getGroupDueCards.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(getGroupDueCards.fulfilled, (state, action) => {
        state.isLoading = false;
        state.dueCards = action.payload;
        state.currentStudyCards = action.payload;
        state.currentCardIndex = 0;
      })
      .addCase(getGroupDueCards.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload ?? 'Failed to fetch group due cards';
      })
      // Get all cards for a group (practice mode)
      .addCase(getGroupAllCards.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(getGroupAllCards.fulfilled, (state, action) => {
        state.isLoading = false;
        state.currentStudyCards = action.payload;
        state.currentCardIndex = 0;
      })
      .addCase(getGroupAllCards.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload ?? 'Failed to fetch group cards';
      })
      // Review card - uses isReviewing for better UX (doesn't block entire UI)
      .addCase(reviewCard.pending, (state) => {
        state.isReviewing = true;
        state.error = null;
      })
      .addCase(reviewCard.fulfilled, (state, action) => {
        state.isReviewing = false;
        // Remove reviewed card from current study session
        state.currentStudyCards = state.currentStudyCards.filter(
          (c) => c.id !== action.payload.id
        );
        state.dueCards = state.dueCards.filter(
          (c) => c.id !== action.payload.id
        );
        // Adjust index if needed
        if (state.currentCardIndex >= state.currentStudyCards.length) {
          state.currentCardIndex = Math.max(0, state.currentStudyCards.length - 1);
        }
      })
      .addCase(reviewCard.rejected, (state, action) => {
        state.isReviewing = false;
        state.error = action.payload ?? 'Failed to review card';
      })
      // Get card stats
      .addCase(getCardStats.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(getCardStats.fulfilled, (state, action) => {
        state.isLoading = false;
        state.cardStats = action.payload;
      })
      .addCase(getCardStats.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload ?? 'Failed to fetch card stats';
      })
      // Get group stats
      .addCase(getGroupStats.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(getGroupStats.fulfilled, (state, action) => {
        state.isLoading = false;
        state.groupStats = action.payload;
      })
      .addCase(getGroupStats.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload ?? 'Failed to fetch group stats';
      });
  },
});

export const {
  setCurrentCardIndex,
  nextCard,
  skipCard,
  prevCard,
  startStudySession,
  endStudySession,
  clearError,
} = cardSlice.actions;

export default cardSlice.reducer;
