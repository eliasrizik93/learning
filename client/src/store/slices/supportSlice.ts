import { createAsyncThunk, createSlice } from '@reduxjs/toolkit';
import type { RootState } from '../store';
import { apiFetch } from '../../lib/apiFetch';
import type { SupportTicket, TicketPriority, TicketStatus } from '../../types';

interface SupportState {
  tickets: SupportTicket[];
  currentTicket: SupportTicket | null;
  isLoading: boolean;
  error: string | null;
}

const initialState: SupportState = {
  tickets: [],
  currentTicket: null,
  isLoading: false,
  error: null,
};

export const createTicket = createAsyncThunk<
  SupportTicket,
  { subject: string; description: string; priority?: TicketPriority },
  { state: RootState; rejectValue: string }
>('support/createTicket', async (payload, thunkAPI) => {
  try {
    const res = await apiFetch(
      '/support/ticket',
      { method: 'POST', body: JSON.stringify(payload) },
      thunkAPI.getState
    );
    if (!res.ok) {
      const data = await res.json();
      return thunkAPI.rejectWithValue(data.message || 'Failed to create ticket');
    }
    const { data } = await res.json();
    return data;
  } catch (e) {
    return thunkAPI.rejectWithValue('Failed to create ticket');
  }
});

export const fetchUserTickets = createAsyncThunk<
  SupportTicket[],
  void,
  { state: RootState; rejectValue: string }
>('support/fetchUserTickets', async (_, thunkAPI) => {
  try {
    const res = await apiFetch('/support/tickets', { method: 'GET' }, thunkAPI.getState);
    if (!res.ok) return thunkAPI.rejectWithValue('Failed to fetch tickets');
    const { data } = await res.json();
    return data;
  } catch (e) {
    return thunkAPI.rejectWithValue('Failed to fetch tickets');
  }
});

export const fetchAllTickets = createAsyncThunk<
  SupportTicket[],
  void,
  { state: RootState; rejectValue: string }
>('support/fetchAllTickets', async (_, thunkAPI) => {
  try {
    const res = await apiFetch('/support/tickets/all', { method: 'GET' }, thunkAPI.getState);
    if (!res.ok) return thunkAPI.rejectWithValue('Failed to fetch tickets');
    const { data } = await res.json();
    return data;
  } catch (e) {
    return thunkAPI.rejectWithValue('Failed to fetch tickets');
  }
});

export const fetchTicket = createAsyncThunk<
  SupportTicket,
  string,
  { state: RootState; rejectValue: string }
>('support/fetchTicket', async (ticketId, thunkAPI) => {
  try {
    const res = await apiFetch(`/support/ticket/${ticketId}`, { method: 'GET' }, thunkAPI.getState);
    if (!res.ok) return thunkAPI.rejectWithValue('Failed to fetch ticket');
    const { data } = await res.json();
    return data;
  } catch (e) {
    return thunkAPI.rejectWithValue('Failed to fetch ticket');
  }
});

export const replyToTicket = createAsyncThunk<
  { ticketId: string; reply: SupportTicket['replies'][0] },
  { ticketId: string; message: string },
  { state: RootState; rejectValue: string }
>('support/replyToTicket', async ({ ticketId, message }, thunkAPI) => {
  try {
    const res = await apiFetch(
      `/support/ticket/${ticketId}/reply`,
      { method: 'POST', body: JSON.stringify({ message }) },
      thunkAPI.getState
    );
    if (!res.ok) return thunkAPI.rejectWithValue('Failed to reply to ticket');
    const { data } = await res.json();
    return { ticketId, reply: data };
  } catch (e) {
    return thunkAPI.rejectWithValue('Failed to reply to ticket');
  }
});

export const updateTicketStatus = createAsyncThunk<
  { ticketId: string; status: TicketStatus },
  { ticketId: string; status: TicketStatus },
  { state: RootState; rejectValue: string }
>('support/updateStatus', async ({ ticketId, status }, thunkAPI) => {
  try {
    const res = await apiFetch(
      `/support/ticket/${ticketId}/status`,
      { method: 'PUT', body: JSON.stringify({ status }) },
      thunkAPI.getState
    );
    if (!res.ok) return thunkAPI.rejectWithValue('Failed to update status');
    return { ticketId, status };
  } catch (e) {
    return thunkAPI.rejectWithValue('Failed to update status');
  }
});

const supportSlice = createSlice({
  name: 'support',
  initialState,
  reducers: {
    clearCurrentTicket: (state) => {
      state.currentTicket = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(createTicket.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(createTicket.fulfilled, (state, action) => {
        state.isLoading = false;
        state.tickets.unshift(action.payload);
      })
      .addCase(createTicket.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload ?? 'Failed to create ticket';
      })
      .addCase(fetchUserTickets.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(fetchUserTickets.fulfilled, (state, action) => {
        state.isLoading = false;
        state.tickets = action.payload;
      })
      .addCase(fetchUserTickets.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload ?? 'Failed to fetch tickets';
      })
      .addCase(fetchAllTickets.fulfilled, (state, action) => {
        state.tickets = action.payload;
      })
      .addCase(fetchTicket.fulfilled, (state, action) => {
        state.currentTicket = action.payload;
      })
      .addCase(replyToTicket.fulfilled, (state, action) => {
        const ticket = state.tickets.find((t) => t.id === action.payload.ticketId);
        if (ticket) {
          ticket.replies.push(action.payload.reply);
        }
        if (state.currentTicket?.id === action.payload.ticketId) {
          state.currentTicket.replies.push(action.payload.reply);
        }
      })
      .addCase(updateTicketStatus.fulfilled, (state, action) => {
        const ticket = state.tickets.find((t) => t.id === action.payload.ticketId);
        if (ticket) {
          ticket.status = action.payload.status;
        }
        if (state.currentTicket?.id === action.payload.ticketId) {
          state.currentTicket.status = action.payload.status;
        }
      });
  },
});

export const { clearCurrentTicket } = supportSlice.actions;
export default supportSlice.reducer;

