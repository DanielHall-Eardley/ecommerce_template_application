import React, {useState, useEffect} from 'react'
import styles from './List.module.css'
import '../../Global.css'
import {connect} from 'react-redux'
import {Link} from 'react-router-dom'

const List = props => {
  const [currentProductList, setList] = useState([])

  useEffect(() => {
    if (props.searching) {
      setList(props.filteredList)
    } else {
      setList(props.productList)
    }
  }, [props.searching, props.productList, props.filteredList])

  const productList = (products) => {
    const productList = products.map(prd => {
      return(
        <div key={prd._id} className={styles.listItem}>
          <img src={prd.photoArray[0]} alt='' className={styles.img}/>
          <h3 className={styles.name}>{prd.name}</h3>
          <span className={styles.price}>{prd.price}</span>
          <p className={styles.content}>{prd.description}</p>
          <Link className={styles.link} to={'/product/detail/' + prd._id}>View</Link>
        </div>
      )
    })

    return productList
  }

  return (
    <section className={styles.container}>
      {productList(currentProductList)}
    </section>
  )
}

const mapStateToProps = state => {
  return {
    productList: state.product.productList,
    filteredList: state.product.filteredList,
    searching: state.product.searching
  }
}

export default connect(
  mapStateToProps,
  null
)(List)