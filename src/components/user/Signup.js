import React, {useState} from 'react'
import styles from './Signup.module.css'
import '../../Global.css'
import {useHistory, useLocation} from 'react-router-dom'
import api from '../../helper/api'
import {connect} from 'react-redux'
import {
  displayError, 
  clearError,
  displayNotification,
  clearNotification
} from '../../actions/notification'
import Notification from '../notification/Notification'

const useQuery = () => {
  return new URLSearchParams(useLocation().search);
}

const Signup = (props) => {
  const query = useQuery()
  const history = useHistory()

  const [name, setName] = useState('')
  const [password, setPassword] = useState('')
  const [email, setEmail] = useState('')

  const endpoint = (query) => {
    const create = query.get('type')
    if (create === 'admin') {
      return '/admin/signup'
    }

    return '/user/signup'
  }

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

    const url = endpoint(query)
    console.log(url)
    const response = await api(url, body, headers, 'POST')

    if (response.error) {
      return props.displayError(response.error)
    }

    props.displayNotification(response.message)
    history.push('/login')
  }

  return (
    <section className={styles.container}>
      <Notification error={props.error} notification={props.notification}/>
      <form onSubmit={signup} className={styles.signup}>
        <input 
          placeholder='Enter Name'
          type="text" 
          value={name} 
          onChange={(event) => setName(event.target.value)}/>
        <input 
          placeholder='Enter Email'
          type="email" 
          value={email}
          onChange={(event) => setEmail(event.target.value)}/>
        <input 
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

