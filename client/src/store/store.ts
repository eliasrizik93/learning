import { configureStore } from '@reduxjs/toolkit';
import messageReducer from './slices/messageSlice';
import authReducer from './slices/authSlice';
import groupReducer from './slices/groupSlice';
import cardReducer from './slices/cardSlice';

export const store = configureStore({
  reducer: {
    messages: messageReducer,
    auth: authReducer,
    groups: groupReducer,
    cards: cardReducer,
  },
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
