import React, {useState} from 'react'
import styles from './Search.module.css'
import '../../Global.css'
import {connect} from 'react-redux'
import {filterProductList} from '../../actions/product'
import {
  displayError, 
  clearError,
} from '../../actions/notification'
import {useHistory} from 'react-router-dom'

const Search = props => {
  const [query, setQuery] = useState('')
  const navigation = useHistory()

  const navToProductAdd = (nav) => {
    nav.push('/product/create')
  }

  const searchProducts = () => {
    props.filterProductList(query)
  }

  return (
    <div className={styles.container}>
      <input 
        className={styles.input}
        type="text" 
        value={query} 
        onChange={event => setQuery(event.target.value)}/>
        <button onClick={searchProducts}>
          Search Products
        </button>
        {
          props.userType === 'admin' ?
          <button 
            onClick={() => navToProductAdd(navigation)}
            className={styles.add}>
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
  }
}

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(Search)