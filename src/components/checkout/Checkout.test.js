import React from 'react'; 
import {Elements} from '@stripe/react-stripe-js'
import {loadStripe} from '@stripe/stripe-js'
import {stripeApiKey} from '../../global'

import {shallow} from 'enzyme'
import {Checkout} from './Checkout';

const stripePromise = loadStripe(stripeApiKey)
let props 
let wrapper

beforeEach(() => {
  props = {
    checkLogin: jest.fn(),
    getAuthApi: jest.fn(),
    authApi: jest.fn(),
    clearError: jest.fn(),
    displayError: jest.fn(),
    clearUser: jest.fn(),
    storeUser: jest.fn(),
    storeOrder: jest.fn(),
    clearOrder: jest.fn(),
    displayNotification: jest.fn(),
    clearNotification: jest.fn(),
    order: {
      customerId: 'id',
      customerName: 'name',
      customerEmail: 'email',
      products: [],
      total: 100,
      count: 1
    },
    user: {
      token: 'token',
      userId: 'userId',
      name: 'name',
      type: 'customer',
      tokenExpiration: 'tokenExpiration'
    },
    orderId: 'orderId'
  }
 
  wrapper = shallow(
    <Elements stripe={stripePromise}>
      <Checkout {...props}/>
    </Elements>
  )
})  
const useEffect = jest.spyOn(React, 'useEffect').mockImplementation(f => f());

test('test CheckOut snapshot', () => {
  expect(wrapper).toMatchSnapshot()
})

test('test getPostageRates function', () => {
  console.log(wrapper)
  const button = wrapper.children().dive().find('#checkout-confirm-address')
  console.log(button)
  button.simulate('click')
  
  expect(props.clearError).toBeCalled()
})


