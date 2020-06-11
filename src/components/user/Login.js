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
import Notification from '../notification/Notification'

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

    const response = await api('/user/login', body, headers, 'POST')

    if (response.error) {
      return props.displayError(response.error)
    }

    displayNotification('Logged In!')
    localStorage.setItem('token', response.user.token)
    localStorage.setItem('userId', response.user.userId)
    localStorage.setItem('name', response.user.name)
    localStorage.setItem('type', response.user.type)

    props.storeUser(response.user)
    history.push('/')
  }

  return (
    <section>
      <Notification error={props.error} notification={props.notification}/>
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
    error: state.notification.error,
    notification: state.notification.notification,
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
    clearUser: () => dispatch(clearUser()),
  }
}

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(Login)
