import React, {useState} from 'react'

import {connect} from 'react-redux'
import {
  displayError, 
  clearError,
  displayNotification,
  clearNotification
} from '../../actions/notification'
import {storeOrder, clearOrder} from '../../actions/order'
import {storeUser, clearUser} from '../../actions/user'

import detectCssSupport from '../../helper/detectCssSupport'
import Loading from './Loading'

import PostageContainer from './PostageContainer'
import ProductSummary from './ProductSummary'
import CheckoutSummary from './CheckoutSummary'
import PaymentForm from './PaymentForm'
import Address from './Address'

import defaultStyles from './Checkout.module.css'
import fallBackStyles from './CheckoutFallback.module.css'
let styles = defaultStyles

if (!detectCssSupport()) {
  styles = fallBackStyles
}

export const Checkout = props => {
  const [clientSecret, setSecret] = useState(null)
  const [loading, setLoading] = useState(false)
  const [loadingMsg, setLoadingMsg] = useState('')

  
  /*This function makes a request to the api to retrieve the current order*/
  const getCheckoutSummary = async (userId, token) => {
    const url  = `/checkout/summary/${props.orderId}/${userId}`
    const response = await props.getAuthApi(url, token, props.displayError)

    if (response) {
      props.storeOrder(response.order)
      setSecret(response.clientSecret)
    }
  }

  
  /*This function checks if a user is logged in. 
  If a current order exists and the user is of type: customer,
  the getOrderSummary function is called*/
  React.useEffect(() => {
    props.clearError()
    
    const result = props.checkLogin()

    if (result.error) {
      props.clearUser()
      props.displayError(result.error)
    } else {
      props.storeUser(result.user)

      if(result.user.type === 'customer' && props.orderId) {
        getCheckoutSummary(result.user.userId, result.user.token)
      }
    } 
  }, [props.orderId])

  const {order} = props

  return (
    <main aria-busy={loading}>
      { loading ? <Loading msg={loadingMsg}/> : null}
      { order ? 
        <div className={styles.checkout} key={order._id} aria-label='checkout'>
          <h3 className={styles.header}>
            <span>Order Id: {order._id}</span>
          </h3>
          <ProductSummary authApi={props.authApi}/>
          <h3 className={styles.header}>Delivery Address</h3>
          { !order.addressConfirmed ? 
          <Address 
            setLoading={setLoading} 
            loading={loading}
            setLoadingMsg={setLoadingMsg}
            authApi={props.authApi}/>
          : <p className={styles.addressConfirmed}>Address Confirmed</p> }
          <h3 className={styles.header}>Postage</h3>
          <PostageContainer   
            setLoading={setLoading} 
            loading={loading}
            setLoadingMsg={setLoadingMsg}
            authApi={props.authApi}
            setSecret={setSecret}/>
          <h3 className={styles.header}>Summary</h3>
          <CheckoutSummary order={order}/>
          <h3 className={styles.header}>Complete Payment</h3>
          <PaymentForm
            authApi={props.authApi}
            clientSecret={clientSecret} 
            loading={loading}
            setLoading={setLoading}
            setLoadingMsg={setLoadingMsg}/>
        </div> 
      : <p className={styles.fallBack}>Add items to cart to create order</p>}
    </main>
  )
}

const mapStateToProps = state => {
  return {
    order: state.order.order,
    user: state.user,
    orderId: state.order.summary.orderId
  }
}

const mapDispatchToProps = dispatch => {
  return {
    displayError: error => dispatch(displayError(error)),
    storeOrder: order => dispatch(storeOrder(order)),
    storeUser: order => dispatch(storeUser(order)),
    clearError: () => dispatch(clearError()),
    clearUser: () => dispatch(clearUser()),
    clearOrder: () => dispatch(clearOrder()),
    displayNotification: notfication => dispatch(displayNotification(notfication)),
    clearNotification: () => dispatch(clearNotification()),
  }
}

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(Checkout)

