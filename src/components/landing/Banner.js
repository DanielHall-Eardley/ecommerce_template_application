import React from 'react'
import styles from './Banner.module.css'
import '../../Global.css'

export default props => {
  return (
    <div className={styles.container}>
      <img src={props.img} alt="banner"/>
    </div>
  )
}