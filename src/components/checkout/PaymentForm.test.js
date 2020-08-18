import React from 'react'; 

import {shallow} from 'enzyme'
import {PaymentForm} from './PaymentForm.js';

let props
let wrapper 

const apiResponse = {order: {_id: 'order_id'}}

beforeEach(() => {
  props = {
    loading: false,
    displayError: jest.fn(),
    clearError: jest.fn(),
    setLoading: jest.fn(),
    setLoadingMsg: jest.fn(),
    clientSecret: 'A random id',
    authApi: jest.fn().mockResolvedValue(apiResponse),
  }

  wrapper = shallow(<PaymentForm {...props}/>)
})  

test('test PaymentForm snapshot', () => {
  expect(wrapper).toMatchSnapshot()
})

test('test address confirmation', async () => {
  const form = wrapper.find('#checkout-payment-form')
  form.simulate('submit')
  
  expect(props.clearError).toBeCalled()
  expect(props.setLoading).toBeCalledWith(true)
  expect(props.setLoadingMsg).toBeCalledWith('Checking delivery address')
  await expect(props.authApi()).resolves.toBe(apiResponse)
  expect(props.storeOrder).toBeCalledWith(apiResponse.order)
  expect(props.setLoading).toBeCalledWith(false)
  expect(props.setLoadingMsg).toBeCalledWith('')
})
