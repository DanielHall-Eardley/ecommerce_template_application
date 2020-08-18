import React from 'react'
import styles from './ProductSummary.module.css'

import {connect} from 'react-redux'
import {
  displayError, 
  clearError,
} from '../../actions/notification'
import {storeOrder} from '../../actions/order'

export const ProductSummary = props => {

  /*This function removes the selected product from the order
  in the database and sends the updated order in the response,
  to update redux state*/
  const removeProduct = async (productId) => {
    props.clearError()

    const body = {
      productId: productId,
      userId: props.user.userId,
      orderId: props.order._id
    }
    
    const response = await props.authApi('/checkout/remove-product', props.user.token, body, 'PUT', props.displayError)

    if (response) {
      props.storeOrder(response)
    }
  }

  const order = props.order

  return <ul className={styles.products} aria-label='products'>
    {order.products.map((product, index) => {
      return (
        <li key={product._id + index} className={styles.productItem}>
          <span>Product Id: {product._id}</span>
          <span>Name: {product.name}</span>
          <span className={styles.price}>${product.price}</span>
          { !order.addressConfirmed ?
            <button 
              className={styles.remove} 
              onClick={() => removeProduct(product._id)}>
              Remove Product
            </button>
          : null }
        </li>
      )
    })}
  </ul>
}

const mapStateToProps = state => {
  return {
    order: state.order.order,
    user: state.user
  }
}

const mapDispatchToProps = dispatch => {
  return {
    displayError: error => dispatch(displayError(error)),
    storeOrder: order => dispatch(storeOrder(order)),
    clearError: () => dispatch(clearError()),
  }
}

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(ProductSummary)