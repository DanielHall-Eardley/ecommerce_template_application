import React from 'react'
import styles from './Footer.module.css'
import '../../Global.css'

export default props => {
  return (
    <footer className={styles.container}>
      <ul className={styles.links}>
        <li>Contact: 350chevy8@gmail.com</li>
      </ul>
      <p className={styles.copyright}>&copy; 2020, Daniel Hall-Eardley</p>
    </footer>
  )
}