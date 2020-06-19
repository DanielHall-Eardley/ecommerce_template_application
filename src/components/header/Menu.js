import React from 'react'
import styles from './Menu.module.css'
import '../../Global.css'
import {NavLink} from 'react-router-dom'
import {connect} from 'react-redux'
import {clearUser} from '../../actions/user'

const Menu = props => {
  const userId = props.user.userId
  const userType = props.user.type

  if (userId && userType === 'admin') {
    return (
      <nav className={styles.nav}>
        <NavLink to='/product'>Products</NavLink>
        <NavLink to='/order'>Orders</NavLink>
        <span className='default-link' onClick={props.clearUser}>Logout</span>
        <NavLink exact={true} to='/'>Home</NavLink> 
      </nav>
    )
  } else if (userId) {
    return (
      <nav className={styles.nav}>
        <NavLink to='/product'>Products</NavLink>
        <NavLink to='/order'>Orders</NavLink>
        <NavLink to='/checkout'>Checkout</NavLink>
        <NavLink exact={true} to='/'>Home</NavLink> 
        <span className='default-link' onClick={props.clearUser}>Logout</span>
        <span className='default-link'>Cart: {props.orderSummary.count}</span>
      </nav>
    )
  } else {
    return (
      <nav className={styles.nav}>
        <NavLink exact={true} to='/'>Home</NavLink> 
        <NavLink to='/product'>Products</NavLink>
        <NavLink to='/login'>Login</NavLink>
        <NavLink exact={true} to='/user/signup'>Signup as a Customer</NavLink>
        <NavLink exact={true} to='/admin/signup'>Signup as a Business</NavLink>
      </nav>
    )
  }
}

const mapStateToProps = state => {
  return {
    user: state.user,
    orderSummary: state.order.summary
  }
}

const mapDispatchToProps = dispatch => {
  return {
    clearUser: () => dispatch(clearUser()),
  }
}

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(Menu)