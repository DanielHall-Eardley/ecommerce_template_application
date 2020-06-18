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
import checkLogin from '../../helper/checkLogin'

import List from './List'

const ProductDetail = props => {
  const [selectedOrderList, setList] = useState('pending')

  useEffect(() => {
    props.clearNotification()
    props.clearError()
    
    const result = checkLogin()

    if (result.error) {
      props.clearUser()
      return props.displayError(result.error)
    }
    
    props.storeUser(result.user)

    const getOrderList = async (userId, token) => {
      
      const res = await fetch(`${apiHost}/order/list/${userId}`, {
        headers: {
          'Content-Type': 'application/json',
          'Authorization': token
        }
      })

      const response = await res.json()

      if (response.error) {
        return displayError(response.error)
      }

      if (
        response.past.length < 1 
        && (!response.pending || response.pending.length < 1)
        ) {
        return displayNotification('No orders found')
      }
      console.log(response)
      props.storeOrderList(response.past, response.pending)
    }
    
    if (props.user.token) {
      getOrderList(props.user.userId, props.user.token)
    }
  }, [props.user.token]) 

  return (
    <section>
      <div className={styles.select}>
        <span 
          className={
            selectedOrderList === 'past' ?
            styles.selected : null
          }
          onClick={() => setList('past')}>
          Past
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
      <List orderList={props[selectedOrderList + 'OrderList']} userType={props.user.type}/>
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