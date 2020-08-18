import React, {useState} from 'react'
import styles from './PostageContainer.module.css'
import Shipment from './Shipment'

import {connect} from 'react-redux'
import {
  displayError, 
  clearError,
} from '../../actions/notification'
import {storeOrder} from '../../actions/order'
  
/*This component renders three different states based on 
the current checkout progress. The three different state are:
before address confirmation, select postage rates and postage 
rates confirmed*/
export const PostageContainer = props => {
  const [selectedRates, setRates] = useState([])

  
  /*This function sends the selected postage rates to update the
  order in the database or if 'cheapest postage' is selected, the
  order will be adjusted to make the post api automatically select
  the cheapest option for all products*/
  const confirmPostageRates = async (event, setLowestRate, rates) => {
    event.preventDefault()
    props.clearError()
    props.setLoading(true)
    props.setLoadingMsg('Confirming Postage Options')

    if (setLowestRate) {
      rates = null
    }
    
    const body = {
      userId: props.user.userId,
      orderId: props.orderId,
      selectedRates: rates
    }

    const response = await props.authApi('/checkout/confirm/postage-rates', props.user.token, body, 'POST', props.displayError)
    
    if (response) {
      props.storeOrder(response.order)
      props.setSecret(response.clientSecret)
    }
    props.setLoading(false)
    props.setLoadingMsg('')
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

  const {order, loading} = props
  
  if (!order.addressConfirmed && !order.postageConfirmed) {
    return <p className={styles.text}>
      Confirm your address to calculate postage
    </p> 
  }

  if(order.addressConfirmed && !order.postageConfirmed) {
    return (
      <form className={styles.selectPostage} aria-live='assertive'>
        <label htmlFor='select-postage-rates'>
          Select postage for each item or choose the cheapest postage for all items
        </label>
        <ul id='select-postage-rates'>
          <Shipment 
            shipments={order.shipments} 
            selectedRates={selectedRates} 
            updatePostageRate={updatePostageRate}/>
        </ul>
        <div className={styles.confirmPostage}>
          <button 
            className={loading ? 'disabled': null} 
            disabled={loading} 
            onClick={(event) => confirmPostageRates(event, false, selectedRates)}>
            Confirm selected postage rates
          </button>
          <button 
            className={loading ? 'disabled': null} 
            onClick={(event) => confirmPostageRates(event, true)} 
            disabled={loading}>
            Confirm cheapest postage for all items
          </button>
        </div>
      </form>
    )
  }

  if (order.addressConfirmed && order.postageConfirmed) {
    return <p className={styles.text}>Postage confirmed</p>
  }
}

const mapStateToProps = state => {
  return {
    order: state.order.order,
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
)(PostageContainer)