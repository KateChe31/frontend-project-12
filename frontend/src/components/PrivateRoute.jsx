import { Navigate } from 'react-router-dom'

const PrivateRoute = ({ children }) => {
  const token = sessionStorage.getItem('token')
  console.log('PrivateRoute token:', token)
  if (!token) {
    console.log('Redirecting to /login')
    return <Navigate to="/login" replace />
  }
  return children
}

export default PrivateRoute
