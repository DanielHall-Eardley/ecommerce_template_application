import React, {useEffect, useState} from 'react'
import styles from './OrderList.module.css'
import '../../Global.css'
import {connect} from 'react-redux'
import {storeOrderList} from '../../actions/order'
import {storeUser, clearUser} from '../../actions/user'
import {
  displayNotification, 
  clearNotification,
  displayError,
  clearError
} from '../../actions/notification'
import {apiHost} from '../../global'
import api from '../../helper/api'
import checkLogin from '../../helper/checkLogin'

import List from './List'

const ProductDetail = props => {
  const [selectedOrderList, setList] = useState('pending')

  //Retrieve orders from database
  const getOrderList = async (userId, token) => {
    const res = await fetch(`${apiHost}/order/list/${userId}`, {
      headers: {
        'Content-Type': 'application/json',
        'Authorization': token
      }
    })

    const response = await res.json()

    if (response.error) {
      return props.displayError(response.error)
    }

    if (
      response.past.length < 1 
      && (!response.pending || response.pending.length < 1)
      ) {
      return props.displayNotification('No orders found')
    }
    
    props.storeOrderList(response.past, response.pending)
  }

  
  /*If user is logged in, get all orders relevent to user*/
  useEffect(() => {
    props.clearNotification()
    props.clearError()
    
    const result = checkLogin()

    if (result.error) {
      props.clearUser()
      return props.displayError(result.error)
    }
    
    props.storeUser(result.user)

    if (props.user.token) {
      getOrderList(props.user.userId, props.user.token)
    }
  }, [props.user.token]) 


  /*Buy the postage labels based on the postage rate
  options the customer has selected*/
  const buyLabels = async (orderId) => {
    const headers = {
      'Content-Type': 'application/json',
      'Authorization': props.user.token
    }

    const body = JSON.stringify({
      userId: props.user.userId,
      orderId,
    })
    
    const response = await api('/order/postage-label', body, headers, 'POST')
    
    if (response.error) {
      return props.displayError(response.error)
    }

    props.storeOrderList(response.past, response.pending)
  }

  
  /*Submit a api request to mark the order as fulfilled*/
  const fulfillOrder = async (orderId) => {
    const headers = {
      'Content-Type': 'application/json',
      'Authorization': props.user.token
    }

    const body = JSON.stringify({
      userId: props.user.userId,
      orderId,
    })
    
    const response = await api('/order/fulfill', body, headers, 'PUT')

    if (response.error) {
      return props.displayError(response.error)
    }

    props.storeOrderList(response.past, response.pending)
  }


  /*Orders are sorted into 'pending' which are orders that have been
  payed for but not sent and 'fufilled', orders that have been sent*/
  return (
    <section>
      <div className={styles.select}>
        <span 
          className={
            selectedOrderList === 'past' ?
            styles.selected : null
          }
          onClick={() => setList('past')}>
          Fulfilled
        </span>
        <span 
          className={
            selectedOrderList === 'pending' ?
            styles.selected : null
          }
          onClick={() => setList('pending')}>
          Pending
        </span>
      </div>
      <List 
        orderList={props[selectedOrderList + 'OrderList']} 
        userType={props.user.type}
        fulfillOrder={fulfillOrder}
        buyLabels={buyLabels}/>
    </section>
  )
}

const mapStateToProps = state => {
  return {
    pendingOrderList: state.order.pendingOrderList,
    pastOrderList: state.order.pastOrderList,
    user: state.user,
  }
}

const mapDispatchToProps = dispatch => {
  return {
    storeOrderList: (past, pending) => dispatch(storeOrderList(past, pending)),
    displayNotification: (notification) => dispatch(displayNotification(notification)),
    clearNotification: () => dispatch(clearNotification()),
    clearError: () => dispatch(clearError()),
    clearUser: () => dispatch(clearUser()),
    storeUser: user => dispatch(storeUser(user)),
    displayError: (error) => dispatch(displayError(error)),
  }
}

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(ProductDetail)