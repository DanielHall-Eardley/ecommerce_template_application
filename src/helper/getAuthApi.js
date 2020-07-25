import {apiHost} from '../global'

/*This function is used to make authorized get api requests*/
export default async (url, token, errorHandler) => {
  const res = await fetch(apiHost + url, {
    headers: {
      'Content-Type': 'application/json',
      'Authorization': token
    }
  })

  const response = await res.json();

  if (response.error) {
    errorHandler(response.error)
    return null
  }
  
  return response
}