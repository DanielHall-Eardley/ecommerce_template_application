import React, {useState, useEffect} from 'react'
import styles from './AddEditProduct.module.css'
import '../../Global.css'
import {connect} from 'react-redux'
import {
  useLocation, 
  useParams, 
  useHistory,
  Link
} from 'react-router-dom'
import {
  displayError, 
  clearError,
} from '../../actions/notification'
import {addProduct} from '../../actions/product'
import api from '../../helper/api'
import {uuid} from 'uuidv4'

import Photos from './Photos'
import {apiHost} from '../../global.js'


/*This component is responsible for creating, updating
products and uploading product images*/
const AddEditProduct = props => {
  const location = useLocation()
  const {productId} = useParams()
  const navigate = useHistory()
  const path = location.pathname.split('/')[2]

  const [title, setTitle] = useState('Add Product')

  /*If this component is reached via 'product/update'
  the product is retrieved from the database and updatable 
  fields in the form are populated with existing product values*/
  const useEffectCb = () => {
    if (path === 'update' && productId) {
      setTitle('Update Product')
  
      const getProduct = async (productId) => {
        const res = await fetch(apiHost + '/product/detail/' + productId)
        const response = await res.json()
  
        if (response.error) {
          return displayError(response.error)
        }
        
        const oldProduct = response.product
        setName(oldProduct.name)
        setPrice(oldProduct.price)
        setSpecialPrice(oldProduct.specialPrice)
        setDescription(oldProduct.description)
        setSpecifications(oldProduct.specifications)
      }
  
      getProduct(productId)
    }
  }
  
  useEffect(useEffectCb, [])
  
  const [specificationArray, setSpecifications] = useState([])
  const [name, setName] = useState('')
  const [price, setPrice] = useState('')
  const [specialPrice, setSpecialPrice] = useState('')
  const [description, setDescription] = useState('')
  const [photoPreviewArray, setPhotoPreviewArray] = useState([])
  const [photoFileArray, setPhotoFileArray] = useState([])
  const [photoUrlArray, setPhotoUrlArray] = useState(null)
  const [specification, inputSpecification] = useState({
    name: '',
    content: ''
  })
  const [weight, setWeight] = useState('')
  const [width, setWidth] = useState('')
  const [height, setHeight] = useState('')
  const [length, setLength] = useState('')


  const removeSpec = (name) => {
    const filteredArray = specificationArray.filter(spec => spec.name !== name)
    setSpecifications(filteredArray)
  }
  
  /*This shows a preview list of all the added product specifications*/
  const specificationList = specificationArray.map(spec => {
    return (
      <li className={styles.listItem} key={spec.name} aria-label='product specification'>
        <b>{spec.name}</b>: {spec.content}
        <button
          onClick={() => removeSpec(spec.name)}
          className='default-link btn-link'>
          Remove Specification
        </button>
      </li>
    )
  })


  /*Check the filename of image to uploaded for special characters*/
  const checkFileName = fileName => {
    const regex = /[_!@#$%^?*&`~\/\\:"'|;\[\]\{\}=+<>]/gm
    const checkForSpecialChar = fileName.match(regex)
    return checkForSpecialChar
  }


  /*This function submits an array of objects to the server, 
  each object contains a file name and file type for an individual image.
  The server uses this information to create a signed url for S3 upload
  on the client side*/
  const uploadPhotos = async (event) => {
    event.preventDefault()
    props.clearError()

    if (photoFileArray.length < 1) {
      return props.displayError('No images selected')
    }

    const s3PhotoInfo = []

    /*This is important to ensure consistent destructuring of the
    signed url when it returns from the server*/
    for (let file of photoFileArray) {
      if (checkFileName(file.name)) {
        return props.displayError('Only "-" "." special characters are allowed are allowed in file names')
      }
      
      const s3FileUpload = {
        fileName: `${file.name}_${uuid()}`,
        fileExtension: file.type
      }

      s3PhotoInfo.push(s3FileUpload)
    }

    const photos = JSON.stringify({
      s3PhotoInfo
    })

    const response = await api('/product/s3-signatures', photos, {
      'Authorization': props.token,
      'Content-Type': 'application/json'
    }, 'POST')
  
    if (response.error) {
      return props.displayError(response.error)
    }

    savePhotosToS3(response.signatures)
  }


  /*This function uses the signed url to complete the image
  upload to S3*/
  const savePhotosToS3 = async signatureArray => {
    const photoUrlArray = []
    for (let url of signatureArray) {

      /*Extract the base url from all the query parameters,
      so it can be saved to the database and referenced to access image*/
      const urlToSave = url.split('?')[0]

      /*Extract base file name to find the correct file on the 
      client side to upload with signed url*/
      const rawFileName = urlToSave.split('_')[0].split('.com/')[1]
      const file = photoFileArray.find(file => file.name === rawFileName)

      if (!file) {
        return props.displayError('There was a problem uploading your images')
      } 

      //upload image
      const uploadResult = await fetch(url, {
        headers : {
          'Content-Type': file.type,
        },
        body: file,
        method: 'PUT'
      })

      if (uploadResult.status !== 200) {
        return props.displayError('There was a problem uploading your images')
      }

      //Store photo url after successful upload
      photoUrlArray.push(urlToSave)
    }

    /*Add array of photo urls to local state to be
    stored with product update or creation*/
    setPhotoUrlArray(photoUrlArray)
  }


  /*Update or create product depending on the navigation 
  path used to access page*/
  const saveProduct = async (event, productId, token) => {
    event.preventDefault()
    props.clearError()

    if (!photoUrlArray && photoFileArray.length > 0) {
      return props.displayError('You have photos that have not been uploaded')
    }
    let url = '/product/update/'
    let method = 'PUT'

    const product = {
      name,
      description,
      price: parseInt(price),
      specialPrice: parseInt(specialPrice),
      specificationArray,
      photoArray: photoUrlArray,
      productId
    }

    if (!productId) {
      url = '/product/create'
      product.width = width
      product.height = height
      product.length = length
      product.weight = weight
      method = 'POST'
    }

    const headers = {
      'Authorization': token,
      'Content-Type': 'application/json'
    }
    const stringifiedProduct = JSON.stringify(product)

    const response = await api(url, stringifiedProduct, headers, method)
  
    if (response.error) {
      return props.displayError(response.error)
    }
    
    navigate.push('/product/detail/' + response.product._id)
  }

  
  const addSpecification = () => {
    inputSpecification({
      name: "",
      content: ''
    })
    setSpecifications([...specificationArray ,specification])
  }
  
  return (
    <section className={styles.container} aria-labelledby='product-add-edit'>
      <h1 className={styles.header} id='product-add-edit '>{title}</h1>
      <form 
        className={styles.form} 
        onSubmit={(event) => saveProduct(event, productId, props.token)}
        encType='multipart/form-data'>
        <label htmlFor='input-product-name'>Enter Product Name</label>
        <input 
          id='input-product-name'
          className={styles.input}
          type="text" 
          value={name} 
          onChange={event => setName(event.target.value)} />
        <label htmlFor='input-product-price'>Enter Price</label>
        <input 
          id='input-product-price'
          className={styles.input}
          type="number"
          step='any' 
          value={price} 
          onChange={event => setPrice(event.target.value)} />
        <label htmlFor='input-product-special-price'>Enter Special Price</label>
        <input 
          id='input-product-special-price'
          className={styles.input}
          step='any'
          type="number" 
          value={specialPrice} 
          onChange={event => setSpecialPrice(event.target.value)} />
        <label htmlFor='input-product-description'>Enter Product Description</label>
        <textarea 
          id='input-product-description'
          className={styles.textarea}
          type="text" 
          value={description} 
          onChange={event => setDescription(event.target.value)}>
        </textarea>
        <Photos 
          uploadComplete={photoUrlArray}
          uploadPhotosToS3={uploadPhotos}
          photoArray={photoPreviewArray} 
          setPhotoArray={setPhotoPreviewArray}
          fileArray={photoFileArray}
          setFileArray={setPhotoFileArray}/>
        <label id='input-product-spec'>Add Product Specifications</label>
        <div className={styles.spec} aria-labelledby='input-product-spec'>
          <input 
            type="text" 
            placeholder="Specification Name"
            value={specification.name} 
            onChange={event => inputSpecification({
              name: event.target.value,
              content: specification.content
              })
            }/>
          <input 
            type="text" 
            placeholder="Specification"
            value={specification.content} 
            onChange={event => inputSpecification({
              name: specification.name,
              content: event.target.value
              })
            }/>
          <button 
            type='button'
            onClick={addSpecification}>
            Add Specification
          </button>
        </div>
        <ul className={styles.specificationList}>
          {specificationList}
        </ul>
        { path === 'create' ? (
          <div className={styles.dimensions}>
            <div>
              <label htmlFor='input-product-weight'>Enter Product Weight in ounces</label>
              <input 
                id='input-product-weight'
                className={styles.input}
                step='any'
                type="number" 
                value={weight} 
                onChange={event => setWeight(event.target.value)} />
            </div>
            <div>
              <label htmlFor='input-product-length'>Enter Product Length in inches</label>
              <input 
                id='input-product-length'
                className={styles.input}
                step='any'
                type="number" 
                value={length} 
                onChange={event => setLength(event.target.value)} />
            </div>
            <div>
              <label htmlFor='input-product-width'>Enter Product Width in inches</label>
              <input 
                id='input-product-width'
                className={styles.input}
                step='any'
                type="number" 
                value={width}
                onChange={event => setWidth(event.target.value)} />
            </div>
            <div>
              <label htmlFor='input-product-height'>Enter Product Height in inches</label>
              <input 
                id='input-product-height'
                className={styles.input}
                step='any'
                type="number" 
                value={height} 
                onChange={event => setHeight(event.target.value)} />
            </div>
          </div>
        ) : null}  
        <div className={styles.flexContainer}>
          <Link to='/product'>Back</Link>
          <button className={styles.save}>Save Product</button>
        </div>
      </form>
    </section>
  )
}

const mapStateToProps = state => {
  return {
    token: state.user.token,
    userId: state.user.userId
  }
}

const mapDispatchToProps = dispatch => {
  return {
    addProduct: product => dispatch(addProduct(product)),
    displayError: (error) => dispatch(displayError(error)),
    clearError: () => dispatch(clearError()),
  }
}

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(AddEditProduct)