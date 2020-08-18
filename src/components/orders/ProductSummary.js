import React from 'react'
import styles from './ProductSummary.module.css'


/*This component renders a shipment list for a business 
admin user and a product list for a customer user. Only the
shipment list contains the links to print the postage labels*/
export default ({order, userType}) => {
  const renderProductOrShipment = order => {
    if (userType === 'admin' && !order.fulfilled) {
      return order.shipments.map(shipment => {
        return (
          <li key={shipment.shipmentId} className={styles.productItem} aria-label='shipment'>
            <span>Product Id: {shipment.productId}</span>
            <span>Name: {shipment.productName}</span>
            { shipment.postageLabel ?
              <a href={shipment.postageLabel} aria-live='polite'>Print Label</a>
            : null }  
          </li>
        )
      })
    } else {
      return order.products.map(product => {
        return (
          <li key={product.name} className={styles.productItem} aria-label='product'>
            <span>Product Id: {product._id}</span>
            <span>Name: {product.name}</span>
            <span>${product.price}</span>
          </li>
        )
      })
    }
  }

  return <ul className={styles.products} aria-label='product'>{renderProductOrShipment(order)}</ul>
}

