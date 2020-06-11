import React, {useEffect} from 'react';
import './Global.css';
import {
  BrowserRouter as Router,
  Switch,
  Route,
  useHistory
} from "react-router-dom";

import Checkout from './components/checkout/Checkout.js'
import Menu from './components/header/Menu.js'
import Title from './components/header/Title.js'
import Landing from './components/landing/Landing.js'
import Signup from './components/user/Signup.js'
import Login from './components/user/Login.js'
import ProductList from './components/products/ProductList.js'

import {connect} from 'react-redux'
import {storeUser} from './actions/user'
import {
  displayError, 
  clearError,
} from './actions/notification'

const App = props => {
  const navigate = useHistory()

  useEffect(() => {
    const token = localStorage.getItem('token')
    props.clearError()

    if (!token) {
      props.displayError('Please login')
    } else {
      const user = {
        token,
        userId: localStorage.getItem('userId'),
        name: localStorage.getItem('name'),
        type: localStorage.getItem('type')
      }
      
      props.storeUser(user)
    }
  }, [])

  return (
    <Router>
      <header>
        <Title title='Custom PC'/>
        <Menu/>
      </header>
      <Switch>
        <Route path='/product'>
          <ProductList/>
        </Route>
        <Route path='/checkout'>
          <Checkout/>
        </Route>
        <Route path='/signup'>
          <Signup/>
        </Route>
        <Route path='/login'>
          <Login/>
        </Route>
        <Route exact path='/'>
          <Landing/>
        </Route>
      </Switch>
      <footer></footer>
    </Router>
  );
}

const mapDispatchToProps = dispatch => {
  return {
    storeUser: user => dispatch(storeUser(user)),
    displayError: error => dispatch(displayError(error)),
    clearError: () => dispatch(clearError()),
  }
}

export default connect(
  null,
  mapDispatchToProps
)(App)


