import React, {useState} from 'react'
import styles from './Signup.module.css'
import '../../Global.css'
import {useLocation, useHistory} from 'react-router-dom'
import api from '../../helper/api'
import {connect} from 'react-redux'
import {
  displayError, 
  clearError,
  displayNotification,
  clearNotification
} from '../../actions/notification'

const Signup = (props) => {
  const location = useLocation()
  const navigate = useHistory()
 
  const [name, setName] = useState('')
  const [password, setPassword] = useState('')
  const [email, setEmail] = useState('')

  const signup = async (event) => {
    event.preventDefault()
    props.clearNotification()
    props.clearError()

    const headers = {
      'Content-Type': 'application/json'
    }

    const body = JSON.stringify({
      name,
      password,
      email,
      userId: props.userId
    })

    const response = await api(location.pathname, body, headers, 'POST')

    if (response.error) {
      return props.displayError(response.error)
    }

    props.displayNotification(response.message)
    navigate.push('/login')
  }

  return (
    <section className={styles.container}>
      <form onSubmit={signup} className={styles.signup} aria-label='signup'>
        <label htmlFor="input-signup-name">Name</label>
        <input 
          id='input-signup-name'
          placeholder='Enter Name'
          type="text" 
          value={name} 
          onChange={(event) => setName(event.target.value)}/>
        <label htmlFor="input-signup-email">Email</label>
        <input 
          id='input-signup-email'
          placeholder='Enter Email'
          type="email" 
          value={email}
          onChange={(event) => setEmail(event.target.value)}/>
        <label htmlFor="input-signup-password">Password</label>
        <input 
          id='input-signup-password'
          placeholder="Enter a Password"
          type="password" 
          value={password}
          onChange={(event) => setPassword(event.target.value)}/>
        <button>Signup</button>
      </form>
    </section>
  )
}

const mapStateToProps = state => {
  return {
    error: state.notification.error,
    notification: state.notification.notification,
    userId: state.user.userId
  }
}

const mapDispatchToProps = dispatch => {
  return {
    displayError: error => dispatch(displayError(error)),
    clearError: () => dispatch(clearError()),
    displayNotification: notification => dispatch(displayNotification(notification)),
    clearNotification: () => dispatch(clearNotification()),
  }
}

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(Signup)

