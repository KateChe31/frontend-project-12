import axios from 'axios'

export const fetchChatDataRequest = async () => {
  const token = sessionStorage.getItem('token')
  if (!token) throw new Error('Authorization required')

  const [channelsRes, messagesRes] = await Promise.all([
    axios.get('/api/v1/channels', {
      headers: { Authorization: `Bearer ${token}` },
    }),
    axios.get('/api/v1/messages', {
      headers: { Authorization: `Bearer ${token}` },
    }),
  ])

  return {
    channels: channelsRes.data,
    messages: messagesRes.data,
  }
}
export const renameChannelRequest = async (channelId, newName) => {
  const token = sessionStorage.getItem('token')
  if (!token) throw new Error('Authorization required')

  await axios.patch(`/api/v1/channels/${channelId}`, { name: newName }, {
    headers: { Authorization: `Bearer ${token}` },
  })
}

export const deleteChannelRequest = async (channelId) => {
  const token = sessionStorage.getItem('token')
  if (!token) throw new Error('Authorization required')

  await axios.delete(`/api/v1/channels/${channelId}`, {
    headers: { Authorization: `Bearer ${token}` },
  })
}

export const sendMessageRequest = async (messagePayload) => {
  const token = sessionStorage.getItem('token')
  if (!token) throw new Error('Authorization required')

  await axios.post('/api/v1/messages', messagePayload, {
    headers: { Authorization: `Bearer ${token}` },
  })
}

export const loginRequest = async ({ username, password }) => {
  const response = await axios.post('/api/v1/login', { username, password })
  return response.data
}

export const signupRequest = async ({ username, password }) => {
  const response = await axios.post('/api/v1/signup', { username, password })
  return response.data
}

export const createChannelRequest = async (name) => {
  const token = sessionStorage.getItem('token')
  if (!token) throw new Error('Authorization required')

  const response = await axios.post(
    '/api/v1/channels',
    { name },
    {
      headers: { Authorization: `Bearer ${token}` },
    },
  )

  return response.data
}
