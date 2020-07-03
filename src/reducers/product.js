import {
  STORE_PRODUCT,
  STORE_PRODUCT_LIST, 
  FILTER_PRODUCT_LIST, 
  CLEAR_PRODUCT_LIST,
  ADD_PRODUCT,
  FINISH_SEARCH,
  REMOVE_PRODUCT
} from '../actions/product'

const initialState = {
  productList: [],
  product: {},
  filteredList: [],
  searching: false
}

const user = (state = initialState, action) => {
  switch (action.type) {
    case STORE_PRODUCT_LIST: 
      return {
        ...state,
        productList: action.list
      }
    case FILTER_PRODUCT_LIST: 
      const filteredList = state.productList.filter(product => {
        return product.name.toLowerCase().includes(action.query.toLowerCase())
      })
      return {
        ...state,
        searching: true,
        filteredList: filteredList
      }
    case STORE_PRODUCT: 
      return {
        ...state,
        product: action.product
      }  
    case ADD_PRODUCT: 
      return {
        product: action.product,
        productList: [...state.productList, action.product],
        filteredList: [...state.filteredList, action.product],
      }
    case REMOVE_PRODUCT: 
      const checkForProduct = state.productList.findIndex(product => product._id === action.productId)

      if (checkForProduct === -1) {
        return
      } 

      const filteredProductList = [
        ...state.productList.slice(0, checkForProduct),
        ...state.productList.slice(checkForProduct + 1)
      ]
      return {
        ...state,
        productList: filteredProductList
      }
    case FINISH_SEARCH: 
      return {
        ...state,
        searching: false
      }
    case CLEAR_PRODUCT_LIST: 
      return initialState
    default: 
      return state
  }
}

export default user