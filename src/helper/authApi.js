import {apiHost} from '../global'

/*This function is used to make authorized api 
requests for POST, PUT, DELETE methods*/
export default async (url, token, body, method, errorHandler) => {
  const res = await fetch(apiHost + url, {
    method,
    body: JSON.stringify(body),
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