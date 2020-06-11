import React from 'react'
import {loadStripe} from '@stripe/stripe-js'
import {
  CardElement, 
  useStripe, 
  useElements, 
  Elements
} from '@stripe/react-stripe-js'

import styles from './Checkout.module.css'
import {useEffect, useState} from 'react'
import api from '../../helper/api'
import {connect} from 'react-redux'
import {
  displayError, 
  clearError,
  displayNotification,
  clearNotification
} from '../../actions/notification'
import Notification from '../notification/Notification'

const stripePromise = loadStripe('pk_test_Bo8TQrRb1VZuEd1bzgFJXSqC00ofaJvGQu')

const cardElementOptions = {
  style: {
    base: {
      color: "#32325d",
      fontFamily: '"Helvetica Neue", Helvetica, sans-serif',
      fontSmoothing: "antialiased",
      fontSize: "16px",
      "::placeholder": {
        color: "#aab7c4",
      },
    },
    invalid: {
      color: "#fa755a",
      iconColor: "#fa755a",
    },
  },
};

const Checkout = (props) => {
  const [clientSecret, setSecret] = useState(null)
  const [loading, setLoading] = useState(false)

  const stripe = useStripe()
  const elements = useElements()

  useEffect(() => {
    const headers = {
      'Content-Type': 'application/json'
    }
    const body = JSON.stringify({
      amount: 50,
      currency: 'cad'
    })

    const getClientSecret = async (body, headers) => {
      const response = await api('payment/create', body, headers, 'POST')
      setSecret(response.clientSecret)
    }

    getClientSecret(body, headers)
  }, [])

  const handleSubmit = async (event) => {
    props.clearError()
    props.clearNotification()
    event.preventDefault()
    setLoading(true)

    if (!stripe || !elements) {
      return setLoading(false)
    }

    const result = await stripe.confirmCardPayment(clientSecret, {
      payment_method: {
        card: elements.getElement(CardElement),
        billing_details: {
          name: 'some person'
        }
      }
    })

    if (result.error) {
      return props.displayError([result.error])
    }

    if (result.paymentIntent.status === "succeeded") {
      console.log(result)
      props.displayNotification(['Payment confirmed'])
      //navigate away from 
      setLoading(false)
    }
  }

  return (
    //add order summary 
    //add postal rates
    <Elements stripe={stripePromise}>
      <Notification error={props.error} notification={props.notification}/>
      <form onSubmit={handleSubmit}>
        <label>
          Enter Your Card Details to complete your purchase
        </label>
        <CardElement options={cardElementOptions} />
        <button disabled={loading}>Confirm Payment</button>
      </form>
    </Elements>
  )
}

const mapStateToProps = state => {
  console.log(state)
  return {
    error: state.notification.error,
    notification: state.notification.notification
  }
}

const mapDispatchToProps = dispatch => {
  return {
    displayError: error => dispatch(displayError(error)),
    clearError: () => dispatch(clearError),
    displayNotification: notfication => dispatch(displayNotification(notfication)),
    clearNotification: () => dispatch(clearNotification),
  }
}

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(Checkout)

