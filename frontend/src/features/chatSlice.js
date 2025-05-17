import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import axios from 'axios';

export const fetchChatData = createAsyncThunk(
  'chat/fetchChatData',
  async (_, { rejectWithValue }) => {
    try {
      const token = localStorage.getItem('token');
      if (!token) throw new Error('Требуется авторизация');

      const [channelsRes, messagesRes] = await Promise.all([
        axios.get('/api/v1/channels', {
          headers: { Authorization: `Bearer ${token}` },
        }),
        axios.get('/api/v1/messages', {
          headers: { Authorization: `Bearer ${token}` },
        }),
      ]);

      return {
        channels: channelsRes.data,
        messages: messagesRes.data,
      };
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || err.message);
    }
  }
);

const addUsernameToMessage = (msg) => {
  if (msg.username) {
    return msg;
  }

  const currentUser = JSON.parse(localStorage.getItem('user'));

  return {
    ...msg,
    username: currentUser?.username || 'unknown',
  };
};

const initialState = {
  channels: [],
  messages: [],
  activeChannelId: null,
  status: 'idle',
  error: null,
};

const chatSlice = createSlice({
  name: 'chat',
  initialState,
  reducers: {
    setActiveChannel(state, action) {
      state.activeChannelId = action.payload;
    },
    addMessage(state, action) {
      const messageWithUsername = addUsernameToMessage(action.payload);
      state.messages.push(messageWithUsername);
    },
    addChannel(state, action) {
      state.channels.push(action.payload);
    },
    removeChannel(state, action) {
      state.channels = state.channels.filter(ch => ch.id !== action.payload.id);
      if (state.activeChannelId === action.payload.id) {
        state.activeChannelId = state.channels[0]?.id || null;
      }
    },
    renameChannel(state, action) {
      const channel = state.channels.find(ch => ch.id === action.payload.id);
      if (channel) channel.name = action.payload.name;
    },
    removeMessagesByChannel(state, action) {
      const channelId = action.payload.channelId;
      state.messages = state.messages.filter((msg) => msg.channelId !== channelId);
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchChatData.pending, (state) => {
        state.status = 'loading';
        state.error = null;
      })
      .addCase(fetchChatData.fulfilled, (state, action) => {
        state.status = 'succeeded';
        state.channels = action.payload.channels;
        state.messages = action.payload.messages.map(addUsernameToMessage);
        state.activeChannelId = action.payload.channels[0]?.id || null;
      })
      .addCase(fetchChatData.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.payload;
      });
  },
});

export const { 
  setActiveChannel, 
  addMessage, 
  addChannel, 
  removeChannel, 
  renameChannel,
  removeMessagesByChannel
} = chatSlice.actions;

export default chatSlice.reducer;
