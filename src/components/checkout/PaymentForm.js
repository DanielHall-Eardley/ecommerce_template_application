import React from 'react'
import styles from './PaymentForm.module.css'
import {
  CardElement, 
  useStripe, 
  useElements, 
} from '@stripe/react-stripe-js'

import {useHistory} from 'react-router-dom'


//stripe configuration options
const cardElementOptions = {
  style: {
    base: {
      color: "#32325d",
      fontFamily: '"Helvetica Neue", Helvetica, sans-serif',
      fontSmoothing: "antialiased",
      fontSize: "1.3rem",
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

export default props => {
  const stripe = useStripe()
  const elements = useElements()
  const navigate = useHistory()

   
  /*This function makes an api request to stripe 
  with the client secret which represents the payment details and 
  to attempts to confirm the charge that was created when the 
  postage rates were confirmed*/
  const submitPaymentToStripe = async (clientName) => {
    const result = await stripe.confirmCardPayment(props.clientSecret, {
      payment_method: {
        card: elements.getElement(CardElement),
        billing_details: {
          name: clientName
        }
      }
    })
    
    if (result.error) {
      props.setLoading(false)
      props.errorHandler(result.error.message)
      return null
    }
    return result
  }

  
  /*This function handles the processing the payment after
  the customer has confirmed their card details. If the payment 
  is successful the order is updated in the database and moved
  from the checkout to the next stage of processing*/
  const handlePayment = async (event, clientName, token, orderId) => {
    event.preventDefault()
    props.clearError()
    props.clearNotification()

    //Activate a screen overlay to prevent user interaction during processing
    props.setLoading(true)
    props.setLoadingMsg('Processing your payment, please do not navigate away from this page')

    if (!stripe || !elements) {
      return props.setLoading(false)
    }
    
    const result = await submitPaymentToStripe(clientName)
    
    if (result && result.paymentIntent.status === "succeeded") {
      const body = {
        paymentId: result.paymentIntent.id,
        clientSecret: result.paymentIntent.client_secret,
        orderId: orderId
      }
      
      const response = await props.authApi('/checkout/confirm/payment', token, body, 'PUT', props.displayError)
      
      props.setLoading(false)
      if (response) {
        navigate.push('/order')
      }
    }  
  }


  //Delete the order, which will empty the cart
  const cancelOrder = async (event, orderId, userId, token) => {
    event.preventDefault()
    props.clearError()

    const body = {
      userId: userId,
      orderId: orderId,
    }
    
    const response = await props.authApi('/checkout/cancel-order', token, body, 'DELETE', props.displayError)

    if (response) {
      props.displayNotification(response.msg)
      props.clearOrder()
      navigate.push('/')
    }
  }

  const {loading, order} = props
  return <form 
    onSubmit={(event) => handlePayment(event, order.customerName, props.user.token, order._id)} 
    className={styles.payment}
    aria-label='enter card details'>
    <CardElement options={cardElementOptions} />
    <button className={
      loading || !order.postageConfirmed ?
      'disabled': null
      } 
      disabled={loading || !order.postageConfirmed}>
      Confirm Payment
    </button>
    <button onClick={(event) => cancelOrder(event, order._id, order.customerId, props.user.token)}>
      Cancel Order
    </button>
  </form>
}