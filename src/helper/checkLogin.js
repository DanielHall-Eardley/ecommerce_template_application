export default () => {
  const now = Date.now()
  const tokenExpiration = localStorage.getItem('tokenExpiration')
  const token = localStorage.getItem('token')

  if (now > tokenExpiration) {
    return {error: 'Please login'}
  }

  const user = {
    token,
    userId: localStorage.getItem('userId'),
    name: localStorage.getItem('name'),
    type: localStorage.getItem('type'),
    tokenExpiration: localStorage.getItem('tokenExpiration')
  }

  return {user}
}