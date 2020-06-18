import React from 'react'
import styles from './List.module.css'
import '../../Global.css'

export default ({orderList, userType}) => {
  let orderArray = orderList
  if (!Array.isArray(orderList)) {
    orderArray = [orderArray]
  }
  
  const renderOrderList = (orders) => {
    return orders.map(order => {
      return (
        <div className={styles.listItem} key={order._id}>
          <h3>
            <span>Order Id: {order._id}</span>
            <span>Status: {order.status}</span>
            <span>Placed: {order.updatedAt}</span>
          </h3>
          <ul className={styles.products} >
            { order.products.map(product => {
              return (
                <li key={product.name} className={styles.productItem}>
                  <span>Product Id: {product._id}</span>
                  <span>Name: {product.name}</span>
                  <span>${product.price}</span>
                </li>
              )
            })}
          </ul>
          { userType === 'admin' ?
            <div>
              <ul className={styles.address}>
                <span>Street1: {order.destination.street1}</span>
                <span>Street2: {order.destination.street2}</span>
                <span>city: {order.destination.city}</span>
                <span>state: {order.destination.state}</span>
                <span>Country: {order.destination.country}</span>
                <span>Zip/Postcode: {order.destination.zip}</span>
              </ul>
              <ul className={styles.recipient}>
                <span>Customer: {order.customerName}</span>
                <span>Email: {order.customerEmail}</span>
              </ul> 
            </div>
            : null
          }
          <div className={styles.footer}>
          <span>Amount of items: {order.count}</span>
          <span>Total: {order.total}</span>
          { userType === 'admin' ? 
            <button>Print Shipping Label</button> :
            null
          }
          </div>
        </div>
      )
    })
  }

  return (
    <div className={styles.container}>
      {renderOrderList(orderArray)}
    </div>
  )
}

