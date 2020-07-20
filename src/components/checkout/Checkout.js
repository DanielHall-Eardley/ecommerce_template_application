import React from 'react'
import {
  CardElement, 
  useStripe, 
  useElements, 
} from '@stripe/react-stripe-js'

import styles from './Checkout.module.css'
import {useEffect, useState} from 'react'

import api from '../../helper/api'
import {apiHost} from '../../global'
import {useHistory} from 'react-router-dom'

import {connect} from 'react-redux'
import {
  displayError, 
  clearError,
  displayNotification,
  clearNotification
} from '../../actions/notification'
import {storeOrder, clearOrder} from '../../actions/order'
import {storeUser, clearUser} from '../../actions/user'

import checkLogin from '../../helper/checkLogin'
import Loading from './Loading'

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

const Checkout = (props) => {
  const [clientSecret, setSecret] = useState(null)
  const [street, setStreet] = useState('')
  const [aptUnit, setAptUnit] = useState('')
  const [city, setCity] = useState('')
  const [state, setState] = useState('')
  const [country, setCountry] = useState('')
  const [zipPostcode, setZipPostcode] = useState('')
  const [phoneNumber, setPhoneNumber] = useState('')
  const [selectedRates, setRates] = useState([])

  const [loading, setLoading] = useState(false)
  const [loadingMsg, setLoadingMsg] = useState('')

  const stripe = useStripe()
  const elements = useElements()
  const navigate = useHistory()

  
  /*This function makes a request to the api to retrieve the current order*/
  const getOrderSummary = async (headers, userId, orderId) => {
    const res = await fetch(apiHost + `/checkout/summary/${orderId}/${userId}`, {
      headers
    })

    const response = await res.json()
    
    if (response.error) {
      props.displayError(response.error)
    }

    props.storeOrder(response.order)
    setSecret(response.clientSecret)
  }

  
  /*This function checks if a user is logged in. 
  If a current order exists and the user is of type: customer,
  the getOrderSummary function is called*/
  useEffect(() => {
    props.clearError()
    
    const result = checkLogin()

    if (result.error) {
      props.clearUser()
      return props.displayError(result.error)
    }
    
    props.storeUser(result.user)

    const headers = {
      'Content-Type': 'application/json',
      'Authorization': props.user.token
    }

    if(props.user.type === 'customer' && props.orderId) {
      getOrderSummary(headers, props.user.userId, props.orderId)
    }
  }, [props.user.token, props.orderId])

  
  /*This function handles the processing the payment after
  the customer has confirmed their card details. If the payment 
  is successful the order is updated in the database and moved
  from the checkout to the next stage of processing*/
  const handlePayment = async (event, clientName, token, orderId) => {
    event.preventDefault()
    props.clearError()
    props.clearNotification()

    //Activate a screen overlay to prevent user interaction during processing
    setLoading(true)
    setLoadingMsg('Processing your payment, please do not navigate away from this page')

    if (!stripe || !elements) {
      return setLoading(false)
    }
    
    
    /*Confirm payment using the client secret 
    which represents a payment that was created when 
    the postage rates were confirmed*/
    const result = await stripe.confirmCardPayment(clientSecret, {
      payment_method: {
        card: elements.getElement(CardElement),
        billing_details: {
          name: clientName
        }
      }
    })
    
    if (result.error) {
      setLoading(false)
      return props.displayError(result.error.message)
    }

    if (result.paymentIntent.status === "succeeded") {
      const headers = {
        'Content-Type': 'application/json',
        'Authorization': token
      }
  
      const body = JSON.stringify({
        paymentId: result.paymentIntent.id,
        clientSecret: result.paymentIntent.client_secret,
        orderId: orderId
      })
      
      const response = await api('/checkout/confirm/payment', body, headers, 'PUT')
  
      if (response.error) {
        setLoading(false)
        return displayError(response.error)
      }

      setLoading(false)
      navigate.push('/order')
    }  
  }

  
  /*This function removes the selected product from the order
  in the database and sends the updated order in the response,
  to update redux state*/
  const removeProduct = async (productId, token, userId, orderId) => {
    props.clearError()
    
    const headers = {
      'Content-Type': 'application/json',
      'Authorization': token
    }

    const body = JSON.stringify({
      productId: productId,
      userId: userId,
      orderId: orderId
    })
    
    const response = await api('/checkout/remove-product', body, headers, 'PUT')

    if (response.error) {
      return displayError(response.error)
    }

    props.storeOrder(response)
  }

  
  /*This function updates the selected postage rate for an individual
  product by passing an object containing the shipment id for
  the product and the id for the currently selected postage rate into local state*/
  const updatePostageRate = (event, rateId, shipmentId) => {
    event.preventDefault()

    /*check to see if a postage rate has alreay been selected*/
    const shipmentIndex = selectedRates.findIndex(rate => rate.shipmentId === shipmentId)

    const rateObj = {
      shipmentId,
      rateId
    }

    //If no rate has been selected append a new rate object to end of array
    if (shipmentIndex === -1) {
      return setRates([...selectedRates, rateObj])
    }

    //Else replace the current rate object
    const newArray = [
      ...selectedRates.slice(0, shipmentIndex),
      rateObj,
      ...selectedRates.slice(shipmentIndex + 1) 
    ]
   
    setRates(newArray)
  }


  /*This function submits an api request which simultaneously 
  validates the customer's address and gets postage rates
  for each product in the order*/
  const getPostageRates = async (event) => {
    event.preventDefault()
    props.clearError()
    setLoading(true)
    setLoadingMsg('Checking delivery address')
    
    const headers = {
      'Content-Type': 'application/json',
      'Authorization': props.user.token
    }

    const body = JSON.stringify({
      userId: props.user.userId,
      orderId: props.orderId,
      street,
      aptUnit,
      city,
      state,
      country,
      zipPostcode,
      phoneNumber
    })
    
    const response = await api('/checkout/postage-rates', body, headers, 'POST')
    
    if (response.error) {
      setLoading(false)
      return displayError(response.error)
    }

    props.storeOrder(response)
    setLoading(false)
    setLoadingMsg('')
  }


  /*This function checks if an individual postage rate 
  is selected and returns a boolean that is used to 
  conditionally add or remove a highlight class*/
  const checkIfSelected = (rateId, shipmentId, selectedRates) => {
    const shipmentIndex = selectedRates.findIndex(rate => rate.shipmentId === shipmentId)
    
    if (shipmentIndex === -1) {
      return false
    }

    if (selectedRates[shipmentIndex].rateId === rateId) {
      return true
    }

    return false
  }


  const renderPostageRates = (rates, shipmentId) => {
    const rateArray = rates.map(rate => {
      return (
        <li key={rate.rateId}
          className={
            checkIfSelected(rate.rateId, shipmentId, selectedRates) ?
            styles.selected :
            null
          }>
          <button 
            aria-label='select postage rate'
            onClick={(event) => updatePostageRate(event, rate.rateId, shipmentId)}>
            <span>
              { !rate.guaranteedDeliveryTime ? 
                `Estimated delivery time: ${rate.deliveryTime} days` :
                `Guaranteed delivery in: ${rate.deliveryTime} days`
              }
            </span>
            <span>{rate.serviceName}</span>
            <div className={styles.carrierAndFee}>
              <span className={styles.fee}>${rate.fee}</span>
              <span>{rate.carrier}</span>
            </div>
          </button>
        </li>
      )
    })

    return rateArray
  }

  
  const renderShipments = shipments => {
    const shipmentArray = shipments.map(shipment => {
      return (
        <li 
          className={styles.shipment} 
          key={shipment.shipmentId} 
          aria-label={'postage rates for ' + shipment.productName}>
          <h4>{shipment.productName}</h4>
          <ul className={styles.rateList}>
            {renderPostageRates(shipment.rates, shipment.shipmentId)}
          </ul>
        </li>
      )
    })

    return shipmentArray
  }


  //Delete the order, which will empty the cart
  const cancelOrder = async (event, orderId, userId, token) => {
    event.preventDefault()
    props.clearError()
    
    const headers = {
      'Content-Type': 'application/json',
      'Authorization': token
    }

    const body = JSON.stringify({
      userId: userId,
      orderId: orderId,
    })
    
    const response = await api('/checkout/cancel-order', body, headers, 'DELETE')
    
    if (response.error) {
      return props.displayError(response.error)
    }

    props.displayNotification(response.msg)
    props.clearOrder()
    navigate.push('/')
  }

  /*This function sends the selected postage rates to update the
  order in the database or if 'cheapest postage' is selected, the
  order will be adjusted to make the post api automatically select
  the cheapest option for all products*/
  const confirmPostageRates = async (event, setLowestRates) => {
    event.preventDefault()
    props.clearError()
    setLoading(true)
    setLoadingMsg('Confirming Postage Options')

    let rates = selectedRates

    if (setLowestRates) {
      rates = null
    }
    
    const headers = {
      'Content-Type': 'application/json',
      'Authorization': props.user.token
    }

    const body = JSON.stringify({
      userId: props.user.userId,
      orderId: props.orderId,
      selectedRates: rates
    })
    
    const response = await api('/checkout/confirm/postage-rates', body, headers, 'POST')
    
    if (response.error) {
      setLoading(false)
      return displayError(response.error)
    }
    
    props.storeOrder(response.order)
    setSecret(response.clientSecret)
    setLoading(false)
    setLoadingMsg('')
  }

  
  /*This component renders three different states based on 
  the current checkout progress. The three different state are:
  before address confirmation, select postage rates and postage 
  rates confirmed*/
  const renderPostageOptions = (order, loading) => {
    if (!order.addressConfirmed && !order.postageConfirmed) {
      return <span>Confirm your address to calculate postage</span> 
    }

    if(order.addressConfirmed && !order.postageConfirmed) {
      return (
        <>
          <label htmlFor='select-postage-rates'>
            Select postage for each item or choose the cheapest postage for all items
          </label>
          <ul id='select-postage-rates'>
            {renderShipments(order.shipments)}
          </ul>
          <div className={styles.confirmPostage}>
            <button 
              className={loading ? 'disabled': null} 
              disabled={loading} 
              onClick={(event) => confirmPostageRates(event, false)}>
              Confirm selected postage rates
            </button>
            <button 
              className={loading ? 'disabled': null} 
              onClick={(event) => confirmPostageRates(event, true)} 
              disabled={loading}>
              Confirm cheapest postage for all items
            </button>
          </div>
        </>
      )
    }

    if (order.addressConfirmed && order.postageConfirmed) {
      return <span>Postage confirmed</span>
    }
  }

  
  const renderProducts = productArray => {
    const products = productArray.map((product, index) => {
      return (
        <li key={product._id + index} className={styles.productItem}>
          <span>Product Id: {product._id}</span>
          <span>Name: {product.name}</span>
          <span className={styles.price}>${product.price}</span>
          { !order.addressConfirmed ?
            <button 
              className={styles.remove} 
              onClick={() => removeProduct(product._id, token, userId, props.orderId)}>
              Remove Product
            </button>
          : null }
        </li>
      )
    })

    return products
  }

  const {order} = props
  const { token, userId } = props.user

  return (
    <main>
      { loading ? <Loading msg={loadingMsg}/> : null}
      { order ? 
        <div className={styles.checkout} key={order._id} aria-label='checkout'>
          <h3 className={styles.header}>
            <span>Order Id: {order._id}</span>
          </h3>
          <ul className={styles.products} aria-label='products'>
            {renderProducts(order.products)}
          </ul>
          <h3 className={styles.header}>Delivery Address</h3>
          { !order.addressConfirmed ? 
            <form className={styles.address} aria-live='polite'>
              <div>
                <label htmlFor="street">Street</label>
                <input 
                  type="text"
                  id='street'
                  value={street}
                  onChange={(event) => setStreet(event.target.value)}/>
              </div>
              <div>
                <label htmlFor="apt">Apt/Unit</label>
                <input 
                  type="text"
                  id='apt'
                  value={aptUnit}
                  onChange={(event) => setAptUnit(event.target.value)}/>
              </div>
              <div>
                <label htmlFor="city">City</label>
                <input 
                  type="text"
                  id='city'
                  value={city}
                  onChange={(event) => setCity(event.target.value)}/>
              </div>
              <div>
                <label htmlFor="state">State/Province</label>
                <input 
                  type="text"
                  id='state'
                  value={state}
                  onChange={(event) => setState(event.target.value)}/>
              </div>
              <div>
                <label htmlFor="country">Country</label>
                <input 
                  type="text"
                  id='country'
                  value={country}
                  onChange={(event) => setCountry(event.target.value)}/>
              </div>
              <div>
                <label htmlFor="postcode">Zip/Postcode</label>
                <input 
                  id='postcode'
                  type="text"
                  value={zipPostcode}
                  onChange={(event) => setZipPostcode(event.target.value)}/>
              </div>
              <div>
                <label htmlFor="phone-number">Phone Number</label>
                <input 
                  id='phone-number'
                  type="text"
                  value={phoneNumber}
                  onChange={(event) => setPhoneNumber(event.target.value)}/>
              </div>
              <button 
                className={loading ? 'disabled': null} 
                onClick={getPostageRates}
                disabled={loading}>
                Confirm Address
              </button>
            </form>
          : <p className={styles.addressConfirmed}>Address Confirmed</p> }
          <h3 className={styles.header}>Postage</h3>
          <form className={styles.selectPostage} aria-live='polite'>
            {renderPostageOptions(order, loading)}
          </form>
          <h3 className={styles.header}>Summary</h3>
          <div className={styles.summary}>
            <span>
              Postage: {
              !order.postageTotal ? 
              'Confirm postage options' : 
              '$' + order.postageTotal
              }
            </span>
            <span>Amount of items: {order.count}</span>
            <span>Total: ${order.total}</span>
          </div>
          <h3 className={styles.header}>Complete Payment</h3>
          <form 
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
        </div> 
      : <p className={styles.fallBack}>Add items to cart to create order</p>}
    </main>
  )
}

const mapStateToProps = state => {
  return {
    order: state.order.order,
    user: state.user,
    orderId: state.order.summary.orderId
  }
}

const mapDispatchToProps = dispatch => {
  return {
    displayError: error => dispatch(displayError(error)),
    storeOrder: order => dispatch(storeOrder(order)),
    storeUser: order => dispatch(storeUser(order)),
    clearError: () => dispatch(clearError()),
    clearUser: () => dispatch(clearUser()),
    clearOrder: () => dispatch(clearOrder()),
    displayNotification: notfication => dispatch(displayNotification(notfication)),
    clearNotification: () => dispatch(clearNotification()),
  }
}

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(Checkout)

