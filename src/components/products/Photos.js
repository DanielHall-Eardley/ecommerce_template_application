import React from 'react'
import styles from './Photos.module.css'
import '../../Global.css'
import {
  displayError, 
  clearError,
} from '../../actions/notification'
import {connect} from 'react-redux'

/*This component allows for multiple images to be selected
for upload and renders a preview of all images*/
const Photos = props => {

  /*This function builds a photo preview array and photo file
  array simultaneously*/
  const uploadPhoto = (event) => {
    props.clearError()

    //Merge local state array in case photos have been selected
    let photoArray = [...props.photoArray]

    let fileArray = []
    for (let i = 0; i < event.target.files.length; i++) {
      const fileType = event.target.files[i].type
      
      //Check file extension
      if(!checkFileType(fileType)) {
        return props.displayError("File type must be of jpg, jpeg or png")
      }

      //create url for photo preview
      const fileName = event.target.files[i].name
      const filePath = window.URL.createObjectURL(event.target.files[i])

      /*If photo preview array is empty push raw file 
      and photo preview object into their respective arrays*/
      if (photoArray.length < 1) {
        fileArray.push(event.target.files[i])
        photoArray.push({
          filePath: filePath,
          fileName: fileName,
          fileSize: returnFileSize(event.target.files[i].size)
        })
      }else {

        //Omit any duplicate files
        let duplicatePhoto = false
        for (let obj of photoArray) {
          if(fileName === obj.fileName) {
            duplicatePhoto = true
          }
        }
        
        if (duplicatePhoto) {
          props.displayError('A duplicate file was ommitted') 
        } else {
        fileArray.push(event.target.files[i])
          photoArray.push({
            filePath: filePath,
            fileName: fileName,
            fileSize: returnFileSize(event.target.files[i].size)
          })
        } 
      }
    }
    
    props.setPhotoArray(photoArray)
    props.setFileArray(fileArray)
  }

  /*Only allow image based file extensions*/
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

  /*Calculate the correct unit of measurement for the file*/
  const returnFileSize = (number) => {
    if(number < 1024) {
      return number + 'bytes';
    } else if(number >= 1024 && number < 1048576) {
      return (number/1024).toFixed(1) + 'KB';
    } else  if(number >= 1048576) {
      return (number/1048576).toFixed(1) + 'MB';
    }
  }

  const renderPhotoArray = array => {
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
          Upload Photos
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
        {renderPhotoArray(props.photoArray)}
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
