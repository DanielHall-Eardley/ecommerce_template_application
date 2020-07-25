import React from 'react'; 

import {shallow} from 'enzyme'
import {App} from './App';

let props 

beforeEach(() => {
  props = {
    clearError: jest.fn(),
    clearUser: jest.fn(),
    storeUser: jest.fn(),
    displayError: jest.fn(),
    getOrderSummary: jest.fn(),
    storeOrderSummary: jest.fn()
  }
})

const useEffect = jest.spyOn(React, 'useEffect').mockImplementation(f => f());

test('test App behaviour when user is logged out', () => {
  props.checkLogin = jest.fn().mockReturnValue({error: 'error'})
  const wrapper = shallow(<App {...props}/>)
 
  expect(props.clearError).toBeCalled()
  expect(props.clearUser).toBeCalled()
  expect(props.checkLogin).toHaveReturnedWith({error: 'error'})
  expect(props.displayError).toBeCalledWith('error')
})

test('test App behaviour when customer is logged in', () => {
  const mockUser = {
    token: 'token',
    userId: 'userId',
    name: 'name',
    type: 'customer',
    tokenExpiration: 'tokenExpiration'
  }

  props.checkLogin = jest.fn().mockReturnValue({user: mockUser})
  const wrapper = shallow(<App {...props}/>)
 
  expect(props.clearError).toBeCalled()
  expect(props.checkLogin).toHaveReturnedWith({user: mockUser})
  expect(props.storeUser).toBeCalledWith(mockUser)
  expect(props.getOrderSummary).toBeCalled()
})

test('test App behaviour when business admin is logged in', () => {
  const mockUser = {
    token: 'token',
    userId: 'userId',
    name: 'name',
    type: 'admin',
    tokenExpiration: 'tokenExpiration'
  }

  props.checkLogin = jest.fn().mockReturnValue({user: mockUser})
  const wrapper = shallow(<App {...props}/>)
 
  expect(props.clearError).toBeCalled()
  expect(props.checkLogin).toHaveReturnedWith({user: mockUser})
  expect(props.storeUser).toBeCalledWith(mockUser)
  expect(props.getOrderSummary).not.toBeCalled()
})
