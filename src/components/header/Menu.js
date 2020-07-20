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
        <a href='#main-content' id='skip-link'>Skip to main content</a>
        <NavLink to='/product'>Products</NavLink>
        <NavLink to='/order'>Orders</NavLink>
        <button className='default-link btn-link' role='link' onClick={props.clearUser}>Logout</button>
        <NavLink exact={true} to='/'>Home</NavLink> 
      </nav>
    )
    } else if (userId) {

    /*This if statement renders the customer menu*/
    return (
      <nav className={styles.nav}>
        <a href='#main-content' id='skip-link'>Skip to main content</a>
        <NavLink to='/product'>Products</NavLink>
        <NavLink to='/order'>Orders</NavLink>
        <NavLink to='/checkout'>Checkout</NavLink>
        <NavLink exact={true} to='/'>Home</NavLink> 
        <button className='default-link btn-link' role='link' onClick={props.clearUser}>Logout</button>
        <div className={styles.cartContainer}>
          <svg aria-label='Shopping cart icon' className={ props.orderSummary.count > 0 ? styles.cart + ' ' + styles.highlight : styles.cart}>
            <use href={sprite + '#icon-cart'}></use>
          </svg>
          { props.orderSummary.count > 0 ?
            <span 
              aria-label='Number of products in shopping cart'
              aria-live='polite' 
              className={styles.cartTotal}>{props.orderSummary.count}</span>
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
        <a href='#main-content' id='skip-link'>Skip to main content</a>
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