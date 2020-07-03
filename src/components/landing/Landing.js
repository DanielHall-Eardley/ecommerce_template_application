import React from 'react'
import styles from './Landing.module.css'

import Banner from './Banner'
import About from './About'
import Footer from './Footer'

export default props => {
  return (
    <main>
      <Banner img='https://ecommerce-demo-website.s3.ca-central-1.amazonaws.com/pc-background-2.jpg_1ee48f77-32e4-4d6b-921a-41cab66bd4bc'/>
      <About/>
      <Footer/>
    </main>
  )
}