export const DISPLAY_ERROR = 'DISPLAY_ERROR'
export const CLEAR_ERROR = 'CLEAR_ERROR'

export const displayError = (error) => {
  return {
    type: DISPLAY_ERROR,
    error
  }
}

export const clearError = () => {
  return {
    type: CLEAR_ERROR,
  }
}


export const DISPLAY_NOTIFICATION = 'DISPLAY_NOTIFICATION'
export const CLEAR_NOTIFICATION = 'CLEAR_NOTIFICATION'

export const displayNotification= (notification) => {
  return {
    type: DISPLAY_NOTIFICATION,
    notification
  }
}

export const clearNotification = () => {
  return {
    type: CLEAR_NOTIFICATION,
  }
}