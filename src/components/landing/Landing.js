import React from 'react'
import styles from './Landing.module.css'

import Banner from './Banner'
import About from './About'
import Footer from './Footer'

export default props => {
  return (
    <main>
      <Banner img='https://ecommerce-demo-website.s3.ca-central-1.amazonaws.com/2018-Dodge-Challenger-SRT-Hellcat-Widebody-V1-1080.jpg_4d590e2a-4459-4d0e-82d7-0c77c6f852d4'/>
      <About/>
      <Footer/>
    </main>
  )
}