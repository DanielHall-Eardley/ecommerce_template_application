import React from 'react'
import styles from './PostageContainer.module.css'
import Shipment from './Shipment'
  
/*This component renders three different states based on 
the current checkout progress. The three different state are:
before address confirmation, select postage rates and postage 
rates confirmed*/
export default ({order, loading, confirmPostageRates, selectedRates, updatePostageRate}) => {
  if (!order.addressConfirmed && !order.postageConfirmed) {
    return <span>Confirm your address to calculate postage</span> 
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
            updatePostageRates={updatePostageRate}/>
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
      </form>
    )
  }

  if (order.addressConfirmed && order.postageConfirmed) {
    return <span>Postage confirmed</span>
  }
}