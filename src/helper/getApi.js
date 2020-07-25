import {apiHost} from '../global'

/*This function is used to make unauthorized get api requests*/
export default async (url, errorHandler) => {
  const res = await fetch(apiHost + url, {
    headers: {
      'Content-Type': 'application/json'
    }
  })

  const response = await res.json();

  if (response.error) {
    errorHandler(response.error)
    return null
  }
  
  return response
}
