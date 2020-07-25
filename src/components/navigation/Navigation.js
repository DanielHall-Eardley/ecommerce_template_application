import React from 'react';
import {
  BrowserRouter as Router,
  Switch,
  Route,
} from "react-router-dom";

import Checkout from '../checkout/Checkout.js'
import Menu from '../header/Menu.js'
import Title from '../header/Title.js'
import Landing from '../landing/Landing.js'
import Signup from '../user/Signup.js'
import Login from '../user/Login.js'
import ProductPage from '../products/ProductPage.js'
import OrderList from '../orders/OrderList.js'
import Notification from '../notification/Notification'

import getAuthApi from '../../helper/getAuthApi'
import getApi from '../../helper/getApi'
import postApi from '../../helper/postApi'
import authApi from '../../helper/authApi'
import checkLogin from '../../helper/checkLogin'


/*This component functions as a root level navigator*/
export default props => {
  return (
    <Router>
      <header>
        <Title title='Ecommerce Demo Website'/>
        <Menu/>
      </header>
      <span id='main-content'></span>
      <Notification error={props.error} notification={props.notification}/> 
      <Switch>
        <Route path='/order'>
          <OrderList getAuthApi={getAuthApi} authApi={authApi} checkLogin={checkLogin}/>
        </Route>
        <Route path='/product'>
          <ProductPage getApi={getApi}/>
        </Route>
        <Route path='/checkout'>
          <Checkout getAuthApi={getAuthApi} authApi={authApi} checkLogin={checkLogin}/>
        </Route>
        <Route path='/user/signup'>
          <Signup postApi={postApi}/>
        </Route>
        <Route path='/admin/signup'>
          <Signup postApi={postApi}/>
        </Route>
        <Route path='/login'>
          <Login postApi={postApi} getAuthApi={getAuthApi}/>
        </Route>
        <Route exact={true} path='/'>
          <Landing/>
        </Route>
      </Switch>
    </Router>
  );
}