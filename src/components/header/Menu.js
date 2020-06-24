import React from 'react'
import styles from './Menu.module.css'
import '../../Global.css'
import {NavLink} from 'react-router-dom'
import {connect} from 'react-redux'
import {clearUser} from '../../actions/user'
import sprite from '../../sprite.svg'

/*This component conditionally renders a navigation menu and cart total
based on login status and user type*/
const Menu = props => {
  const userId = props.user.userId
  const userType = props.user.type

  /*This if statement renders the business admin menu*/
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

    /*This if statement renders the customer menu*/
    return (
      <nav className={styles.nav}>
        <NavLink to='/product'>Products</NavLink>
        <NavLink to='/order'>Orders</NavLink>
        <NavLink to='/checkout'>Checkout</NavLink>
        <NavLink exact={true} to='/'>Home</NavLink> 
        <span className='default-link' onClick={props.clearUser}>Logout</span>
        <div className={styles.cartContainer}>
          <svg className={ props.orderSummary.count > 0 ? styles.cart + ' ' + styles.highlight : styles.cart}>
            <use href={sprite + '#icon-cart'}></use>
          </svg>
          { props.orderSummary.count > 0 ?
            <span className={styles.cartTotal}>{props.orderSummary.count}</span>
          : null}
        </div>
      </nav>
    )
  } else {
    return (
      /*This else statement renders the default menu for if
      no user is logged in. Only the products page can be accessed
      in this state*/
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