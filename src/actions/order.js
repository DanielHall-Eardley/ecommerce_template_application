export const STORE_CURRENT_ORDER_SUMMARY = 'STORE_CURRENT_ORDER_SUMMARY'
export const STORE_CURRENT_ORDER = 'STORE_CURRENT_ORDER'
export const STORE_ORDER_LIST = 'STORE_ORDER_LIST'
export const CLEAR_ORDER = 'CLEAR_ORDER'

export const storeOrderSummary = (summary) => {
  return {
    type: STORE_CURRENT_ORDER_SUMMARY,
    summary
  }
}

export const storeOrder = (order) => {
  return {
    type: STORE_CURRENT_ORDER,
    order
  }
}

export const clearOrder = () => {
  return {
    type: CLEAR_ORDER,
  }
}

export const storeOrderList = (past, pending) => {
  return {
    type: STORE_ORDER_LIST,
    past,
    pending
  }
}