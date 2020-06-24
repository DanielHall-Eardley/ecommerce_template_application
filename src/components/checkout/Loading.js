import React from 'react'
import styles from './Loading.module.css'
import sprite from '../../sprite.svg'

export default props => {
  return (
    <div className={styles.overlay}>
      <svg className={styles.spinner}>
        <use xlinkHref={sprite + 'sprite.svg#icon-loop2'}></use>
      </svg>
      <p className={styles.msg}>{props.msg}</p>
    </div>
  )
}