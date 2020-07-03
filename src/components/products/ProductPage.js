import React, {useEffect} from 'react'
import '../../Global.css'
import {connect} from 'react-redux'
import {apiHost} from '../../global'
import {storeProductList} from '../../actions/product'
import {
  displayError, 
  clearError,
} from '../../actions/notification'

import {
  Switch,
  Route,
  useRouteMatch
} from 'react-router-dom'

import Search from './Search'
import AddEditProduct from './AddEditProduct'
import List from './List'
import ProductDetail from './ProductDetail'

/*This component contains nested routes for creating, updating 
and viewing the product list and individual product details */
const ProductPage = props => {
  useEffect(() => {
    props.clearError()

    const getProductList = async () => {
      const res = await fetch(apiHost + '/product/list')
      const response = await res.json()

      if (response.error) {
        return props.displayError(response.error)
      }
      props.storeProductList(response)
    }
    
    getProductList()
  }, [])
 
  const {path} = useRouteMatch();

  return (
    <main>
      <Search/>
      <Switch>
        <Route exact path={path}>
          <List/>
        </Route>
        <Route path={`${path}/create`}>
          <AddEditProduct />
        </Route>
        <Route path={`${path}/update/:productId`}>
          <AddEditProduct />
        </Route>
        <Route path={`${path}/detail/:id`}>
          <ProductDetail />
        </Route>
      </Switch>
    </main>
  )
}

const mapDispatchToProps = dispatch => {
  return {
    storeProductList: (list) => dispatch(storeProductList(list)),
    displayError: (error) => dispatch(displayError(error)),
    clearError: () => dispatch(clearError()),
  }
}

export default connect(
  null,
  mapDispatchToProps
)(ProductPage)