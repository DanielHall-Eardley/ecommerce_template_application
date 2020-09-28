import React from 'react'
import styles from './PostageRates.module.css'

export default({rates, shipmentId, selectedRates, setRates}) => {
  
  /*This function checks if an individual postage rate 
  is selected and returns a boolean that is used to 
  conditionally add or remove a highlight class*/
  const checkIfSelected = rateId => {
    const shipmentIndex = selectedRates.findIndex(rate => rate.shipmentId === shipmentId)
    
    if (shipmentIndex === -1) {
      return false
    }

    if (selectedRates[shipmentIndex].rateId === rateId) {
      return true
    }

    return false
  }

  
  /*This function updates the selected postage rate for an individual
  product by passing an object containing the shipment id for
  the product and the id for the currently selected postage rate into local state*/
  const updatePostageRate = (event, rateId) => {
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
  
  const rateArray = rates.map(rate => {
    return (
      <li key={rate.rateId}
        className={
          checkIfSelected(rate.rateId) ?
          styles.selected :
          null
        }>
        <button 
          aria-label='select postage rate'
          onClick={(event) => updatePostageRate(event, rate.rateId)}>
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

  return <ul className={styles.rateList}>{rateArray}</ul>
}