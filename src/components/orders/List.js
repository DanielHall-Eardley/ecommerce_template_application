import React from 'react'
import styles from './List.module.css'
import '../../Global.css'
import {format} from 'date-fns'

export default ({orderList, userType, fulfillOrder, buyLabels}) => {
  let orderArray = orderList

  /*This needed because in some instances the server
  will return a single object instead of an array of objects*/
  if (!Array.isArray(orderList)) {
    orderArray = [orderArray]
  }

  /*This component renders a shipment list for a business 
  admin user and a product list for a customer user. Only the
  shipment list contains the links to print the postage labels*/
  const productOrShipmentList = (order, userType) => {
    if (userType === 'admin' && !order.fulfilled) {
      return order.shipments.map(shipment => {
        return (
          <li key={shipment.shipmentId} className={styles.productItem} aria-label='shipment'>
            <span>Product Id: {shipment.productId}</span>
            <span>Name: {shipment.productName}</span>
            { shipment.postageLabel ?
              <a href={shipment.postageLabel}>Print Label</a>
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
  
  
  /*Renders a list of orders. Certain functionality and information
  is only available to the business admin user, such as the ability
  to purchase postage and mark the order as fulfilled*/
  const renderOrderList = (orders) => {
    return orders.map(order => {
      return (
        <li className={styles.listItem} key={order._id}>
          <h3 className={styles.header}>
            <span>Order Id: {order._id}</span>
            <span>Status: {order.status}</span>
            <span>
            { order.fulfilled ?
              'Sent: ' + format(new Date(order.fulfilled), "do MMM yyyy") :
              'Placed: ' + format(new Date(order.payment), "do MMM yyyy")}
            </span>
          </h3>
          <ul className={styles.products} aria-label='product'>
            {productOrShipmentList(order, userType)}
          </ul>
          <ul className={styles.address} aria-label='address'>
            <li>Street: {order.customerAddress.street1}</li>
            <li>
              Apt/Unit: {order.customerAddress.street2}
            </li>
            <li>City: {order.customerAddress.city}</li>
            <li>State: {order.customerAddress.state}</li>
            <li>Country: {order.customerAddress.country}</li>
            <li>Zip/Postcode: {order.customerAddress.zip}</li>
          </ul>
          { userType === 'admin' ?
            <div className={styles.recipient} aria-label='customer information'>
              <span>Customer: {order.customerName}</span>
              <span>Email: {order.customerEmail}</span>
              <span>Phone: {order.clientPhoneNumber}</span>
            </div> 
          : null }
          <div className={styles.footer}>
            { userType === 'admin' && !order.fulfilled ? 
              <button onClick={() => fulfillOrder(order._id)}>
                Mark as fulfilled
              </button>
            : null }
            { userType === 'admin' && !order.shipments[0].postageLabel ?
              <button onClick={() => buyLabels(order._id)}>
                Buy Shipping Labels
              </button> 
            : null }  
            <span>Amount of items: {order.count}</span>
            <span>Total: {order.total}</span>
          </div>
        </li>
      )
    })
  }

  return (
    <ul className={styles.container} aria-label='order'>
      {renderOrderList(orderArray)}
    </ul>
  )
}

