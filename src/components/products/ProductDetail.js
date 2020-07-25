import React, {useEffect, useState} from 'react'
import styles from './ProductDetail.module.css'
import '../../Global.css'
import {connect} from 'react-redux'
import {storeProduct, removeProduct} from '../../actions/product'
import {storeOrderSummary} from '../../actions/order'
import {
  displayError, 
  clearError,
  displayNotification
} from '../../actions/notification'
import {useParams, Link, useHistory} from 'react-router-dom'
import sprite from '../../sprite.svg'


/*This component shows the details for a selected
product and allows product to be added to the cart*/
const ProductDetail = props => {
  const [selectedImage, setImage] = useState(0)
  const productId = useParams().id
  const navigate = useHistory()
  props.clearError()

  const getProduct = async (productId) => {
    const response = await props.getApi('/product/detail/' + productId)

    if (response) {
      props.storeProduct(response.product) 
    }
  }
    

  /*This function makes a request to the api to
  get the product details and stores them in redux state*/
  useEffect(() => {
    getProduct(productId)
  }, [])

  /*This function changes what photo is displayed by
  incrementing or decrementing the index of the photoArray*/
  const changePhoto = (direction, end) => {
    const start = 0
    if (direction === 'inc') {
      if (selectedImage === end) {
        return
      }

      setImage(selectedImage + 1)
    }

    if (direction === 'dec') {
      if (selectedImage === start) {
        return
      }

      setImage(selectedImage - 1)
    }
  }

  /*This function will create an order and add the selected product to it. 
  If a current order already exists it will update it with the selected product */
  const addToCart = async (event, productId, userId, token) => {
    props.clearError()
    
    const result = props.checkLogin()
    if (result.error) {
      return props.displayError(result.error)
    }

    let url = '/order/update'

    if (!props.orderId) {
      url = '/order/create'
    }

    const body = {
      productId,
      userId: userId,
    }

    if (url === '/order/update') {
      body.orderId = props.orderId
    }
    
    const response = await props.authApi(url, token, body, 'POST', props.displayError)

    if (response) {
      props.storeOrderSummary(response)
    }
  }

  
  const deleteProduct = async (event, productId, userId, token) => {
    props.clearError()
   
    const result = props.checkLogin()
    if (result.error) {
      return props.displayError(result.error)
    }

    const body = {
      productId,
      userId: userId,
    }
    
    const response = await props.authApi('/product/delete', token, body, 'DELETE', props.displayError)

    if (response) {
      props.removeProduct(productId)
      props.displayNotification(response.msg)
      navigate.push('/product')
    }
  }
  
  /*Conditionally render a list of product specifications*/
  const specificationList = (specs) => {
    if (!specs) {
      return
    }

    const specList = specs.map(spec => {
      return (
        <li className={styles.listItem} key={spec.name}>
          <span>{spec.name}</span> {spec.content}
        </li>
      )
    })
    
    return specList
  }

  const {
    name, 
    price,
    description,
    specifications,
    photoArray,
    _id,
    weight,
    height,
    width,
    length,
  } = props.product
  
  return (
    <main className={styles.container} aria-label='product details'>
      <h1 className={styles.heading + ' heading'}>
        <span>{name}</span>
        <span aria-label='product price'>${price}</span>
      </h1>
      <section className={styles.images} aria-label='image carousel'>
        <img 
          src={photoArray ? photoArray[selectedImage] : null} 
          alt="product" 
          aria-live='polite'/>
        <button 
          className={styles.inc} 
          onClick={() => changePhoto('inc', photoArray.length - 1)}
          aria-label='next photo'>
          <svg className='btn-svg'>
            <use href={sprite + '#icon-chevron-thin-right'}></use>
          </svg>
        </button>
        <button 
          className={styles.dec} 
          onClick={() => changePhoto('dec', photoArray.length - 1)}
          aria-label='previous photo'>
          <svg className='btn-svg'>
            <use href={sprite + '#icon-chevron-thin-left'}></use>
          </svg>
        </button>
      </section>
      <p className={styles.description} aria-label='product description'>
        {description}
      </p>
      { specifications?.length > 1 || !specifications ?
        <section className={styles.specifications} aria-labelledby='specification-list-header'>
          <h2 id='specification-list-header'>Technical specifications</h2>
          <ul>
            {specificationList(specifications)}
          </ul>
        </section>
      : null}
      <div className={styles.dimensions} aria-labelledby='dimension-list-header'>
        <h2 id='dimension-list-header'>Dimensions</h2>
        <ul>
          <li className={styles.listItem}><span>Weight</span> {weight} lbs</li>
          <li className={styles.listItem}><span>Height</span> {height} inches</li>
          <li className={styles.listItem}><span>Width</span> {width} inches</li>
          <li className={styles.listItem}><span>Length</span> {length} inches</li>
        </ul>
      </div>
      <footer className={styles.footer}>
        { props.userType === 'admin' ? 
          <>
            <button 
              onClick={(event) => deleteProduct(event, _id, props.userId, props.token)}>
              Delete Product
            </button>
            <Link to={'/product/update/' + _id}>Update Product</Link>
          </>
        : null}
        {props.userType === 'customer' ?
          <button 
            onClick={(event) => addToCart(event, _id, props.userId, props.token)}>
            Add To Cart
          </button>
          : null}
        <Link to="/product">Back To Products</Link>
      </footer>
    </main>
  )
}

const mapStateToProps = state => {
  return {
    product: state.product.product,
    orderId: state.order.summary.orderId,
    userId: state.user.userId,
    userType: state.user.type,
    token: state.user.token
  }
}

const mapDispatchToProps = dispatch => {
  return {
    storeProduct: (product) => dispatch(storeProduct(product)),
    removeProduct: (productId) => dispatch(removeProduct(productId)),
    storeOrderSummary: (summary) => dispatch(storeOrderSummary(summary)),
    displayError: (error) => dispatch(displayError(error)),
    displayNotification: (error) => dispatch(displayNotification(error)),
    clearError: () => dispatch(clearError()),
  }
}

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(ProductDetail)