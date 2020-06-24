import React from 'react'
import styles from './Photos.module.css'
import '../../Global.css'
import {
  displayError, 
  clearError,
} from '../../actions/notification'
import {connect} from 'react-redux'

const Photos = props => {
  const uploadPhoto = (e) => {
    props.clearError()
    let photoArray = [...props.photoArray]

    let fileArray = []
    for (let i = 0; i < e.target.files.length; i++) {
      const fileType = e.target.files[i].type

      if(!checkFileType(fileType)) {
        return props.displayError("File type must be of jpg, jpeg or png")
      }

      const fileName = e.target.files[i].name
      const filePath = window.URL.createObjectURL(e.target.files[i])

      if (photoArray.length < 1) {
        fileArray.push(e.target.files[i])
        photoArray.push({
          filePath: filePath,
          fileName: fileName,
          fileSize: returnFileSize(e.target.files[i].size)
        })
      }else {
        let duplicatePhoto = false
        for (let obj of photoArray) {
          if(fileName === obj.fileName) {
            duplicatePhoto = true
          }
        }
        
        if (duplicatePhoto) {
          props.displayError('A duplicate file was ommitted') 
        } else {
        fileArray.push(e.target.files[i])
          photoArray.push({
            filePath: filePath,
            fileName: fileName,
            fileSize: returnFileSize(e.target.files[i].size)
          })
        } 
      }
    }
    
    props.setPhotoArray(photoArray)
    props.setFileArray(fileArray)
    console.log(fileArray )
  }

  const checkFileType = (fileType) => {
    const allowedFileTypes = [
      "image/jpeg",
      "image/jpg",
      "image/png"
    ]

    for(let type of allowedFileTypes) {
      if (fileType === type) {
        return true 
      }
    }  

    return false
  }

  const returnFileSize = (number) => {
    if(number < 1024) {
      return number + 'bytes';
    } else if(number >= 1024 && number < 1048576) {
      return (number/1024).toFixed(1) + 'KB';
    } else  if(number >= 1048576) {
      return (number/1048576).toFixed(1) + 'MB';
    }
  }

  const renderArray = array => {
    return array.map(photo => {
      return (
        <div key={photo.filePath} className={styles.photo}>
          <img src={photo.filePath} alt=''/>
          <label>{photo.fileSize}</label>
        </div>
      )
    })
  }
 
  return (
    <div className={styles.container}>
      <label htmlFor="photo-upload" className={styles.upload + ' primary-btn'}>
        Select photos
      </label>
      {!props.uploadComplete ?
        <button onClick={props.uploadPhotosToS3}>
          Upload Selected Photos
        </button>
      : null }
      <input 
        type="file"
        accept="image/*"
        multiple
        hidden
        id="photo-upload"
        onInput={uploadPhoto}/>
      <div className={styles.photoPreview}>
        {renderArray(props.photoArray)}
      </div>
    </div>
  )
}

const mapDispatchToProps = dispatch => {
  return {
    displayError: (error) => dispatch(displayError(error)),
    clearError: () => dispatch(clearError()),
  }
}

export default connect(
  null,
  mapDispatchToProps
)(Photos)
