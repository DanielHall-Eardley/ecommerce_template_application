import React from 'react'
import styles from './Shipment.module.css'
import PostageRates from './PostageRates'

export default ({shipments, selectedRates, setRates}) => {
  const shipmentArray = shipments.map(shipment => {
    return (
      <li 
        className={styles.shipment} 
        key={shipment.shipmentId} 
        aria-label={'postage rates for ' + shipment.productName}>
        <h4>{shipment.productName}</h4>
        <PostageRates 
          rates={shipment.rates} 
          shipmentId={shipment.shipmentId}
          selectedRates={selectedRates}
          setRates={setRates}/>
      </li>
    )
  })

  return shipmentArray
}