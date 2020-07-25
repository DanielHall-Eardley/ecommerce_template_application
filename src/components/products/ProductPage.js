import React, {useEffect} from 'react'
import '../../Global.css'
import {connect} from 'react-redux'
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

import getApi from '../../helper/getApi'
import authApi from '../../helper/authApi'
import checkLogin from '../../helper/checkLogin'

/*This component contains nested routes for creating, updating 
and viewing the product list and individual product details */
const ProductPage = props => {
  const getProductList = async () => {
    const response = await props.getApi('/product/list')

    if (response) {
      props.storeProductList(response)
    }
  }

  useEffect(() => {
    props.clearError()
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
          <AddEditProduct getApi={getApi} authApi={authApi} checkLogin={checkLogin}/>
        </Route>
        <Route path={`${path}/update/:productId`}>
          <AddEditProduct getApi={getApi} authApi={authApi} checkLogin={checkLogin}/>
        </Route>
        <Route path={`${path}/detail/:id`}>
          <ProductDetail getApi={getApi} authApi={authApi} checkLogin={checkLogin}/>
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