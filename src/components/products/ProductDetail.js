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
import sprite from '../../sprite.svg'

/*This component shows the details for a selected
product and allows said product to be added to the cart*/
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
          <span>{spec.name}</span> {spec.content}
        </li>
      )
    })
    
    return specList
  }

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

    console.log(selectedImage)
  }

  /*This function either*/
  const addToCart = async (productId, userId, token) => {
    props.clearError()
   
    if (!token) {
      return props.displayError('Please Log In')
    }

    let url = '/order/update'

    if (!props.orderId) {
      url = '/order/create'
    }

    const headers = {
      'Authorization': token,
      'Content-Type': 'application/json'
    }

    const body = JSON.stringify({
      productId,
      userId: userId,
    })

    if (url === '/order/update') {
      body.orderId = props.orderId
    }
    
    const response = await api(url, body, headers, 'POST')

    if (response.error) {
      return props.displayError(response.error)
    }
    
    props.storeOrderSummary(response)
  }
  
  /*This function makes a request to the api to
  get the product details and stores them in redux state*/
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
    specifications,
    photoArray,
    _id,
    weight,
    height,
    width,
    length,
  } = props.product
  
  return (
    <section className={styles.container}>
      <h1 className={styles.heading + ' heading'}>
        <span>{name}</span>
        <span>${price}</span>
      </h1>
      <div className={styles.images}>
        <img src={photoArray ? photoArray[selectedImage] : null} alt=""/>
        <svg className={styles.inc}
          onClick={() => changePhoto('inc', photoArray.length - 1)}>
          <use href={sprite + '#icon-chevron-thin-right'}></use>
        </svg>
        <svg className={styles.dec}
          onClick={() => changePhoto('dec', photoArray.length - 1)}>
          <use href={sprite + '#icon-chevron-thin-left'}></use>
        </svg>
      </div>
      <p className={styles.description}>{description}</p>
      { specifications?.length > 1 || !specifications ?
        <div className={styles.specifications}>
          <h2>Technical specifications</h2>
          <ul>
            {specificationList(specifications)}
          </ul>
        </div>
      : null}
      <div className={styles.dimensions}>
        <h2>Dimensions</h2>
        <ul>
          <li className={styles.listItem}><span>Weight</span> {weight} lbs</li>
          <li className={styles.listItem}><span>Height</span> {height} inches</li>
          <li className={styles.listItem}><span>Width</span> {width} inches</li>
          <li className={styles.listItem}><span>Length</span> {length} inches</li>
        </ul>
      </div>
      <footer className={styles.footer}>
        <Link to="/product">Back To Products</Link>
        {props.userType === 'customer' ?
          <button onClick={() => addToCart(_id, props.userId, props.token)}>Add To Cart</button>
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