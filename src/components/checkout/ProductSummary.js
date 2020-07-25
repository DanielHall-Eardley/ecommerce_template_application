import React from 'react'
import styles from './ProductSummary.module.css'

export default ({removeProduct, order, user}) => {
  const products = order.products.map((product, index) => {
    return (
      <li key={product._id + index} className={styles.productItem}>
        <span>Product Id: {product._id}</span>
        <span>Name: {product.name}</span>
        <span className={styles.price}>${product.price}</span>
        { !order.addressConfirmed ?
          <button 
            className={styles.remove} 
            onClick={() => removeProduct(product._id, user.token, user.userId, order._id)}>
            Remove Product
          </button>
        : null }
      </li>
    )
  })

  return <ul className={styles.products} aria-label='products'>{products}</ul>
}