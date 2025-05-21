import { useState } from 'react'
import { useSelector, useDispatch } from 'react-redux'
import {
  setActiveChannel,
  removeChannel,
  renameChannel,
  removeMessagesByChannel,
} from '../features/chatSlice'
import DeleteChannelModal from './DeleteChannelModal'
import RenameChannelModal from './RenameChannelModal'
import { useTranslation } from 'react-i18next'

import { deleteChannelRequest, renameChannelRequest } from '../api/chatApi'

const ChannelsList = () => {
  const { t } = useTranslation()
  const channels = useSelector((state) => state.chat.channels)
  const activeChannelId = useSelector((state) => state.chat.activeChannelId)
  const dispatch = useDispatch()

  const [deleteModalChannel, setDeleteModalChannel] = useState(null)
  const [renameModalChannel, setRenameModalChannel] = useState(null)
  const [isDeleting, setIsDeleting] = useState(false)
  const [isRenaming, setIsRenaming] = useState(false)

  const isBusy = isDeleting || isRenaming

  const handleRemoveConfirmed = async () => {
    if (!deleteModalChannel) return

    setIsDeleting(true)
    try {
      await deleteChannelRequest(deleteModalChannel.id)
      dispatch(removeChannel({ id: deleteModalChannel.id }))
      dispatch(removeMessagesByChannel({ channelId: deleteModalChannel.id }))
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
    try {
      await renameChannelRequest(renameModalChannel.id, newName)
      dispatch(renameChannel({ id: renameModalChannel.id, name: newName }))
    } catch (err) {
      console.error('Ошибка при переименовании канала:', err)
    } finally {
      setIsRenaming(false)
      setRenameModalChannel(null)
    }
  }

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
                  <div className="dropdown ms-2">
                    <button
                      className="btn btn-sm btn-outline-secondary dropdown-toggle"
                      type="button"
                      id={`dropdown-${channel.id}`}
                      data-bs-toggle="dropdown"
                      aria-expanded="false"
                      disabled={isBusy}
                      aria-label={t('channelsList.channelManagement')}
                    >
                    </button>
                    <ul
                      className="dropdown-menu dropdown-menu-start"
                      aria-labelledby={`dropdown-${channel.id}`}
                    >
                      <li>
                        <button
                          className="dropdown-item text-danger"
                          type="button"
                          onClick={() => !isBusy && setDeleteModalChannel(channel)}
                        >
                          {t('channelsList.delete')}
                        </button>
                      </li>
                      <li>
                        <button
                          className="dropdown-item"
                          type="button"
                          onClick={() => !isBusy && setRenameModalChannel(channel)}
                        >
                          {t('channelsList.rename')}
                        </button>
                      </li>
                    </ul>
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
          existingNames={channels.map((ch) => ch.name)}
          onClose={() => setRenameModalChannel(null)}
          onRename={handleRenameConfirmed}
          isLoading={isRenaming}
        />
      )}
    </>
  )
}

export default ChannelsList
