import React from 'react'

import {shallow} from 'enzyme'
import CheckoutSummary from './CheckoutSummary'

const orderSummary = {
  postageTotal: 45.30,
  count: 5,
  total: 245
}

it('test CheckoutSummary snapshot', () => {
  const wrapper = shallow(<CheckoutSummary order={orderSummary}/>)
  expect(wrapper).toMatchSnapshot()
})