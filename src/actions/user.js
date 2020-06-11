export const STORE_USER = 'STORE_USER'
export const CLEAR_USER = 'CLEAR_USER'

export const storeUser = (user) => {
  return {
    type: STORE_USER,
    user
  }
}

export const clearUser = () => {
  localStorage.clear()
  return {
    type: CLEAR_USER,
  }
}