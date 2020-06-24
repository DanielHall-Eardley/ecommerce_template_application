import React, {useEffect} from 'react';
import './Global.css';
import {
  BrowserRouter as Router,
  Switch,
  Route,
  useHistory
} from "react-router-dom";
import {apiHost} from './global'

import Checkout from './components/checkout/Checkout.js'
import Menu from './components/header/Menu.js'
import Title from './components/header/Title.js'
import Landing from './components/landing/Landing.js'
import Signup from './components/user/Signup.js'
import Login from './components/user/Login.js'
import ProductPage from './components/products/ProductPage.js'
import OrderList from './components/orders/OrderList.js'
import Notification from './components/notification/Notification'

import {connect} from 'react-redux'
import {storeUser, clearUser} from './actions/user'
import {storeOrderSummary} from './actions/order'
import {displayError, clearError} from './actions/notification'
import { Elements } from '@stripe/react-stripe-js';
import {loadStripe} from '@stripe/stripe-js'
import checkLogin from './helper/checkLogin'
import {stripeApiKey} from './global'
const stripePromise = loadStripe(stripeApiKey)

const App = props => {
  useEffect(() => {
    props.clearError()
    
    const result = checkLogin()
    
    if (result.error) {
      return props.clearUser()
    }
    
    props.storeUser(result.user)
  
    const getOrderSummary = async (userId, token) => {
      const res = await fetch(apiHost + '/order/summary/' + userId, {
        headers: {
          'Content-Type': 'application/json',
          'Authorization': token
        }
      }, [])

      const response = await res.json()

      if (response.error) {
        return
      }

      props.storeOrderSummary(response)
    }

    if (result.user.type === 'customer') {
      getOrderSummary(result.user.userId, result.user.token)
    }
  }, [])

  return (
    <Router>
      <header>
        <Title title='Ecommerce Demo Website'/>
        <Menu/>
      </header>
      <Notification error={props.error} notification={props.notification}/> 
      <Switch>
        <Route path='/order'>
          <OrderList/>
        </Route>
        <Route path='/product'>
          <ProductPage/>
        </Route>
        <Route path='/checkout'>
          <Elements stripe={stripePromise}>
            <Checkout/>
          </Elements>
        </Route>
        <Route path='/user/signup'>
          <Signup/>
        </Route>
        <Route path='/admin/signup'>
          <Signup/>
        </Route>
        <Route path='/login'>
          <Login/>
        </Route>
        <Route exact={true} path='/'>
          <Landing/>
        </Route>
      </Switch>
    </Router>
  );
}

const mapStateToProps = state => {
  return {
    error: state.notification.error,
    notification: state.notification.notification,
  }
}


const mapDispatchToProps = dispatch => {
  return {
    storeUser: user => dispatch(storeUser(user)),
    clearUser: () => dispatch(clearUser()),
    displayError: error => dispatch(displayError(error)),
    clearError: () => dispatch(clearError()),
    storeOrderSummary: (summary) => dispatch(storeOrderSummary(summary)),
  }
}

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(App)


