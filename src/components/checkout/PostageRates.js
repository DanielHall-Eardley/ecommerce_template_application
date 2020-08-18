import React from 'react'
import styles from './PostageRates.module.css'

export default({rates, shipmentId, selectedRates, updatePostageRate}) => {
  
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

  return <ul className={styles.rateList}>{rateArray}</ul>
}