import 'react-app-polyfill/ie11'
import React from 'react';
import ReactDOM from 'react-dom';
import App from './App';
import * as serviceWorker from './serviceWorker';

import {Provider} from 'react-redux'
import store from './store'

import checkLogin from './helper/checkLogin'
import getOrderSummary from './helper/getOrderSummary'

import {Elements} from '@stripe/react-stripe-js'
import {loadStripe} from '@stripe/stripe-js'
import {stripeApiKey} from './global'
const stripePromise = loadStripe(stripeApiKey)


ReactDOM.render(
  <React.StrictMode>
    <Provider store={store}>
      <Elements stripe={stripePromise}>
        <App checkLogin={checkLogin} getOrderSummary={getOrderSummary}/>
      </Elements>
    </Provider>
  </React.StrictMode>,
  document.getElementById('root')
);

// If you want your app to work offline and load faster, you can change
// unregister() to register() below. Note this comes with some pitfalls.
// Learn more about service workers: https://bit.ly/CRA-PWA
serviceWorker.unregister();
