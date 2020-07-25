import React from 'react';
import './Global.css';

import {connect} from 'react-redux'
import {storeUser, clearUser} from './actions/user'
import {storeOrderSummary} from './actions/order'
import {displayError, clearError} from './actions/notification'

import Navigation from './components/navigation/Navigation'

/*This component functions retrieves user specific 
information on the application's initial load*/
export const App = props => {
  React.useEffect(() => {
    props.clearError()
    
    const result = props.checkLogin()
    
    if (result.error) {
      props.clearUser()
      props.displayError(result.error)
    } else {
      props.storeUser(result.user)
    }
    
    if (result.user) {
      if (result.user.type === 'customer') {
        props.getOrderSummary(result.user.userId, result.user.token, props.storeOrderSummary, fetch)
      }
    }
  }, [])

  return <Navigation {...props}/>
}

const mapStateToProps = state => {
  return {
    error: state.notification.error,
    notification: state.notification.notification,
  }
}

const mapDispatchToProps = dispatch => {
  return {
    storeUser: user => dispatch(storeUser(user)),
    clearUser: () => dispatch(clearUser()),
    displayError: error => dispatch(displayError(error)),
    clearError: () => dispatch(clearError()),
    storeOrderSummary: (summary) => dispatch(storeOrderSummary(summary)),
  }
}

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(App)


