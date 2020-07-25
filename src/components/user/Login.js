import React, {useState} from 'react'
import styles from './Login.module.css'
import '../../Global.css'
import {useHistory} from 'react-router-dom'
import {connect} from 'react-redux'
import {
  displayError, 
  clearError,
  displayNotification,
  clearNotification
} from '../../actions/notification'
import {
  storeUser,
  clearUser
} from '../../actions/user'
import {storeOrderSummary} from '../../actions/order'

/*This component logs in a user, saves a jwt token and
basic user information to local storage. If the user is
of type: 'customer', a summary of their current order is 
retrieved from the server*/
const Login = (props) => {
  const navigate = useHistory()

  const [password, setPassword] = useState('')
  const [email, setEmail] = useState('')

  const setLocalStorage = user => {
    localStorage.setItem('token', user.token)
    localStorage.setItem('userId', user.userId)
    localStorage.setItem('name', user.name)
    localStorage.setItem('type', user.type)
    localStorage.setItem('tokenExpiration', user.tokenExpiration)
  }

  const login = async (event) => {
    event.preventDefault()
    props.clearNotification()
    props.clearError()
    props.clearUser()

    const body = {
      password,
      email
    }

    const response = await props.postApi('/user/login', body, props.displayError)

    if (response) {
      displayNotification('Logged In!')
      setLocalStorage(response.user)
      props.storeUser(response.user)

      if (response.user.type === 'customer') {
        const url = '/order/summary/' + response.user.userId
        const orderSummary = await props.getAuthApi(url, response.user.token, props.displayError)
    
        if (orderSummary) {
          props.storeOrderSummary(orderSummary)
        }
      }
      
      navigate.push('/product')
    }  
  }

  return (
    <section>
      <form onSubmit={login} className={styles.login} aria-label='login'>
        <label htmlFor="input-login-email">Email</label>
        <input
          id='input-login-email' 
          type="email" 
          placeholder='Email'
          value={email}
          onChange={(event) => setEmail(event.target.value)}/>
        <label htmlFor="input-login-password">Password</label>
        <input 
          id='input-login-password'
          type="password" 
          placeholder="Password"
          value={password}
          onChange={(event) => setPassword(event.target.value)}/>
        <button>Login</button>
      </form>
    </section>
  )
}

const mapStateToProps = state => {
  return {
    token: state.user.token,
  }
}

const mapDispatchToProps = dispatch => {
  return {
    displayError: error => dispatch(displayError(error)),
    clearError: () => dispatch(clearError()),
    displayNotification: notification => dispatch(displayNotification(notification)),
    clearNotification: () => dispatch(clearNotification()),
    storeUser: user => dispatch(storeUser(user)),
    storeOrderSummary: order => dispatch(storeOrderSummary(order)),
    clearUser: () => dispatch(clearUser()),
  }
}

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(Login)
