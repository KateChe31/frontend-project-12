import React, { useEffect, useState } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { fetchChatData, setActiveChannel } from '../features/chatSlice';

const ChatPage = () => {
  const dispatch = useDispatch();
  const { channels, messages, activeChannelId, status, error } = useSelector((state) => state.chat);
  const [newMessage, setNewMessage] = useState('');

  useEffect(() => {
    dispatch(fetchChatData());
  }, [dispatch]);

  const handleSend = (e) => {
    e.preventDefault();
    const trimmed = newMessage.trim();
    if (trimmed) {
      console.log(`Отправлено в канал #${activeChannelId}:`, trimmed);
      setNewMessage('');
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
    <div className="d-flex vh-100">
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

      {/* Чат и сообщения */}
      <main className="flex-grow-1 p-3 d-flex flex-column">
      <h5>#{activeChannel?.name || '...'}</h5>

        <div className="border rounded p-3 mb-3 flex-grow-1 overflow-auto" style={{ minHeight: 0 }}>
          {activeMessages.map((msg) => (
            <div key={msg.id} className="mb-2">
              <strong>{msg.username}</strong>: {msg.text}
            </div>
          ))}
        </div>

        {/* Форма ввода сообщения */}
        <form onSubmit={handleSend} className="d-flex gap-2">
          <input
            type="text"
            className="form-control"
            placeholder="Введите сообщение..."
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
          />
          <button type="submit" className="btn btn-outline-secondary d-flex align-items-center justify-content-center" style={{ width: '40px', height: '40px' }}>
            <i className="bi bi-arrow-right"></i>
          </button>
        </form>
      </main>
    </div>
  );
};

export default ChatPage;
