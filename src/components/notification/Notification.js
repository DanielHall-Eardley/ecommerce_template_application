import React from 'react'
import styles from './Notification.module.css'

export default props => {
  const errorArray = props.error.map(error => {
    return <p className={styles.error} key={error}>{error}</p>
  })

  const notificationArray = props.notification.map(notification => {
    return <p className={styles.notification} key={notification}>{notification}</p>
  })

  return (
    <h3>
      {errorArray}
      {notificationArray}
    </h3>
  )
}