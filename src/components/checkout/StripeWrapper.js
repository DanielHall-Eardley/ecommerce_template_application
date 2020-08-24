import React from 'react'
import PaymentForm from './PaymentForm'

import {Elements} from '@stripe/react-stripe-js'
import {loadStripe} from '@stripe/stripe-js'
import {stripeApiKey} from '../../global'
const stripePromise = loadStripe(stripeApiKey)

export default props => {
  return <Elements stripe={stripePromise}>
    <PaymentForm {...props} />
  </Elements>
}