import React from 'react'; 

import {shallow} from 'enzyme'
import {Address} from './Address';

let props
let wrapper 

const apiResponse = {order: {_id: 'order_id'}}

beforeEach(() => {
  props = {
    loading: false,
    clearError: jest.fn(),
    setLoading: jest.fn(),
    setLoadingMsg: jest.fn(),
    storeOrder: jest.fn(),
    authApi: jest.fn().mockResolvedValue(apiResponse),
  }

  wrapper = shallow(<Address {...props}/>)
})  

test('test Address snapshot', () => {
  expect(wrapper).toMatchSnapshot()
})

test('test address confirmation', async () => {
  const button = wrapper.find('#checkout-confirm-address')
  button.simulate('click')
  
  expect(props.clearError).toBeCalled()
  expect(props.setLoading).toBeCalledWith(true)
  expect(props.setLoadingMsg).toBeCalledWith('Checking delivery address')
  await expect(props.authApi()).resolves.toBe(apiResponse)
  expect(props.storeOrder).toBeCalledWith(apiResponse.order)
  expect(props.setLoading).toBeCalledWith(false)
  expect(props.setLoadingMsg).toBeCalledWith('')
})
