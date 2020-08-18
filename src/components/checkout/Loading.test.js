import React from 'react'

import {shallow} from 'enzyme'
import Loading from './Loading'

it('test CheckoutSummary snapshot', () => {
  const wrapper = shallow(<Loading msg='A message'/>)
  expect(wrapper).toMatchSnapshot()
})