import {
  STORE_CURRENT_ORDER_SUMMARY,
  STORE_CURRENT_ORDER, 
  STORE_ORDER_LIST, 
} from '../actions/order'

const initialState = {
  summary: {
    orderId: null,
    count: 0
  },
  order: null,
  pendingOrderList: [],
  pastOrderList: [],
}

const user = (state = initialState, action) => {
  switch (action.type) {
    case STORE_ORDER_LIST: 
      return {
        ...state,
        pastOrderList: action.past,
        pendingOrderList: action.pending
      }
    case STORE_CURRENT_ORDER: 
      return {
        ...state,
        order: action.order
      }
    case STORE_CURRENT_ORDER_SUMMARY: 
    return {
      ...state,
      summary: action.summary
    }
    default: 
      return state
  }
}

export default user