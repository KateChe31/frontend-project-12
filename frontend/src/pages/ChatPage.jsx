import React, { useEffect, useState, useRef } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { fetchChatData, setActiveChannel, addMessage } from '../features/chatSlice';
import axios from 'axios';
import socket from '../socket';

const ChatPage = () => {
  const dispatch = useDispatch();
  const { channels, messages, activeChannelId, status, error } = useSelector((state) => state.chat);

  const [newMessage, setNewMessage] = useState('');
  const [isConnected, setIsConnected] = useState(socket.connected);
  const messageListRef = useRef(null);

  const currentUsername = JSON.parse(localStorage.getItem('user'))?.username;

  // Загрузка данных
  useEffect(() => {
    dispatch(fetchChatData());
  }, [dispatch]);

  // Подключение к сокету
  useEffect(() => {
    socket.on('connect', () => {
      setIsConnected(true);
    });

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
    
    return () => {
      socket.off('newMessage');
      socket.off('connect');
      socket.off('disconnect');
    };
  }, [dispatch, currentUsername]);

  // Автоскролл
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
      await axios.post('/api/v1/messages', messagePayload, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      setNewMessage('');
    } catch (err) {
      console.error('Ошибка отправки сообщения:', err);
      alert('Не удалось отправить сообщение. Проверьте соединение.');
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

      <div className="d-flex flex-grow-1">
        {/* Список каналов */}
        <aside className="bg-light border-end p-3" style={{ width: '300px' }}>
          <h5>Каналы</h5>
          <ul className="list-group">
            {channels.map((channel) => (
              <li
                key={channel.id}
                className={`list-group-item list-group-item-action ${channel.id === activeChannelId ? 'active' : ''}`}
                style={{ cursor: 'pointer' }}
                onClick={() => dispatch(setActiveChannel(channel.id))}
              >
                #{channel.name}
              </li>
            ))}
          </ul>
        </aside>

        {/* Чат */}
        <main className="flex-grow-1 p-3 d-flex flex-column">
        <h5 className="text-start">#{activeChannel?.name || '...'}</h5>

          <div
            ref={messageListRef}
            className="border rounded p-3 mb-3 flex-grow-1 overflow-auto text-start"
            style={{ minHeight: 0 }}
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
              disabled={!isConnected}
            />
            <button
              type="submit"
              className="btn btn-outline-secondary d-flex align-items-center justify-content-center"
              style={{ width: '40px', height: '40px' }}
              disabled={!newMessage.trim() || !isConnected}
            >
              <i className="bi bi-arrow-right"></i>
            </button>
          </form>
        </main>
      </div>
    </div>
  );
};

export default ChatPage;
