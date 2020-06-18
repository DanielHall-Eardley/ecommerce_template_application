import React, {useState} from 'react'
import styles from './Login.module.css'
import '../../Global.css'
import api from '../../helper/api'
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
import {apiHost} from '../../global'

const Login = (props) => {
  const history = useHistory()

  const [password, setPassword] = useState('')
  const [email, setEmail] = useState('')

  const login = async (event) => {
    event.preventDefault()
    props.clearNotification()
    props.clearError()
    props.clearUser()

    const headers = {
      'Content-Type': 'application/json',
    }

    const body = JSON.stringify({
      password,
      email
    })

    const loginResponse = await api('/user/login', body, headers, 'POST')

    if (loginResponse.error) {
      return props.displayError(loginResponse.error)
    }
    
    displayNotification('Logged In!')
    localStorage.setItem('token', loginResponse.user.token)
    localStorage.setItem('userId', loginResponse.user.userId)
    localStorage.setItem('name', loginResponse.user.name)
    localStorage.setItem('type', loginResponse.user.type)
    localStorage.setItem('tokenExpiration', loginResponse.user.tokenExpiration)

    props.storeUser(loginResponse.user)

    const res = await fetch(apiHost + '/order/summary/' + loginResponse.user.userId, {
      headers: {
        'Content-Type': 'application/json',
        'Authorization': loginResponse.user.token
      }
    }, [])

    const orderResponse = await res.json()

    if (orderResponse.error) {
      return
    }

    props.storeOrderSummary(orderResponse)
    
    history.push('/')
  }

  return (
    <section>
      <form onSubmit={login} className={styles.login}>
        <input 
          type="email" 
          placeholder='Email'
          value={email}
          onChange={(event) => setEmail(event.target.value)}/>
        <input 
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
    token: state.user.token
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
