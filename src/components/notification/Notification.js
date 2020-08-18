import React, {useEffect} from 'react'
import styles from './Notification.module.css'

export default props => {

  useEffect(() => {
    window.scrollTo({
      top: 0,
      left: 0,
      behavior: 'smooth'
    })
  }, [props.error, props.notification])
  
  const notificationArray = (arrayOrNull, notificationType) => {
    if (arrayOrNull) {
      return arrayOrNull.map(error => {
        return <p className={styles[notificationType]} key={error}>{error}</p>
      })
    }
  }

  return (
    <h3 role='alert' aria-label='notification'>
      {notificationArray(props.error, 'error')}
      {notificationArray(props.notification, 'notification')}
    </h3>
  )
}