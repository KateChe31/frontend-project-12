import React, { useEffect, useState, useRef } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import {
  fetchChatData,
  setActiveChannel,
  addMessage,
  addChannel,
  removeChannel,
  renameChannel,
} from '../features/chatSlice';
import axios from 'axios';
import socket from '../socket';
import AddChannelModal from '../components/AddChannelModal';
import ChannelsList from '../components/ChannelsList';

const ChatPage = () => {
  const dispatch = useDispatch();
  const { channels, messages, activeChannelId, status, error } = useSelector((state) => state.chat);

  const [newMessage, setNewMessage] = useState('');
  const [isConnected, setIsConnected] = useState(socket.connected);
  const [showAddChannel, setShowAddChannel] = useState(false);
  const [isSending, setIsSending] = useState(false);

  const messageListRef = useRef(null);
  const inputRef = useRef(null);

  const currentUsername = JSON.parse(localStorage.getItem('user'))?.username;

  // Загрузка данных при первом монтировании
  useEffect(() => {
    dispatch(fetchChatData());
  }, [dispatch]);

  // Установка фокуса на поле ввода при загрузке страницы
  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  // Подключение к сокету и подписки
  useEffect(() => {
    socket.on('connect', () => setIsConnected(true));
    socket.on('disconnect', () => setIsConnected(false));

    socket.on('newMessage', (message) => {
      const patchedMessage = {
        ...message,
        username:
          !message.username || message.username === 'unknown'
            ? currentUsername || 'unknown'
            : message.username,
      };
      dispatch(addMessage(patchedMessage));
    });

    socket.on('newChannel', (channel) => {
      dispatch(addChannel(channel));
      dispatch(setActiveChannel(channel.id));
    });

    socket.on('removeChannel', ({ id }) => {
      dispatch(removeChannel({ id }));
    });

    socket.on('renameChannel', ({ id, name }) => {
      dispatch(renameChannel({ id, name }));
    });

    return () => {
      socket.off('connect');
      socket.off('disconnect');
      socket.off('newMessage');
      socket.off('newChannel');
      socket.off('removeChannel');
      socket.off('renameChannel');
    };
  }, [dispatch, currentUsername]);

  // Автоскролл вниз при изменении сообщений или смене канала
  useEffect(() => {
    if (messageListRef.current) {
      messageListRef.current.scrollTop = messageListRef.current.scrollHeight;
    }
  }, [messages, activeChannelId]);

  const handleSend = async (e) => {
    e.preventDefault();
    const trimmed = newMessage.trim();
    if (!trimmed || !activeChannelId) return;

    const token = localStorage.getItem('token');
    const messagePayload = {
      body: trimmed,
      channelId: activeChannelId,
    };

    try {
      setIsSending(true);
      await axios.post('/api/v1/messages', messagePayload, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      setNewMessage('');
      inputRef.current?.focus();
    } catch (err) {
      console.error('Ошибка отправки сообщения:', err);
      alert('Не удалось отправить сообщение. Проверьте соединение.');
    } finally {
      setIsSending(false);
    }
  };

  if (status === 'loading') {
    return <p className="text-center mt-5">Загрузка...</p>;
  }

  if (error) {
    return <p className="text-danger text-center mt-5">Ошибка: {error}</p>;
  }

  const activeMessages = messages.filter((msg) => msg.channelId === activeChannelId);
  const activeChannel = channels.find((ch) => ch.id === activeChannelId);

  return (
    <div className="d-flex flex-column vh-100">
      {!isConnected && (
        <div className="alert alert-warning text-center mb-0 rounded-0">
          Потеряно соединение с сервером. Повторное подключение...
        </div>
      )}

      <div className="d-flex flex-grow-1" style={{ minHeight: 0 }}>
        {/* Список каналов */}
        <aside
          className="bg-light border-end p-3"
          style={{
            width: '300px',
            minWidth: '300px',
            maxWidth: '300px',
            overflowY: 'auto',
          }}
        >
          <div className="d-flex justify-content-between align-items-center mb-2">
            <h5>Каналы</h5>
            <button
              className="btn btn-sm btn-outline-primary"
              onClick={() => setShowAddChannel(true)}
              title="Добавить канал"
              disabled={isSending}
            >
              +
            </button>
          </div>

          <ChannelsList />
        </aside>

        {/* Чат */}
        <main
          className="flex-grow-1 p-3 d-flex flex-column"
          style={{
            minWidth: 0,
            flexBasis: 0,
            overflow: 'hidden',
          }}
        >
          <h5
            className="text-start text-truncate"
            style={{ maxWidth: '100%', overflow: 'hidden', whiteSpace: 'nowrap' }}
            title={activeChannel?.name || ''}
          >
            # {activeChannel?.name || '...'}
          </h5>

          <div
            ref={messageListRef}
            className="border rounded p-3 mb-3 flex-grow-1 overflow-auto text-start"
            style={{
              minHeight: 0,
              wordBreak: 'break-word',
              whiteSpace: 'pre-wrap',
            }}
          >
            {activeMessages.map((msg) => (
              <div key={msg.id} className="mb-2">
                <strong>{msg.username}</strong>: {msg.body}
              </div>
            ))}
          </div>

          <form onSubmit={handleSend} className="d-flex gap-2">
            <input
              type="text"
              className="form-control"
              placeholder="Введите сообщение..."
              value={newMessage}
              onChange={(e) => setNewMessage(e.target.value)}
              disabled={!isConnected || isSending}
              ref={inputRef}
              autoComplete="off"
            />
            <button
              type="submit"
              className="btn btn-outline-secondary d-flex align-items-center justify-content-center"
              style={{ width: '40px', height: '40px' }}
              disabled={!newMessage.trim() || !isConnected || isSending}
              aria-label="Отправить сообщение"
            >
              <i className="bi bi-arrow-right"></i>
            </button>
          </form>
        </main>
      </div>

      {/* Модалка добавления канала */}
      {showAddChannel && <AddChannelModal onClose={() => setShowAddChannel(false)} />}
    </div>
  );
};

export default ChatPage;
