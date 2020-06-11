import React from 'react'
import styles from './Title.module.css'
import '../../Global.css'

export default ({title}) => {
  return <h1 className={styles.title}>{title}</h1>
}