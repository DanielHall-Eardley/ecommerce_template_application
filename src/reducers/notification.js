import {
  DISPLAY_ERROR, 
  CLEAR_ERROR,
  DISPLAY_NOTIFICATION,
  CLEAR_NOTIFICATION
} from '../actions/notification'

const initialState = {
  error: [],
  notification: []
}

const notification = (state = initialState, action) => {
  switch (action.type) {
    case DISPLAY_ERROR: 
      let error = state.error

      if (Array.isArray(action.error)) {
        error = action.error 
      } else {
        error.push(action.error)
      }

      return {
        ...state,
        error
      }
    case CLEAR_ERROR: 
      return {
        ...state,
        error: []
      }
    case DISPLAY_NOTIFICATION: 
    let notification = state.notification
      
    if (Array.isArray(action.notification)) {
      notification = action.notification
    } else {
      notification.push(action.notification)
    }

    return {
      ...state,
      notification
    }
  case CLEAR_NOTIFICATION: 
    return {
      ...state,
      notification: []
    }
    default: return state
  }
}

export default notification 