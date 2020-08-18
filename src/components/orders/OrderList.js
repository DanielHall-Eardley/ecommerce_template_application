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

import List from './List'

const OrderList = props => {
  const [selectedOrderList, setList] = useState('pending')

  
  //Retrieve orders from database
  const getOrderList = async (userId, token) => {
    const url = `/order/list/${userId}` 
    const response = await props.getAuthApi(url, token, props.displayError)
     
    if (
      response &&
      response.past.length < 1 
      && (!response.pending || response.pending.length < 1)
    ) {
      props.displayNotification('No orders yet..')
    } else {
      props.storeOrderList(response.past, response.pending)
    }
  }

  
  /*If user is logged in, get all orders relevent to user*/
  useEffect(() => {
    props.clearNotification()
    props.clearError()
    
    const result = props.checkLogin()

    if (result.error) {
      props.clearUser()
      props.displayError(result.error)
    } else {
      props.storeUser(result.user)
      getOrderList(result.user.userId, result.user.token)
    }
  }, []) 

  const toggleOrderTab = (event, tab) => {
    setList(tab)
  }


  /*Orders are sorted into 'pending' which are orders that have been
  payed for but not sent and 'fufilled', orders that have been sent*/
  return (
    <section>
      <div 
        className={styles.select} 
        role='tabpanel' 
        aria-label='select between pending or fulfilled orders'>
        <button 
          role='tab'
          className={
            selectedOrderList === 'past' ?
            styles.selected : null
          }
          onClick={(event) => toggleOrderTab(event, 'past')}>
          Fulfilled
        </button>
        <button 
          role='tab'
          className={
            selectedOrderList === 'pending' ?
            styles.selected : null
          }
          onClick={(event) => toggleOrderTab(event, 'pending')}>
          Pending
        </button>
      </div>
      <List 
        orderList={props[selectedOrderList + 'OrderList']} 
        user={props.user}
        clearError={clearError}
        displayError={displayError}
        storeOrderList={storeOrderList}/>
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
)(OrderList)