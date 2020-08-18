import React from 'react'; 

import {shallow} from 'enzyme'
import {Checkout} from './Checkout';

let props 

beforeEach(() => {
  props = {
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

  props.checkLogin = jest.fn().mockReturnValue({user: props.user})
})  

const useEffect = jest.spyOn(React, 'useEffect').mockImplementation(f => f());

test('test Checkout snapshot', () => {
  const wrapper = shallow(<Checkout {...props}/>)
  expect(wrapper).toMatchSnapshot()
})




