import React from 'react'
import styles from './List.module.css'
import '../../Global.css'
import {format} from 'date-fns'
import ProductSummary from './ProductSummary'

export default props => {
  let orderArray = props.orderList

  
  /*This needed because in some instances the server
  will return a single object instead of an array of objects*/
  if (!Array.isArray(props.orderList)) {
    orderArray = [orderArray]
  }

  
  /*Buy the postage labels based on the postage rate
  options the customer has selected*/
  const buyLabels = async (orderId) => {
    props.clearError()
    const body = {
      userId: props.user.userId,
      orderId,
    }
    
    const response = await props.authApi('/order/postage-label', props.user.token, body, 'POST', props.displayError)
    
    if (response) {
      props.storeOrderList(response.past, response.pending)
    }
  }

  
  /*Submit a api request to mark the order as fulfilled*/
  const fulfillOrder = async (orderId) => {
    props.clearError()
    const body = {
      userId: props.user.userId,
      orderId,
    }
    
    const response = await props.authApi('/order/fulfill', props.user.token, body, 'PUT', props.errorHandler)

    if (response) {
      props.storeOrderList(response.past, response.pending)
    }
  }
  
  const userType = props.user.type


  /*Renders a list of orders. Certain functionality and information
  is only available to the business admin user, such as the ability
  to purchase postage and mark the order as fulfilled*/
  return (
    <ul className={styles.container} aria-label='order'>
      {orderArray.order.map(order => {
        return <li className={styles.listItem} key={order._id}>
          <h3 className={styles.header}>
            <span>Order Id: {order._id}</span>
            <span>Status: {order.status}</span>
            <span>
            { order.fulfilled ?
              'Sent: ' + format(new Date(order.fulfilled), "do MMM yyyy") :
              'Placed: ' + format(new Date(order.payment), "do MMM yyyy")}
            </span>
          </h3>
          <ProductSummary order={order} userType={userType}/>
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
      })}
    </ul>
  )
}

