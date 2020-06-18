import React from 'react'
import styles from './Landing.module.css'

import Banner from './Banner'
import About from './About'

export default props => {
  return (
    <main>
      <Banner img='https://via.placeholder.com/1000'/>
      <About/>
    </main>
  )
}