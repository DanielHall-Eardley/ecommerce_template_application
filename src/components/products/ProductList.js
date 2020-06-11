import React, {useEffect} from 'react'
import styles from './ProductList.module.css'
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

import Notification from '../notification/Notification'
import Search from './Search'
import AddEditProduct from './AddEditProduct'
import List from './List'

const ProductList = props => {
  useEffect(() => {
    props.clearError()

    fetch(apiHost + '/product/list')
      .then(res => {
        return res.json()
      })
      .then(response => {
        if (response.error) {
          props.displayError(response.error)
        }

        props.storeProductList(response)
      })
  }, [])
 
  const {path} = useRouteMatch();

  return (
    <main className={styles.container}>
      <Notification error={props.error} notification={props.notification}/>
      <Search/>
      <Switch>
        <Route exact path={path}>
          <List/>
        </Route>
        <Route path={`${path}/create`}>
          <AddEditProduct />
        </Route>
        <Route path={`${path}/update/:id`}>
          <AddEditProduct />
        </Route>
      </Switch>
    </main>
  )
}

const mapStateToProps = state => {
  return {
    error: state.notification.error,
    notification: state.notification.notification,
  }
}

const mapDispatchToProps = dispatch => {
  return {
    storeProductList: (list) => dispatch(storeProductList(list)),
    displayError: (error) => dispatch(displayError(error)),
    clearError: () => dispatch(clearError()),
  }
}

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(ProductList)