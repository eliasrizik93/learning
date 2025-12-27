import { createAsyncThunk, createSlice } from '@reduxjs/toolkit';
import type { RootState } from '../store';
import { apiFetch } from '../../lib/apiFetch';
import type { Notification } from '../../types';

interface NotificationState {
  notifications: Notification[];
  unreadCount: number;
  isLoading: boolean;
  error: string | null;
}

const initialState: NotificationState = {
  notifications: [],
  unreadCount: 0,
  isLoading: false,
  error: null,
};

export const fetchNotifications = createAsyncThunk<
  Notification[],
  void,
  { state: RootState; rejectValue: string }
>('notifications/fetch', async (_, thunkAPI) => {
  try {
    const res = await apiFetch('/notification', { method: 'GET' }, thunkAPI.getState);
    if (!res.ok) {
      const data = await res.json();
      return thunkAPI.rejectWithValue(data.message || 'Failed to fetch notifications');
    }
    const { data } = await res.json();
    return data;
  } catch (e) {
    return thunkAPI.rejectWithValue('Failed to fetch notifications');
  }
});

export const fetchUnreadCount = createAsyncThunk<
  number,
  void,
  { state: RootState; rejectValue: string }
>('notifications/unreadCount', async (_, thunkAPI) => {
  try {
    const res = await apiFetch('/notification/unread-count', { method: 'GET' }, thunkAPI.getState);
    if (!res.ok) return thunkAPI.rejectWithValue('Failed to fetch unread count');
    const { data } = await res.json();
    return data;
  } catch (e) {
    return thunkAPI.rejectWithValue('Failed to fetch unread count');
  }
});

export const markAsRead = createAsyncThunk<
  string,
  string,
  { state: RootState; rejectValue: string }
>('notifications/markAsRead', async (notificationId, thunkAPI) => {
  try {
    const res = await apiFetch(
      `/notification/${notificationId}/read`,
      { method: 'PUT' },
      thunkAPI.getState
    );
    if (!res.ok) return thunkAPI.rejectWithValue('Failed to mark as read');
    return notificationId;
  } catch (e) {
    return thunkAPI.rejectWithValue('Failed to mark as read');
  }
});

export const markAllAsRead = createAsyncThunk<
  void,
  void,
  { state: RootState; rejectValue: string }
>('notifications/markAllAsRead', async (_, thunkAPI) => {
  try {
    const res = await apiFetch('/notification/read-all', { method: 'PUT' }, thunkAPI.getState);
    if (!res.ok) return thunkAPI.rejectWithValue('Failed to mark all as read');
  } catch (e) {
    return thunkAPI.rejectWithValue('Failed to mark all as read');
  }
});

export const deleteNotification = createAsyncThunk<
  string,
  string,
  { state: RootState; rejectValue: string }
>('notifications/delete', async (notificationId, thunkAPI) => {
  try {
    const res = await apiFetch(
      `/notification/${notificationId}`,
      { method: 'DELETE' },
      thunkAPI.getState
    );
    if (!res.ok) return thunkAPI.rejectWithValue('Failed to delete notification');
    return notificationId;
  } catch (e) {
    return thunkAPI.rejectWithValue('Failed to delete notification');
  }
});

const notificationSlice = createSlice({
  name: 'notifications',
  initialState,
  reducers: {
    addNotification: (state, action) => {
      state.notifications.unshift(action.payload);
      state.unreadCount += 1;
    },
    updateUnreadCount: (state, action) => {
      state.unreadCount = action.payload;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchNotifications.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchNotifications.fulfilled, (state, action) => {
        state.isLoading = false;
        state.notifications = action.payload;
        state.unreadCount = action.payload.filter((n) => !n.read).length;
      })
      .addCase(fetchNotifications.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload ?? 'Failed to fetch notifications';
      })
      .addCase(fetchUnreadCount.fulfilled, (state, action) => {
        state.unreadCount = action.payload;
      })
      .addCase(markAsRead.fulfilled, (state, action) => {
        const notification = state.notifications.find((n) => n.id === action.payload);
        if (notification && !notification.read) {
          notification.read = true;
          state.unreadCount = Math.max(0, state.unreadCount - 1);
        }
      })
      .addCase(markAllAsRead.fulfilled, (state) => {
        state.notifications.forEach((n) => {
          n.read = true;
        });
        state.unreadCount = 0;
      })
      .addCase(deleteNotification.fulfilled, (state, action) => {
        const notification = state.notifications.find((n) => n.id === action.payload);
        if (notification && !notification.read) {
          state.unreadCount = Math.max(0, state.unreadCount - 1);
        }
        state.notifications = state.notifications.filter((n) => n.id !== action.payload);
      });
  },
});

export const { addNotification, updateUnreadCount } = notificationSlice.actions;
export default notificationSlice.reducer;

