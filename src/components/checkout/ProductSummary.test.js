import React from 'react'

import {shallow} from 'enzyme'
import {ProductSummary} from './ProductSummary.js'

let props;
let wrapper

const apiResponse = [
  {
    _id: 2,
    name: 'Second product',
    price: 350,
  }
]

beforeEach(() => {
  props = {
    clearError: jest.fn(),
    displayError: jest.fn(),
    authApi: jest.fn().mockResolvedValue(apiResponse),
    storeOrder: jest.fn(),
    order: {
      _id: 1,
      products: [
        {
          _id: 1,
          name: 'First product',
          price: 450,
        },
        {
          _id: 2,
          name: 'Second product',
          price: 350,
        },
      ],
      addressConfirmed: false
    },
    user: {
      userId: 1,
      token: 'Unique token'
    }
  }

  wrapper = shallow(<ProductSummary {...props} />)
})

test('test snapshot matches and is up to date', () => {
  expect(wrapper).toMatchSnapshot()
})

test('products cannot removed after address confirmation', () => {
  props.order.addressConfirmed = true
  wrapper = shallow(<ProductSummary {...props} />)
  expect(wrapper.exists('.remove')).toEqual(false)
})

test('products can be removed before address confirmation', () => {
  expect(wrapper.exists('.remove')).toEqual(true)
})

test('test the remove product functionality with a successful api response', async () => {
  const button = wrapper.find('ul').childAt(0).find('button')
  button.simulate('click')

  const body = {
    productId: 1,
    userId: props.user.userId,
    orderId: props.order._id
  }

  expect(props.clearError).toHaveBeenCalledTimes(1)
  expect(props.authApi).toBeCalledWith(
    '/checkout/remove-product',
    props.user.token,
    body,
    "PUT",
    props.displayError
  )
  await expect(props.authApi()).resolves.toBe(apiResponse)
  expect(props.storeOrder).toBeCalledWith(apiResponse)
})

test('test the remove product functionality with a failed api response', async () => {
  props.authApi = jest.fn().mockResolvedValue(false)
  wrapper = shallow(<ProductSummary {...props} />)
  const button = wrapper.find('ul').childAt(0).find('button')
  button.simulate('click')
 
  const body = {
    productId: 1,
    userId: props.user.userId,
    orderId: props.order._id
  }

  expect(props.clearError).toHaveBeenCalledTimes(1)
  expect(props.authApi).toBeCalledWith(
    '/checkout/remove-product',
    props.user.token,
    body,
    "PUT",
    props.displayError
  )
  await expect(props.authApi()).resolves.toBe(false)
})