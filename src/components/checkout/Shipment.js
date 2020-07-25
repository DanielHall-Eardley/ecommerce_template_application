import React from 'react'
import styles from './Shipment.module.css'
import PostageRates from './PostageRates'

export default ({shipments, selectedRates, updatePostageRate}) => {
  const shipmentArray = shipments.map(shipment => {
    return (
      <li 
        className={styles.shipment} 
        key={shipment.shipmentId} 
        aria-label={'postage rates for ' + shipment.productName}>
        <h4>{shipment.productName}</h4>
        <PostageRates 
          rates={shipment.rates} 
          shipMentId={shipment.shipmentId}
          selectedRates={selectedRates}
          updatePostageRate={updatePostageRate}/>
      </li>
    )
  })

  return shipmentArray
}