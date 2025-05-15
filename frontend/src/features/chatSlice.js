import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import axios from 'axios';

export const fetchChatData = createAsyncThunk(
  'chat/fetchChatData',
  async (_, { rejectWithValue }) => {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        return rejectWithValue('Нет токена авторизации');
      }

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
        currentChannelId: channelsRes.data[0]?.id || null,
      };
    } catch (err) {
      const message =
        err.response?.data?.message || err.message || 'Ошибка запроса данных чата';
      return rejectWithValue(message);
    }
  }
);

const chatSlice = createSlice({
  name: 'chat',
  initialState: {
    channels: [],
    messages: [],
    activeChannelId: null,
    status: 'idle',
    error: null,
  },
  reducers: {
    setActiveChannel(state, action) {
      state.activeChannelId = action.payload;
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
        state.messages = action.payload.messages;
        state.activeChannelId =
          action.payload.currentChannelId || action.payload.channels[0]?.id || null;
      })
      .addCase(fetchChatData.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.payload || 'Неизвестная ошибка';
      });
  },
});

export const { setActiveChannel } = chatSlice.actions;
export default chatSlice.reducer;
