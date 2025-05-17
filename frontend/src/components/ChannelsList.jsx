import React, { useState, useEffect, useRef } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import {
  setActiveChannel,
  removeChannel,
  renameChannel,
  removeMessagesByChannel,
} from '../features/chatSlice';
import DeleteChannelModal from './DeleteChannelModal';
import RenameChannelModal from './RenameChannelModal';
import socket from '../socket';
import axios from 'axios';

const ChannelsList = () => {
  const channels = useSelector((state) => state.chat.channels);
  const activeChannelId = useSelector((state) => state.chat.activeChannelId);
  const dispatch = useDispatch();

  const [openMenuId, setOpenMenuId] = useState(null);
  const [deleteModalChannel, setDeleteModalChannel] = useState(null);
  const [renameModalChannel, setRenameModalChannel] = useState(null);

  const [isDeleting, setIsDeleting] = useState(false);
  const [isRenaming, setIsRenaming] = useState(false);

  const menuRef = useRef(null);

  // Закрытие меню при клике вне
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (
        openMenuId !== null &&
        menuRef.current &&
        !menuRef.current.contains(event.target) &&
        !event.target.closest('button[aria-label="Управление каналом"]')
      ) {
        setOpenMenuId(null);
      }
    };

    document.addEventListener('click', handleClickOutside);
    return () => document.removeEventListener('click', handleClickOutside);
  }, [openMenuId]);

  const handleToggleMenu = (e, channelId) => {
    e.stopPropagation();
    setOpenMenuId(openMenuId === channelId ? null : channelId);
  };

  const handleDeleteClick = (e, channel) => {
    e.stopPropagation();
    setOpenMenuId(null);
    setDeleteModalChannel(channel);
  };

  const handleRenameClick = (e, channel) => {
    e.stopPropagation();
    setOpenMenuId(null);
    setRenameModalChannel(channel);
  };

  const handleRemoveConfirmed = async() => {
    if (!deleteModalChannel) return;

    setIsDeleting(true);

    const channelIdToDelete = deleteModalChannel.id;
    const token = localStorage.getItem('token');

    try {
      await axios.delete(`/api/v1/channels/${channelIdToDelete}`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      dispatch(removeChannel({ id: channelIdToDelete }));
      dispatch(removeMessagesByChannel({ channelId: channelIdToDelete }));

      socket.emit('removeChannel', { id: channelIdToDelete });
    } catch (err) {
      console.error('Ошибка при удалении канала:', err);
      // Можно показать уведомление об ошибке
    } finally {
      setIsDeleting(false);
      setDeleteModalChannel(null);
    }
  };

  const handleRenameConfirmed = async(newName) => {
    if (!renameModalChannel) return;

    setIsRenaming(true);

    const token = localStorage.getItem('token');

    try {
      await axios.patch(
        `/api/v1/channels/${renameModalChannel.id}`,
        { name: newName },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        },
      );

      dispatch(renameChannel({ id: renameModalChannel.id, name: newName }));
      socket.emit('renameChannel', { id: renameModalChannel.id, name: newName });
    } catch (err) {
      console.error('Ошибка при переименовании канала:', err);
      // Можно добавить уведомление или модалку с ошибкой
    } finally {
      setIsRenaming(false);
      setRenameModalChannel(null);
    }
  };

  const isBusy = isDeleting || isRenaming;

  return (
    <>
      <ul className="list-group">
        {channels.map((channel) => {
          const isRemovable = channel.removable;

          return (
            <li
              key={channel.id}
              className={`list-group-item list-group-item-action d-flex justify-content-between align-items-center ${
                channel.id === activeChannelId ? 'active' : ''
              }`}
              style={{
                cursor: 'pointer',
                position: 'relative',
                zIndex: channel.id === activeChannelId ? 1 : 'auto',
              }}
              onClick={() => dispatch(setActiveChannel(channel.id))}
            >
              <span
                style={{
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                  whiteSpace: 'nowrap',
                  maxWidth: 'calc(100% - 50px)',
                }}
                title={channel.name}
              >
                # {channel.name}
              </span>

              {isRemovable && (
                <div style={{ position: 'relative' }}>
                  <button
                    type="button"
                    className="btn btn-sm btn-outline-secondary"
                    onClick={(e) => handleToggleMenu(e, channel.id)}
                    aria-label="Управление каналом"
                    disabled={isBusy}
                  >
                    ▼
                  </button>

                  {openMenuId === channel.id && (
                    <ul
                      ref={menuRef}
                      className="list-group position-absolute shadow"
                      style={{
                        top: '100%',
                        right: 0,
                        zIndex: 1050,
                        minWidth: '140px',
                        backgroundColor: 'white',
                      }}
                    >
                      <li
                        className="list-group-item list-group-item-action text-danger"
                        style={{ cursor: isBusy ? 'not-allowed' : 'pointer' }}
                        onClick={(e) => !isBusy && handleDeleteClick(e, channel)}
                      >
                        Удалить
                      </li>
                      <li
                        className="list-group-item list-group-item-action"
                        style={{ cursor: isBusy ? 'not-allowed' : 'pointer' }}
                        onClick={(e) => !isBusy && handleRenameClick(e, channel)}
                      >
                        Переименовать
                      </li>
                    </ul>
                  )}
                </div>
              )}
            </li>
          );
        })}
      </ul>

      {deleteModalChannel && (
        <DeleteChannelModal
          channelName={deleteModalChannel.name}
          onClose={() => setDeleteModalChannel(null)}
          onDelete={handleRemoveConfirmed}
          isLoading={isDeleting}
        />
      )}

      {renameModalChannel && (
        <RenameChannelModal
          currentName={renameModalChannel.name}
          existingNames={channels.map((ch) => ch.name)}
          onClose={() => setRenameModalChannel(null)}
          onRename={handleRenameConfirmed}
          isLoading={isRenaming}
        />
      )}
    </>
  );
};

export default ChannelsList;
