import React from 'react'

import {shallow} from 'enzyme'
import {PostageContainer} from './PostageContainer.js'
import styles from './PostageContainer.module.css'

const apiResponse = {
  order: {_id: 'A unique id'}, 
  clientSecret: 'A unique payment id'
}

const event = {
  preventDefault: jest.fn()
}

let props

beforeEach(() => {
  props = {
    displayError: jest.fn(),
    clearError: jest.fn(),
    setLoading: jest.fn(),
    setLoadingMsg: jest.fn(),
    authApi: jest.fn().mockResolvedValue(apiResponse),
    storeOrder: jest.fn(),
    setSecret: jest.fn(),
    user: {
      token: 'A unique token',
      userId: 'A unique userId'
    },
    setRates: jest.fn(),
    loading: false,
    order: {
      _id: 'A unique orderId',
      addressConfirmed: true,
      postageConfirmed: false,
    }
  }
})

test('test component renders correctly when postage has not been calculated', () => {
  props.order = {
    addressConfirmed: false,
    postageConfirmed: false,
  }

  const wrapper = shallow(<PostageContainer {...props}/>)
  expect(wrapper.equals(
    <p className={styles.text}>
      Confirm your address to calculate postage
    </p>))
  .toEqual(true)
})

test('test component renders correctly when postage options are available', () => {
  const wrapper = shallow(<PostageContainer {...props}/>)
  expect(wrapper.exists('#checkout-postage-container')).toEqual(true)
})

test('test component renders correctly when postage has been calculated', () => {
  props.order = {
    addressConfirmed: true,
    postageConfirmed: true,
  }

  const wrapper = shallow(<PostageContainer {...props}/>)
  expect(wrapper.equals(
    <p className={styles.text}>
      Postage confirmed
    </p>))
  .toEqual(true)
})

test('test postage confirmation with cheapest postage option and failed api response', async () => {
  props.authApi = jest.fn().mockResolvedValue(null)

  const wrapper = shallow(<PostageContainer {...props}/>)
  const button = wrapper.find('#confirm-postage-rates-cheapest')
  button.simulate('click', event)

  expect(event.preventDefault).toBeCalled()
  expect(props.clearError).toHaveBeenCalledTimes(1)
  expect(props.setLoading).toBeCalledWith(true)
  expect(props.setLoadingMsg).toBeCalledWith('Confirming Postage Options')

  expect(props.authApi).toBeCalledWith(
    '/checkout/confirm/postage-rates',
    props.user.token,
    {
      userId: props.user.userId,
      orderId: props.order._id,
      selectedRates: null
    },
    'POST',
    props.displayError
  )

  await expect(props.authApi()).resolves.toBe(null)
  expect(props.setLoading).toHaveBeenLastCalledWith(false)
  expect(props.setLoadingMsg).toHaveBeenLastCalledWith('')
}) 

test('test postage confirmation with cheapest postage option and successful api response', async () => {
  const wrapper = shallow(<PostageContainer {...props}/>)
  const button = wrapper.find('#confirm-postage-rates-cheapest')
  button.simulate('click', event)

  expect(event.preventDefault).toBeCalled()
  expect(props.clearError).toHaveBeenCalledTimes(1)
  expect(props.setLoading).toBeCalledWith(true)
  expect(props.setLoadingMsg).toBeCalledWith('Confirming Postage Options')

  expect(props.authApi).toBeCalledWith(
    '/checkout/confirm/postage-rates',
    props.user.token,
    {
      userId: props.user.userId,
      orderId: props.order._id,
      selectedRates: null
    },
    'POST',
    props.displayError
  )

  await expect(props.authApi()).resolves.toBe(apiResponse)
  expect(props.storeOrder).toBeCalledWith(apiResponse.order)
  expect(props.setSecret).toBeCalledWith(apiResponse.clientSecret)
  expect(props.setLoading).toHaveBeenLastCalledWith(false)
  expect(props.setLoadingMsg).toHaveBeenLastCalledWith('')
}) 

test('test postage confirmation with customer selected postage options and failed api response', async () => {
  props.authApi = jest.fn().mockResolvedValue(null)

  const wrapper = shallow(<PostageContainer {...props}/>)
  const button = wrapper.find('#confirm-postage-rates-selected')
  button.simulate('click', event)

  expect(event.preventDefault).toBeCalled()
  expect(props.clearError).toHaveBeenCalledTimes(1)
  expect(props.setLoading).toBeCalledWith(true)
  expect(props.setLoadingMsg).toBeCalledWith('Confirming Postage Options')

  expect(props.authApi).toBeCalledWith(
    '/checkout/confirm/postage-rates',
    props.user.token,
    {
      userId: props.user.userId,
      orderId: props.order._id,
      selectedRates: []
    },
    'POST',
    props.displayError
  )

  await expect(props.authApi()).resolves.toBe(null)
  expect(props.setLoading).toHaveBeenLastCalledWith(false)
  expect(props.setLoadingMsg).toHaveBeenLastCalledWith('')
}) 

test('test postage confirmation with customer selected postage options and successful api response', async () => {
  const wrapper = shallow(<PostageContainer {...props}/>)
  const button = wrapper.find('#confirm-postage-rates-selected')
  button.simulate('click', event)

  expect(event.preventDefault).toBeCalled()
  expect(props.clearError).toHaveBeenCalledTimes(1)
  expect(props.setLoading).toBeCalledWith(true)
  expect(props.setLoadingMsg).toBeCalledWith('Confirming Postage Options')

  expect(props.authApi).toBeCalledWith(
    '/checkout/confirm/postage-rates',
    props.user.token,
    {
      userId: props.user.userId,
      orderId: props.order._id,
      selectedRates: []
    },
    'POST',
    props.displayError
  )
  
  await expect(props.authApi()).resolves.toBe(apiResponse)
  expect(props.storeOrder).toBeCalledWith(apiResponse.order)
  expect(props.setSecret).toBeCalledWith(apiResponse.clientSecret)
  expect(props.setLoading).toHaveBeenLastCalledWith(false)
  expect(props.setLoadingMsg).toHaveBeenLastCalledWith('')
}) 