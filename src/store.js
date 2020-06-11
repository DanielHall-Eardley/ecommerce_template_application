import {createStore, combineReducers} from 'redux'
import notification from './reducers/notification'
import order from './reducers/order'
import product from './reducers/product'
import user from './reducers/user'

const combinedReducers = combineReducers({
  notification,
  order,
  product,
  user
})

const store = createStore(combinedReducers)

export default store