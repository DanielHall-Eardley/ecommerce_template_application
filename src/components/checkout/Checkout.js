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
import {storeOrder} from '../../actions/order'
import {storeUser, clearUser} from '../../actions/user'

import checkLogin from '../../helper/checkLogin'

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
  const [street, setStreet] = useState('')
  const [aptUnit, setAptUnit] = useState('')
  const [city, setCity] = useState('')
  const [state, setState] = useState('')
  const [country, setCountry] = useState('')
  const [zipPostcode, setZipPostcode] = useState('')
  const [selectedRates, setRates] = useState([])

  const stripe = useStripe()
  const elements = useElements()
  const navigate = useHistory()

  useEffect(() => {
    props.clearError()
    
    const result = checkLogin()

    if (result.error) {
      props.clearUser()
      return props.displayError(result.error)
    }
    
    props.storeUser(result.user)

    const getOrderSummary = async (headers, userId, orderId) => {
      const res = await fetch(apiHost + `/checkout/summary/${orderId}/${userId}`, {
        headers
      })

      const response = await res.json()
      
      if (response.error) {
        props.displayError(response.error)
      }
  
      props.storeOrder(response)
    }
    
    const headers = {
      'Content-Type': 'application/json',
      'Authorization': props.user.token
    }

    if(props.user.token && props.orderId) {
      getOrderSummary(headers, props.user.userId, props.orderId)
    }
  }, [props.user.token, props.orderId])

  const handlePayment = async (event, clientName) => {
    event.preventDefault()
    props.clearError()
    props.clearNotification()
    setLoading(true)

    if (!stripe || !elements) {
      return setLoading(false)
    }
    console.log(clientSecret)
    const result = await stripe.confirmCardPayment(clientSecret, {
      payment_method: {
        card: elements.getElement(CardElement),
        billing_details: {
          name: clientName
        }
      }
    })

    if (result.error) {
      return props.displayError([result.error])
    }

    if (result.paymentIntent.status === "succeeded") {
      console.log(result)
      props.displayNotification(['Payment confirmed'])
      navigate.push('/')
      setLoading(false)
    }
  }

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

  const updatePostageRate = (event, rateId, shipmentId) => {
    event.preventDefault()

    const shipmentIndex = selectedRates.findIndex(rate => rate.shipmentId === shipmentId)

    const rateObj = {
      shipmentId,
      rateId
    }

    if (shipmentIndex === -1) {
      return setRates([...selectedRates, rateObj])
    }

    const newArray = [
      ...selectedRates.slice(0, shipmentIndex),
      rateObj,
      ...selectedRates.slice(shipmentIndex + 1) 
    ]
   
    setRates(newArray)
  }

  const getPostageRates = async (event) => {
    event.preventDefault()
    props.clearError()
    setLoading(true)
    
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
      zipPostcode
    })
    
    const response = await api('/checkout/postage-rates', body, headers, 'POST')
    
    if (response.error) {
      setLoading(false)
      return displayError(response.error)
    }

    props.storeOrder(response)
    setLoading(false)
  }

  const renderPostageRates = (rates, shipmentId) => {
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

    const rateArray = rates.map(rate => {
      return (
        <li 
          onClick={(event) => updatePostageRate(event, rate.rateId, shipmentId)}
          className={
            checkIfSelected(rate.rateId, shipmentId, selectedRates) ?
            styles.selected :
            null
          } 
          key={rate.rateId}>
          { !rate.guaranteedDeliveryTime ? 
            `Estimated delivery time: ${rate.deliveryTime} days` :
            `Guaranteed delivery in: ${rate.deliveryTime} days`
          }
          <span>{rate.serviceName}</span>
          <div>
            <span className={styles.fee}>${rate.fee}</span>
            <span>{rate.carrier}</span>
          </div>
        </li>
      )
    })

    return rateArray
  }

  const renderShipments = shipments => {

    const shipmentArray = shipments.map(shipment => {
      return (
        <div className={styles.shipment} key={shipment.shipmentId}>
          <h4>{shipment.productName}</h4>
          <ul className={styles.rateList}>
            {renderPostageRates(shipment.rates, shipment.shipmentId)}
          </ul>
        </div>
      )
    })

    return shipmentArray
  }

  const confirmPostageRates = async (event, setLowestRates) => {
    event.preventDefault()
    props.clearError()
    setLoading(true)

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
    console.log(response)
    props.storeOrder(response.order)
    setSecret(response.clientSecret)
    setLoading(false)
  }

  const renderPostageOptions = (order, loading) => {
    if (!order.addressConfirmed && !order.postageConfirmed) {
      return <span>Confirm your address to calculate postage</span> 
    }

    if(order.addressConfirmed && !order.postageConfirmed) {
      return (
        <>
          <label htmlFor="">Select postage for individual items</label>
          {renderShipments(order.shipments)}
          <div className={styles.confirmPostage}>
            <button 
              className={loading ? 'disabled': null} 
              disabled={loading} 
              onClick={(event) => confirmPostageRates(event, false)}>
              Confirm
            </button>
            <p>Or</p>
            <button 
              className={loading ? 'disabled': null} 
              onClick={(event) => confirmPostageRates(event, true)} 
              disabled={loading}>
              Select cheapest postage for all items
            </button>
          </div>
        </>
      )
    }

    if (order.addressConfirmed && order.postageConfirmed) {
      return <span>Postage confirmed</span>
    }
  }

  const {order} = props
  const { token, userId } = props.user

  return (
    <main>
      { props.order ? 
        <div className={styles.checkout} key={order._id}>
          <h3 className={styles.header}>
            <span>Order Id: {order._id}</span>
            <span>
              Status: {order.status[0].toUpperCase() + order.status.slice(1)}
            </span>
          </h3>
          <ul className={styles.products} >
            { order.products.map((product, index) => {
              return (
                <li key={product._id + index} className={styles.productItem}>
                  <span>Product Id: {product._id}</span>
                  <span>Name: {product.name}</span>
                  <span className={styles.price}>${product.price}</span>
                  { !order.addressConfirmed ?
                    <button 
                      className={styles.remove} 
                      onClick={() => removeProduct(product._id, token, userId, props.orderId)}>
                      Remove
                    </button>
                  : null }
                </li>
              )
            })}
          </ul>
          <h3 className={styles.header}>Delivery Address</h3>
          { !order.addressConfirmed ? 
            <form className={styles.address}>
              <div>
                <label htmlFor="">Street</label>
                <input 
                  type="text"
                  value={street}
                  onChange={(event) => setStreet(event.target.value)}/>
              </div>
              <div>
                <label htmlFor="">Apt/Unit</label>
                <input 
                  type="text"
                  value={aptUnit}
                  onChange={(event) => setAptUnit(event.target.value)}/>
              </div>
              <div>
                <label htmlFor="">City</label>
                <input 
                  type="text"
                  value={city}
                  onChange={(event) => setCity(event.target.value)}/>
              </div>
              <div>
                <label htmlFor="">State/Province</label>
                <input 
                  type="text"
                  value={state}
                  onChange={(event) => setState(event.target.value)}/>
              </div>
              <div>
                <label htmlFor="">Country</label>
                <input 
                  type="text"
                  value={country}
                  onChange={(event) => setCountry(event.target.value)}/>
              </div>
              <div>
                <label htmlFor="">Zip/Postcode</label>
                <input 
                  type="text"
                  value={zipPostcode}
                  onChange={(event) => setZipPostcode(event.target.value)}/>
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
          <form className={styles.selectPostage}>
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
            onSubmit={(event) => handlePayment(event, order.customerName)} 
            className={styles.payment}>
            <CardElement options={cardElementOptions} />
            <button className={
              loading || !order.postageConfirmed ?
              'disabled': null
              } 
              disabled={loading || !order.postageConfirmed}>
              Confirm Payment
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
    displayNotification: notfication => dispatch(displayNotification(notfication)),
    clearNotification: () => dispatch(clearNotification()),
  }
}

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(Checkout)

