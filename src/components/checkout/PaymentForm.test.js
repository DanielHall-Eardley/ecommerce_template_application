import React from 'react'; 

import {shallow} from 'enzyme'
import {PaymentForm} from './PaymentForm.js';
import StripeWrapper from './StripeWrapper.js';

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

  wrapper = shallow(
    <StripeWrapper {...props}/>
  )
})  

// test('test address confirmation', async () => {
//   //Unsure why this line isn't working?
//   const form = wrapper.find(PaymentForm).dive().find('#checkout-payment-form')
//   form.simulate('submit')
  
//   expect(props.clearError).toBeCalled()
//   expect(props.setLoading).toBeCalledWith(true)
//   expect(props.setLoadingMsg).toBeCalledWith('Checking delivery address')
//   await expect(props.authApi()).resolves.toBe(apiResponse)
//   expect(props.storeOrder).toBeCalledWith(apiResponse.order)
//   expect(props.setLoading).toBeCalledWith(false)
//   expect(props.setLoadingMsg).toBeCalledWith('')
// })
