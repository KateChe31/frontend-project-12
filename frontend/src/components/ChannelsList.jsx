import { useState, useEffect, useRef } from 'react'
import { useSelector, useDispatch } from 'react-redux'
import {
  setActiveChannel,
  removeChannel,
  renameChannel,
  removeMessagesByChannel,
} from '../features/chatSlice'
import DeleteChannelModal from './DeleteChannelModal'
import RenameChannelModal from './RenameChannelModal'
import axios from 'axios'
import { useTranslation } from 'react-i18next'

const ChannelsList = () => {
  const { t } = useTranslation()

  const channels = useSelector(state => state.chat.channels)
  const activeChannelId = useSelector(state => state.chat.activeChannelId)
  const dispatch = useDispatch()

  const [openMenuId, setOpenMenuId] = useState(null)
  const [deleteModalChannel, setDeleteModalChannel] = useState(null)
  const [renameModalChannel, setRenameModalChannel] = useState(null)

  const [isDeleting, setIsDeleting] = useState(false)
  const [isRenaming, setIsRenaming] = useState(false)

  const menuRef = useRef(null)

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (
        openMenuId !== null
        && menuRef.current
        && !menuRef.current.contains(event.target)
        && !event.target.closest(`button[aria-label="${t('channelsList.channelManagement')}"]`)
      ) {
        setOpenMenuId(null)
      }
    }

    document.addEventListener('click', handleClickOutside)
    return () => document.removeEventListener('click', handleClickOutside)
  }, [openMenuId, t])

  const handleToggleMenu = (e, channelId) => {
    e.stopPropagation()
    setOpenMenuId(openMenuId === channelId ? null : channelId)
  }

  const handleDeleteClick = (e, channel) => {
    e.stopPropagation()
    setOpenMenuId(null)
    setDeleteModalChannel(channel)
  }

  const handleRenameClick = (e, channel) => {
    e.stopPropagation()
    setOpenMenuId(null)
    setRenameModalChannel(channel)
  }

  const handleRemoveConfirmed = async () => {
    if (!deleteModalChannel) return

    setIsDeleting(true)
    const channelIdToDelete = deleteModalChannel.id
    const token = sessionStorage.getItem('token')

    try {
      await axios.delete(`/api/v1/channels/${channelIdToDelete}`, {
        headers: { Authorization: `Bearer ${token}` },
      })

      dispatch(removeChannel({ id: channelIdToDelete }))
      dispatch(removeMessagesByChannel({ channelId: channelIdToDelete }))
    } catch (err) {
      console.error('Ошибка при удалении канала:', err)
    } finally {
      setIsDeleting(false)
      setDeleteModalChannel(null)
    }
  }

  const handleRenameConfirmed = async (newName) => {
    if (!renameModalChannel) return

    setIsRenaming(true)
    const token = sessionStorage.getItem('token')

    try {
      await axios.patch(
        `/api/v1/channels/${renameModalChannel.id}`,
        { name: newName },
        {
          headers: { Authorization: `Bearer ${token}` },
        },
      )

      dispatch(renameChannel({ id: renameModalChannel.id, name: newName }))
    } catch (err) {
      console.error('Ошибка при переименовании канала:', err)
    } finally {
      setIsRenaming(false)
      setRenameModalChannel(null)
    }
  }

  const isBusy = isDeleting || isRenaming

  return (
    <>
      <ul className="list-group">
        {channels.map((channel) => {
          const isRemovable = channel.removable
          const isActive = channel.id === activeChannelId

          return (
            <li key={channel.id} className="list-group-item p-0 border-0">
              <div className="d-flex align-items-center justify-content-between">
                <button
                  type="button"
                  className={`flex-grow-1 text-start btn ${isActive ? 'btn-secondary' : 'btn-light'}`}
                  onClick={() => dispatch(setActiveChannel(channel.id))}
                  aria-label={channel.name}
                >
                  {t('channelsList.hashPrefix')}
                  {channel.name}
                </button>

                {isRemovable && (
                  <div className="position-relative ms-2">
                    <button
                      type="button"
                      className="btn btn-sm btn-outline-secondary"
                      onClick={e => handleToggleMenu(e, channel.id)}
                      disabled={isBusy}
                    >
                      ▼
                      <span className="visually-hidden">{t('channelsList.channelManagement')}</span>
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
                          onClick={e => !isBusy && handleDeleteClick(e, channel)}
                        >
                          {t('channelsList.delete')}
                        </li>
                        <li
                          className="list-group-item list-group-item-action"
                          style={{ cursor: isBusy ? 'not-allowed' : 'pointer' }}
                          onClick={e => !isBusy && handleRenameClick(e, channel)}
                        >
                          {t('channelsList.rename')}
                        </li>
                      </ul>
                    )}
                  </div>
                )}
              </div>
            </li>
          )
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
          existingNames={channels.map(ch => ch.name)}
          onClose={() => setRenameModalChannel(null)}
          onRename={handleRenameConfirmed}
          isLoading={isRenaming}
        />
      )}
    </>
  )
}

export default ChannelsList
