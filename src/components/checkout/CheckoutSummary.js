import React from 'react'
import styles from './CheckoutSummary.module.css'

export default ({order}) => {
  return (
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
  )
}
