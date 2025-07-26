import { createSlice, type PayloadAction } from '@reduxjs/toolkit';

export type MessageType = {
  id: string;
  firstName: string;
  lastName: string;
  profile: string;
  content: string;
  date: string;
  isSender: boolean;
};

type MessageState = {
  messages: MessageType[];
};

const initialState: MessageState = {
  messages: [],
};

const messageSlice = createSlice({
  name: 'messages',
  initialState,
  reducers: {
    addMessage(state, action: PayloadAction<MessageType>) {
      state.messages.push(action.payload);
    },
    setMessages(state, action: PayloadAction<MessageType[]>) {
      state.messages = action.payload;
    },
    clearMessages(state) {
      state.messages = [];
    },
  },
});

export const { addMessage, setMessages, clearMessages } = messageSlice.actions;
export default messageSlice.reducer;
