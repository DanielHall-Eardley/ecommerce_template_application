import React, {useState} from 'react'

import {connect} from 'react-redux'
import {
  displayError, 
  clearError,
  displayNotification,
  clearNotification
} from '../../actions/notification'
import {storeOrder, clearOrder} from '../../actions/order'
import {storeUser, clearUser} from '../../actions/user'

import detectCssSupport from '../../helper/detectCssSupport'
import Loading from './Loading'

import PostageContainer from './PostageContainer'
import ProductSummary from './ProductSummary'
import CheckoutSummary from './CheckoutSummary'
import PaymentForm from './PaymentForm'

import defaultStyles from './Checkout.module.css'
import fallBackStyles from './CheckoutFallback.module.css'
let styles = defaultStyles

if (!detectCssSupport()) {
  styles = fallBackStyles
}

export const Checkout = props => {
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

  
  /*This function makes a request to the api to retrieve the current order*/
  const getCheckoutSummary = async (errorHandler, userId, orderId, token) => {
    const url  = `/checkout/summary/${orderId}/${userId}`
    const response = await props.getAuthApi(url, token, errorHandler)

    if (response) {
      props.storeOrder(response.order)
      setSecret(response.clientSecret)
    }
  }

  /*This function checks if a user is logged in. 
  If a current order exists and the user is of type: customer,
  the getOrderSummary function is called*/
  React.useEffect(() => {
    props.clearError()
    
    const result = props.checkLogin()

    if (result.error) {
      props.clearUser()
      props.displayError(result.error)
    } else {
      props.storeUser(result.user)

      if(result.user.type === 'customer' && props.rderId) {
        getCheckoutSummary(props.displayError, result.user.userId, props.orderId, result.user.token)
      }
    } 
  }, [props.orderId])

  
  /*This function removes the selected product from the order
  in the database and sends the updated order in the response,
  to update redux state*/
  const removeProduct = async (productId, token, userId, orderId) => {
    props.clearError()

    const body = {
      productId: productId,
      userId: userId,
      orderId: orderId
    }
    
    const response = await props.authApi('/checkout/remove-product', token, body, 'PUT', props.displayError)

    if (response) {
      props.storeOrder(response)
    }
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

    const body = {
      userId: props.user.userId,
      orderId: props.orderId,
      street,
      aptUnit,
      city,
      state,
      country,
      zipPostcode,
      phoneNumber
    }
    
    const response = await props.authApi('/checkout/postage-rates', props.token, body, 'POST', props.displayError)
    
    if (response) {
      props.storeOrder(response)
    } 

    setLoading(false)
    setLoadingMsg('')
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
    
    const body = {
      userId: props.user.userId,
      orderId: props.orderId,
      selectedRates: rates
    }
    
    const response = await props.authApi('/checkout/confirm/postage-rates', props.token, body, 'POST', props.displayError)
    
    if (response) {
      props.storeOrder(response.order)
      setSecret(response.clientSecret)
    }
    setLoading(false)
    setLoadingMsg('')
  }

  const {order} = props

  return (
    <main aria-busy={loading}>
      { loading ? <Loading msg={loadingMsg}/> : null}
      { order ? 
        <div className={styles.checkout} key={order._id} aria-label='checkout'>
          <h3 className={styles.header}>
            <span>Order Id: {order._id}</span>
          </h3>
          <ProductSummary 
            order={order} 
            user={props.user} 
            removeProduct={removeProduct}/>
          <h3 className={styles.header}>Delivery Address</h3>
          { !order.addressConfirmed ? 
            <form className={styles.address} aria-live='assertive'>
              <div>
                <label htmlFor="street">Street</label>
                <input 
                  required
                  aria-required='true'
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
                  required
                  aria-required='true'
                  type="text"
                  id='city'
                  value={city}
                  onChange={(event) => setCity(event.target.value)}/>
              </div>
              <div>
                <label htmlFor="state">State/Province</label>
                <input 
                  required
                  aria-required='true'
                  type="text"
                  id='state'
                  value={state}
                  onChange={(event) => setState(event.target.value)}/>
              </div>
              <div>
                <label htmlFor="country">Country</label>
                <input 
                  required
                  aria-required='true'
                  type="text"
                  id='country'
                  value={country}
                  onChange={(event) => setCountry(event.target.value)}/>
              </div>
              <div>
                <label htmlFor="postcode">Zip/Postcode</label>
                <input  
                  required
                  aria-required='true'
                  id='postcode'
                  type="text"
                  value={zipPostcode}
                  onChange={(event) => setZipPostcode(event.target.value)}/>
              </div>
              <div>
                <label htmlFor="phone-number">Phone Number</label>
                <input  
                  required
                  aria-required='true'
                  id='phone-number'
                  type="text"
                  value={phoneNumber}
                  onChange={(event) => setPhoneNumber(event.target.value)}/>
              </div>
              <button 
                id='checkout-confirm-address'
                className={loading ? 'disabled': null} 
                onClick={getPostageRates}
                disabled={loading}>
                Confirm Address
              </button>
            </form>
          : <p className={styles.addressConfirmed}>Address Confirmed</p> }
          <h3 className={styles.header}>Postage</h3>
          <PostageContainer  
            order={order} 
            loading={loading} 
            confirmPostageRates={confirmPostageRates}
            selectedRates={selectedRates}
            updatePostageRate={updatePostageRate}
            />
          <h3 className={styles.header}>Summary</h3>
          <CheckoutSummary order={order}/>
          <PaymentForm
            order={order} 
            token={props.user.token}
            clientSecret={clientSecret} 
            loading={loading}
            errorHandler={props.displayError}
            setLoading={setLoading}
            setLoadingMsg={setLoadingMsg}/>
          <h3 className={styles.header}>Complete Payment</h3>
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

