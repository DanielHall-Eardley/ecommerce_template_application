import {
  DISPLAY_ERROR, 
  CLEAR_ERROR,
  DISPLAY_NOTIFICATION,
  CLEAR_NOTIFICATION
} from '../actions/notification'

const initialState = {
  error: null,
  notification: null
}

const notification = (state = initialState, action) => {
  switch (action.type) {
    case DISPLAY_ERROR: 
      let newError = []

      if (Array.isArray(action.error)) {
        newError = action.error 
      } else {
        newError.push(action.error)
      }
    
      return {
        ...state,
        error: newError
      }
    case CLEAR_ERROR: 
      return {
        ...state,
        error: null
      }
    case DISPLAY_NOTIFICATION: 
    let newNotification = []
      
    if (Array.isArray(action.notification)) {
      newNotification = action.notification
    } else {
      newNotification.push(action.notification)
    }

    return {
      ...state,
      notification: newNotification
    }
  case CLEAR_NOTIFICATION: 
    return {
      ...state,
      notification: null
    }
    default: return state
  }
}

export default notification 