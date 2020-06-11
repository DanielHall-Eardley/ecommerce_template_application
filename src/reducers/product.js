import {
  STORE_PRODUCT,
  STORE_PRODUCT_LIST, 
  FILTER_PRODUCT_LIST, 
  CLEAR_PRODUCT_LIST,
  ADD_PRODUCT
} from '../actions/product'

const initialState = {
  productList: [],
  product: {},
  filteredList: []
}

const user = (state = initialState, action) => {
  switch (action.type) {
    case STORE_PRODUCT_LIST: 
      const newProductList = []

      for(let newProduct of action.list){
        let addProduct = true

        for(let oldProduct of state.productList) {
          if (oldProduct._id === newProduct._id) {
            addProduct = false
          }
        }

        if (addProduct) {
          newProductList.push(newProduct)
        }
      }
      
      return {
        ...state,
        productList: newProductList
      }
    case FILTER_PRODUCT_LIST: 
      const filteredList = state.productList.filter(product => {
        return product.name.toString().includes(action.query)
      })
      return {
        ...state,
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
    case CLEAR_PRODUCT_LIST: 
      return initialState
    default: 
      return state
  }
}

export default user