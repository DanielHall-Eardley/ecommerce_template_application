import React from 'react'
import {CardElement, useStripe, useElements} from '@stripe/react-stripe-js'
import styles from './Checkout.module.css'
import {useEffect, useState} from 'react'
import api from '../../helper/api'

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

export default (props) => {
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
      //update central state error management
      console.log(result.error)
      return
    }

    if (result.paymentIntent.status === "succeeded") {
      console.log(result)
      //update central state notifcation management
      //navigate away from 
      setLoading(false)
    }
  }

  return (
    //add order summary 
    //add postal rates
    <form onSubmit={handleSubmit}>
      <label>
        Enter Your Card Details to complete your purchase
      </label>
      <CardElement options={cardElementOptions} />
      <button disabled={loading}>Confirm Payment</button>
    </form>
  )
}