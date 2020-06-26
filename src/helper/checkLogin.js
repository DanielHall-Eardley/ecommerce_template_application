/*This function check local storage for a token and
expiration date for the token. If the token does not
exist or the current date is past the expiration the user
is prompted to login. If the checks pass, the user
information is retrieved from local storage and save in redux state*/

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