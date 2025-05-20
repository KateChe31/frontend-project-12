import { useEffect, useState, useRef } from 'react'
import { useSelector, useDispatch } from 'react-redux'
import { useTranslation } from 'react-i18next'
import {
  fetchChatData,
  setActiveChannel,
  addMessage,
  addChannel,
  removeChannel,
  renameChannel,
} from '../features/chatSlice'
import axios from 'axios'
import { createSocket } from '../socket'
import AddChannelModal from '../components/AddChannelModal'
import ChannelsList from '../components/ChannelsList'
import Header from '../components/Header'
import { toast } from 'react-toastify'
import leoProfanity from 'leo-profanity'

const dictionary = leoProfanity.getDictionary('en')
const ruDictionary = leoProfanity.getDictionary('ru')
leoProfanity.add(dictionary)
leoProfanity.add(ruDictionary)

const DEFAULT_CHANNEL_NAME = 'general'

const ChatPage = () => {
  const { t } = useTranslation()
  const dispatch = useDispatch()
  const { channels, messages, activeChannelId, status, error } = useSelector(state => state.chat)

  const [newMessage, setNewMessage] = useState('')
  const [isConnected, setIsConnected] = useState(false)
  const [showAddChannel, setShowAddChannel] = useState(false)
  const [isSending, setIsSending] = useState(false)

  const [createdChannelId, setCreatedChannelId] = useState(null)

  const messageListRef = useRef(null)
  const inputRef = useRef(null)
  const socketRef = useRef(null)

  const user = JSON.parse(sessionStorage.getItem('user'))
  const token = sessionStorage.getItem('token')
  const currentUsername = user?.username || 'unknown'

  useEffect(() => {
    dispatch(fetchChatData())
      .unwrap()
      .catch(() => {
        toast.error(t('fetchError'))
      })
  }, [dispatch, t])

  useEffect(() => {
    if (createdChannelId) {
      dispatch(setActiveChannel(createdChannelId))
      setCreatedChannelId(null)
    }
  }, [createdChannelId, dispatch])

  useEffect(() => {
    const tryFocus = () => {
      if (status === 'succeeded' && activeChannelId && inputRef.current && !inputRef.current.disabled) {
        inputRef.current.focus()
      }
      else {
        setTimeout(tryFocus, 100)
      }
    }

    tryFocus()
  }, [status, activeChannelId, isConnected, isSending])

  useEffect(() => {
    const socket = createSocket(token, currentUsername)
    socketRef.current = socket

    setIsConnected(socket.connected)

    socket.on('connect', () => setIsConnected(true))
    socket.on('disconnect', () => setIsConnected(false))

    socket.on('connect_error', () => {
      toast.error(t('networkError'))
    })

    socket.on('newMessage', (message) => {
      const cleanedBody = leoProfanity.clean(message.body)
      const patchedMessage = { ...message, body: cleanedBody }
      dispatch(addMessage(patchedMessage))
    })

    socket.on('newChannel', (channel) => {
      dispatch(addChannel(channel))
      toast.success(t('channelAdded'))
    })

    socket.on('removeChannel', ({ id }) => {
      dispatch(removeChannel({ id }))

      if (id === activeChannelId) {
        const generalChannel = channels.find(ch => ch.name === DEFAULT_CHANNEL_NAME)
        if (generalChannel) {
          dispatch(setActiveChannel(generalChannel.id))
        }
      }

      toast.success(t('channelDeleted'))
    })

    socket.on('renameChannel', ({ id, name }) => {
      dispatch(renameChannel({ id, name }))
      toast.success(t('channelRenamed'))
    })

    socket.onAny((event, ...args) => {
      console.log('[Socket Event]', event, args)
    })

    return () => {
      socket.disconnect()
    }
  }, [dispatch, token, currentUsername, activeChannelId, channels, t])

  useEffect(() => {
    if (messageListRef.current) {
      messageListRef.current.scrollTop = messageListRef.current.scrollHeight
    }
  }, [messages, activeChannelId])

  const handleSend = async (e) => {
    e.preventDefault()
    const trimmed = newMessage.trim()
    if (!trimmed || !activeChannelId) return

    const filtered = leoProfanity.clean(trimmed)

    const messagePayload = {
      body: filtered,
      channelId: activeChannelId,
      username: currentUsername,
    }

    try {
      setIsSending(true)
      await axios.post('/api/v1/messages', messagePayload, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })
      setNewMessage('')
      inputRef.current?.focus()
    }
    catch (err) {
      console.error('Ошибка отправки сообщения:', err)
    }
    finally {
      setIsSending(false)
    }
  }

  if (error) {
    return <p className="text-danger text-center mt-5">{error}</p>
  }

  const activeMessages = messages.filter(msg => msg.channelId === activeChannelId)
  const activeChannel = channels.find(ch => ch.id === activeChannelId)

  return (
    <div className="d-flex flex-column vh-100">
      <Header />
      <div className="d-flex flex-grow-1" style={{ minHeight: 0 }}>
        <aside className="bg-light border-end p-3" style={{ width: '300px', overflowY: 'auto' }}>
          <div className="d-flex justify-content-between align-items-center mb-2">
            <h5>{t('channels')}</h5>
            <button
              className="btn btn-sm btn-outline-primary"
              onClick={() => setShowAddChannel(true)}
              title={t('addChannel')}
              disabled={isSending}
            >
              {t('addChannelButton')}
            </button>
          </div>
          <ChannelsList />
        </aside>

        <main className="flex-grow-1 p-3 d-flex flex-column" style={{ overflow: 'hidden' }}>
          <h5 className="text-start text-truncate" title={activeChannel?.name || ''}>
            {t('channelNamePrefix', { channelName: activeChannel?.name || '...' })}
          </h5>

          <div
            ref={messageListRef}
            className="border rounded p-3 mb-3 flex-grow-1 overflow-auto text-start"
            style={{ whiteSpace: 'pre-wrap' }}
          >
            {activeMessages.map(msg => (
              <div key={msg.id} className="mb-2">
                <strong>{msg.username}</strong>
                :
                {msg.body}
              </div>
            ))}
          </div>

          <form onSubmit={handleSend} className="d-flex gap-2">
            <input
              type="text"
              className="form-control"
              placeholder={t('messagePlaceholder')}
              aria-label={t('messageForm.newMessage')}
              value={newMessage}
              onChange={e => setNewMessage(e.target.value)}
              disabled={!isConnected || isSending}
              ref={inputRef}
              autoComplete="off"
            />
            <button
              type="submit"
              className="btn btn-outline-secondary"
              disabled={!newMessage.trim() || !isConnected || isSending}
              aria-label={t('sendMessage')}
            >
              <i className="bi bi-arrow-right"></i>
            </button>
          </form>
        </main>
      </div>

      {showAddChannel && (
        <AddChannelModal
          onClose={() => setShowAddChannel(false)}
          onChannelCreated={(id) => {
            setCreatedChannelId(id)
          }}
        />
      )}
    </div>
  )
}

export default ChatPage
