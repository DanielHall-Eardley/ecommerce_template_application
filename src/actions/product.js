export const STORE_PRODUCT_LIST = 'STORE_PRODUCT_LIST'
export const FILTER_PRODUCT_LIST = 'FILTER_PRODUCT_LIST'
export const CLEAR_PRODUCT_LIST = 'CLEAR_PRODUCT_LIST'
export const STORE_PRODUCT = 'STORE_PRODUCT'
export const ADD_PRODUCT = 'ADD_PRODUCT'
export const UPDATE_PRODUCT = 'UPDATE_PRODUCT'
export const REMOVE_PRODUCT = 'REMOVE_PRODUCT'
export const FINISH_SEARCH = 'FINISH_SEARCH'

export const storeProductList = (list) => {
  return {
    type: STORE_PRODUCT_LIST,
    list
  }
}

export const filterProductList = (query) => {
  return {
    type: FILTER_PRODUCT_LIST,
    query
  }
}

export const storeProduct = (product) => {
  return {
    type: STORE_PRODUCT,
    product
  }
}

export const addProduct = (product) => {
  return {
    type: ADD_PRODUCT,
    product
  }
}

export const finishSearch = () => {
  return {
    type: FINISH_SEARCH,
  }
}

export const updateProduct = (product) => {
  return {
    type: UPDATE_PRODUCT,
    product
  }
}


export const clearProductList = () => {
  return {
    type: CLEAR_PRODUCT_LIST,
  }
}

export const removeProduct = productId => {
  return {
    type: REMOVE_PRODUCT,
    productId
  }
}