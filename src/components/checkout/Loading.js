import React from 'react'
import styles from './Loading.module.css'
import sprite from '../../sprite.svg'

/*This component overlays the screen, displays a loading message
and prevents users from interacting with page*/
export default props => {
  return (
    <div className={styles.overlay}>
      <svg className={styles.spinner}>
        <use href={sprite + 'sprite.svg#icon-loop2'}></use>
      </svg>
      <p className={styles.msg}>{props.msg}</p>
    </div>
  )
}