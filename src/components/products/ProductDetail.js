import React, {useEffect, useState} from 'react'
import styles from './ProductDetail.module.css'
import '../../Global.css'
import {connect} from 'react-redux'
import {storeProduct} from '../../actions/product'
import {storeOrderSummary} from '../../actions/order'
import {
  displayError, 
  clearError,
} from '../../actions/notification'
import {useParams, Link} from 'react-router-dom'
import {apiHost} from '../../global'
import api from '../../helper/api'

const ProductDetail = props => {
  const [selectedImage, setImage] = useState(0)
  const productId = useParams().id

  const specificationList = (specs) => {
    if (!specs) {
      return
    }

    const specList = specs.map(spec => {
      return (
        <li className={styles.listItem} key={spec.name}>
          <b>{spec.name}:</b> {spec.content}
        </li>
      )
    })
    
    return specList
  }

  const changePhoto = (direction, end) => {
    const start = 0

    if (selectedImage <= start || selectedImage >= end) {
      return
    }

    if (direction === 'inc') {
      setImage(selectedImage + 1)
    }

    if (direction === 'dec') {
      setImage(selectedImage - 1)
    }
  }

  const addToCart = async (productId) => {
    props.clearError()
   
    if (!props.token) {
      return props.displayError('Please Log In')
    }

    let url = '/order/update'

    if (!props.orderId) {
      url = '/order/create'
    }

    const headers = {
      'Authorization': props.token,
      'Content-Type': 'application/json'
    }

    const body = {
      productId,
      userId: props.userId,
    }

    if (url === '/order/update') {
      body.orderId = props.orderId
    }
    const stringifiedBody= JSON.stringify(body)

    const response = await api(url, stringifiedBody, headers, 'POST')

    if (response.error) {
      return props.displayError(response.error)
    }
    
    props.storeOrderSummary(response)
  }
  
  useEffect(() => {
    clearError()

    const getProduct= async () => {
      const res = await fetch(apiHost + '/product/detail/' + productId)
      const response = await res.json()

      if (response.error) {
        return displayError(response.error)
      }
    
      props.storeProduct(response.product) 
    }

    getProduct()
  }, [])

  const {
    name, 
    price,
    description,
    specialPrice,
    specifications,
    photoArray,
    _id,
    weight,
    height,
    width,
    length,
    weightUnit,
    measurementUnit
  } = props.product
  
  return (
    <section className={styles.container}>
      <h1 className={styles.heading}>
        <span>{name}</span>
        <span>${price}</span>
      </h1>
      <div className={styles.images}>
        <img src={photoArray ? photoArray[selectedImage] : null} alt=""/>
        <button className={styles.inc}
          onClick={() => changePhoto('inc', photoArray.length)}>
          {'>'}
        </button>
        <button className={styles.dec}
          onClick={() => changePhoto('dec', photoArray.length)}>
          {'<'}
        </button>
      </div>
      <p className={styles.description}>{description}</p>
      <ul className={styles.specifications}>
        {specificationList(specifications)}
      </ul>
      <div className={styles.dimensions}>
        <span>Weight</span>
        <span>Height</span>
        <span>Width</span>
        <span>Length</span>
        <span>{weight} {weightUnit}</span>
        <span>{height} {measurementUnit}</span>
        <span>{width} {measurementUnit}</span>
        <span>{length} {measurementUnit}</span>
      </div>
      <footer className={styles.footer}>
        <span className={styles.id}>Product Id: {_id}</span>
        <Link to="/product">Back To Products</Link>
        {props.userType === 'customer' ?
          <button onClick={() => addToCart(_id)}>Add To Cart</button>
        : null}
      </footer>
    </section>
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
    storeOrderSummary: (summary) => dispatch(storeOrderSummary(summary)),
    displayError: (error) => dispatch(displayError(error)),
    clearError: () => dispatch(clearError()),
  }
}

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(ProductDetail)