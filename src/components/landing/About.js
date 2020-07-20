import React from 'react'
import styles from './About.module.css'
import '../../Global.css'

export default props => {
  return (
    <article className={styles.container}>
      <h1 className='heading'>About This Website</h1>
      <p className={styles.text}>
        This is a ecommerce demo website, it includes basic features such as product creation and order management. Potential customers can browse, search for products and when ready can create an account to purchase products. On the business side of things Stripe is used in combination with Easypost to automatically accept payments and generate shipping labels. The application is in test mode, so feel free to try out all the features. This website is just a simple example of what I can build, I can build a fully customized solution to suit your business's needs. My goal is help small to medium sized businesses who are trying enter the online marketplace.
      </p>
    </article>
  )
}