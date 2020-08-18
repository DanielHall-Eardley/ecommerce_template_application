import React, {useState} from 'react'
import styles from './Address.module.css'
import { connect } from 'react-redux'

import {displayError, clearError} from '../../actions/notification'
import {storeOrder} from '../../actions/order'

export const Address = props => {
  const [street, setStreet] = useState('')
  const [aptUnit, setAptUnit] = useState('')
  const [city, setCity] = useState('')
  const [state, setState] = useState('')
  const [country, setCountry] = useState('')
  const [zipPostcode, setZipPostcode] = useState('')
  const [phoneNumber, setPhoneNumber] = useState('')

  /*This function submits an api request which simultaneously 
  validates the customer's address and gets postage rates
  for each product in the order*/
  const getPostageRates = async () => {
    props.clearError()
    props.setLoading(true)
    props.setLoadingMsg('Checking delivery address')

    const body = {
      userId: props.userId,
      orderId: props.orderId,
      street: street,
      aptUnit: aptUnit,
      city: city,
      state: state,
      country: country,
      zipPostcode: zipPostcode,
      phoneNumber: phoneNumber
    }
    
    const response = await props.authApi('/checkout/postage-rates', props.token, body, 'POST', props.displayError)
    
    if (response) {
      props.storeOrder(response.order)
    } 

    props.setLoading(false)
    props.setLoadingMsg('')
  }

  return <form className={styles.address} aria-live='assertive'>
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
      className={props.loading ? 'disabled': null} 
      onClick={getPostageRates}
      disabled={props.loading}>
      Confirm Address
    </button>
  </form>
}

const mapStateToProps = state => {
  return {
    userId: state.user.userId,
    orderId: state.order.summary.orderId,
    token: state.user.token
  }
}

const mapDispatchToProps = dispatch => {
  return {
    displayError: error => dispatch(displayError(error)),
    storeOrder: order => dispatch(storeOrder(order)),
    clearError: () => dispatch(clearError()),
  }
}

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(Address)