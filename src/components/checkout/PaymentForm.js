import React from 'react'
import styles from './PaymentForm.module.css'
import {
  CardElement, 
  useStripe, 
  useElements, 
} from '@stripe/react-stripe-js'

import {useHistory} from 'react-router-dom'
import {connect} from 'react-redux'
import {
  displayError, clearError
} from '../../actions/notification'


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

export const PaymentForm = props => {
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
      props.displayError(result.error.message)
      return null
    }
    return result
  }

  
  /*This function handles the processing the payment after
  the customer has confirmed their card details. If the payment 
  is successful the order is updated in the database and moved
  from the checkout to the next stage of processing*/
  const handlePayment = async (event) => {
    event.preventDefault()
    props.clearError()

    //Activate a screen overlay to prevent user interaction during processing
    props.setLoading(true)
    props.setLoadingMsg('Processing your payment, please do not navigate away from this page')

    if (!stripe || !elements) {
      return props.setLoading(false)
    }
    
    const result = await submitPaymentToStripe(props.order.clientName)
    
    if (result && result.paymentIntent.status === "succeeded") {
      const body = {
        paymentId: result.paymentIntent.id,
        clientSecret: result.paymentIntent.client_secret,
        orderId: props.order._id
      }
      
      const response = await props.authApi('/checkout/confirm/payment', props.token, body, 'PUT', props.displayError)
      
      props.setLoading(false)
      if (response) {
        navigate.push('/order')
      }
    }  
  }


  //Delete the order, which will empty the cart
  const cancelOrder = async (event) => {
    event.preventDefault()
    props.clearError()

    const body = {
      userId: props.userId,
      orderId: props.order._id,
    }
    
    const response = await props.authApi('/checkout/cancel-order', props.token, body, 'DELETE', props.displayError)

    if (response) {
      props.displayNotification(response.msg)
      props.clearOrder()
      navigate.push('/')
    }
  }

  const {loading, order} = props

  return <form 
    id='checkout-payment-form'
    onSubmit={(event) => handlePayment(event)} 
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
    <button onClick={(event) => cancelOrder(event)}>
      Cancel Order
    </button>
  </form>
}

const mapStateToProps = state => {
  return {
    userId: state.user.userId,
    order: state.order.order,
    token: state.user.token
  }
}

const mapDispatchToProps = dispatch => {
  return {
    displayError: error => dispatch(displayError(error)),
    clearError: () => dispatch(clearError()),
  }
}

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(PaymentForm)