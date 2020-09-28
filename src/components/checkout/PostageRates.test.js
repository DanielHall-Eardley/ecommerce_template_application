import React from 'react'

import {shallow} from 'enzyme'
import PostageRates from './PostageRates.js'

let props;
let wrapper
let event

beforeEach(() => {
  props = {
    rates: [
      {
        rateId: 1,
        guaranteedDeliveryTime: true,
        deliveryTime: 2,
        carrier: 'A postal service',
        fee: 10.95,
        serviceName: 'Express'
      },
      {
        rateId: 2,
        guaranteedDeliveryTime: false,
        deliveryTime: 6,
        carrier: 'A postal service',
        fee: 4.95,
        serviceName: 'Standard'
      }
    ],
    shipmentId: 1,
    selectedRates: [
      {
        shipmentId: 3,
        rateId: 4
      },
      {
        shipmentId: 1,
        rateId: 2
      },
      {
        shipmentId: 2,
        rateId: 1
      }
    ],
    setRates: jest.fn()
  }

  wrapper = shallow(<PostageRates {...props}/>)
  event = {
    preventDefault: jest.fn()
  }
})

test('snapshot matches and is up to date', () => {
  expect(wrapper).toMatchSnapshot()
})

test('test that only the selected postage rate receives a class to highlight it', () => {
  expect(wrapper.find('ul').childAt(1).hasClass('selected')).toEqual(true)
  expect(wrapper.find('ul').childAt(0).hasClass('selected')).toEqual(false)
})

test('test that the selected rates are updated correctly', () => {
  const expectedResult = [
    {
      shipmentId: 3,
      rateId: 4
    },
    {
      shipmentId: 1,
      rateId: 1
    },
    {
      shipmentId: 2,
      rateId: 1
    }
  ]

  const button = wrapper.find('ul').childAt(0).find('button')
  button.simulate('click', event)
  expect(event.preventDefault).toHaveBeenCalledTimes(1)
  expect(props.setRates).toBeCalledWith(expectedResult)
})

test('test that rates are added correctly', () => {
  const expectedResult = [
    {
      shipmentId: 3,
      rateId: 4
    },
    {
      shipmentId: 1,
      rateId: 2
    }
  ]

  props.selectedRates = [
    {
      shipmentId: 3,
      rateId: 4
    },
  ]
  wrapper = shallow(<PostageRates {...props}/>)

  const button = wrapper.find('ul').childAt(1).find('button')
  button.simulate('click', event)
  expect(event.preventDefault).toHaveBeenCalledTimes(1)
  expect(props.setRates).toBeCalledWith(expectedResult)
})