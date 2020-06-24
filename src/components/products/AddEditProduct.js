import React, {useState} from 'react'
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

const AddEditProduct = props => {
  const location = useLocation()
  const {id} = useParams()
  const navigate = useHistory()
  const path = location.pathname.split('/')[2]

  const [title, setTitle] = useState('Add Product')

  let oldName = ""
  let oldPrice = ""
  let oldSpecialPrice = ""
  let oldDescription = ""
  let oldPhotoArray = [] 
  let oldSpecifications = []

  if (path === 'update') {
    setTitle('Update Product')
    props.clearError()

    const headers = {
      'Authorization': props.token,
      'Content-Type': 'application/json'
    }

    const getProduct = async (headers) => {
      const response = await api('/product/update/', {
        headers
      })

      if (response.error) {
        props.displayError(response.error)
      }
      return response
    }

    const oldProduct = getProduct(headers)

    oldName = oldProduct.name
    oldPrice = oldProduct.price
    oldSpecialPrice = oldProduct.specialPrice
    oldDescription = oldProduct.description
    oldSpecifications = oldSpecifications.specifications
  }

  const [name, setName] = useState(oldName)
  const [price, setPrice] = useState(oldPrice)
  const [specialPrice, setSpecialPrice] = useState(oldSpecialPrice)
  const [description, setDescription] = useState(oldDescription)
  const [photoPreviewArray, setPhotoPreviewArray] = useState([])
  const [photoFileArray, setPhotoFileArray] = useState([])
  const [photoUrlArray, setPhotoUrlArray] = useState(null)
  const [specification, inputSpecification] = useState({
    name: '',
    content: ''
  })
  const [specificationArray, setSpecification] = useState(oldSpecifications)
  const [weight, setWeight] = useState('')
  const [width, setWidth] = useState('')
  const [height, setHeight] = useState('')
  const [length, setLength] = useState('')

  const removeSpec = (name) => {
    const filteredArray = specificationArray.filter(spec => spec.name !== name)
    setSpecification(filteredArray)
  }
  
  const specificationList = specificationArray.map(spec => {
    return (
      <li className={styles.listItem} key={spec.name}>
        <b>{spec.name}</b>: {spec.content}
        <button 
          onClick={() => removeSpec(spec.name)}
          className='default-link'>
          Remove
        </button>
      </li>
    )
  })

  const checkFileName = fileName => {
    const regex = /[_!@#$%^?*&`~\/\\:"'|;\[\]\{\}=+<>]/gm
    const checkForSpecialChar = fileName.match(regex)
    return checkForSpecialChar
  }

  const uploadPhotos = async (event) => {
    event.preventDefault()
    props.clearError()

    if (photoFileArray.length < 1) {
      return props.displayError('No images selected')
    }

    const s3PhotoInfo = []
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

    const photoUrlArray = []
    for (let url of response.signatures) {
      const urlToSave = url.split('?')[0]
      const rawFileName = urlToSave.split('_')[0].split('.com/')[1]
      const file = photoFileArray.find(file => file.name === rawFileName)

      if (!file) {
        return props.displayError('There was a problem uploading your images')
      } 

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
      photoUrlArray.push(urlToSave)
    }

    setPhotoUrlArray(photoUrlArray)
  }

  const saveProduct = async (event) => {
    event.preventDefault()
    props.clearError()
    let url = '/product/create'

    if (path === 'update') {
      url = '/product/update/' + id
    }

    const headers = {
      'Authorization': props.token,
      'Content-Type': 'application/json'
    }

    const product = JSON.stringify({
      name,
      description,
      price: parseInt(price),
      specialPrice: parseInt(specialPrice),
      specificationArray,
      width,
      height,
      length,
      weight,
      photoArray: photoUrlArray
    })

    const response = await api(url, product, headers, 'POST')
  
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
    setSpecification([...specificationArray ,specification])
  }
  
  return (
    <section className={styles.container}>
      <h1 className={styles.header}>{title}</h1>
      <form 
        className={styles.form} 
        onSubmit={saveProduct}
        encType='multipart/form-data'>
        <label>Enter Product Name</label>
        <input 
          className={styles.input}
          type="text" 
          value={name} 
          onChange={event => setName(event.target.value)} />
        <label>Enter Price</label>
        <input 
          className={styles.input}
          type="number"
          step='any' 
          value={price} 
          onChange={event => setPrice(event.target.value)} />
        <label>Enter Special Price</label>
        <input 
          className={styles.input}
          step='any'
          type="number" 
          value={specialPrice} 
          onChange={event => setSpecialPrice(event.target.value)} />
        <label>Enter Product Description</label>
        <textarea 
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
        <label>Add Product Specifications</label>
        <div className={styles.spec}>
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
          <div>
            <div className={styles.dimensions}>
              <div>
                <label>Enter Product Weight in ounces</label>
                <input 
                  className={styles.input}
                  step='any'
                  type="number" 
                  value={weight} 
                  onChange={event => setWeight(event.target.value)} />
              </div>
              <div>
                <label>Enter Product Length in inches</label>
                <input 
                  className={styles.input}
                  step='any'
                  type="number" 
                  value={length} 
                  onChange={event => setLength(event.target.value)} />
              </div>
              <div>
                <label>Enter Product Width in inches</label>
                <input 
                  className={styles.input}
                  step='any'
                  type="number" 
                  value={width}
                  onChange={event => setWidth(event.target.value)} />
              </div>
              <div>
                <label>Enter Product Height in inches</label>
                <input 
                  className={styles.input}
                  step='any'
                  type="number" 
                  value={height} 
                  onChange={event => setHeight(event.target.value)} />
              </div>
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
    token: state.user.token
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