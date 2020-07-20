import React, {useState} from 'react'
import styles from './Search.module.css'
import '../../Global.css'
import {connect} from 'react-redux'
import {filterProductList, finishSearch} from '../../actions/product'
import {
  displayError, 
  clearError,
} from '../../actions/notification'
import {useHistory} from 'react-router-dom'

/*This component is responsible for product searching and
navigating to the add product page*/
const Search = props => {
  const [query, setQuery] = useState('')
  const navigation = useHistory()

  const navToProductAdd = (event) => {
    navigation.push('/product/create')
  }

  /*This function dispatches a query to the product list in redux state*/
  const searchProducts = (event) => {
    props.filterProductList(query)
    navigation.push('/product')
  }

  /*This function reverts back to the original product list*/
  const allProducts = () => {
    props.finishSearch()
    navigation.push('/product')
  }

  return (
    <div className={styles.container} role='search' aria-label='Product search'>
      <input 
        role='searchbox'
        className={styles.input}
        type="text" 
        aria-label='Enter product search query'
        placeholder="Search for a product"
        value={query} 
        onChange={event => setQuery(event.target.value)}/>
        <button onClick={searchProducts}>
          Search Products
        </button>
        <button onClick={allProducts} className={styles.btnMargin}>
          All Products
        </button>
        {
          props.userType === 'admin' ?
          <button 
            onClick={() => navToProductAdd(navigation)}
            onKeyUp={() => navToProductAdd(navigation)}
            className={styles.btnMargin}>
            Add New Product
          </button> :
          null
        }
    </div>
  )
}

const mapStateToProps = state => {
  return {
    userType: state.user.type
  }
}

const mapDispatchToProps = dispatch => {
  return {
    filterProductList: (query) => dispatch(filterProductList(query)),
    displayError: (error) => dispatch(displayError(error)),
    clearError: () => dispatch(clearError()),
    finishSearch: () => dispatch(finishSearch()),
  }
}

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(Search)