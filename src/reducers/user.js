import {
  STORE_USER, 
  CLEAR_USER,
} from '../actions/user'

const initialState = {
  name: '',
  userId: null,
  token: null,
  type: ''
}

const user = (state = initialState, action) => {
  switch (action.type) {
    case STORE_USER: 
      return {
        name: action.user.name,
        userId: action.user.userId,
        token: action.user.token,
        type: action.user.type,
      }
    case CLEAR_USER: 
      return initialState
    default: return state
  }
}

export default user