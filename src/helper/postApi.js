import {apiHost} from '../global'

/*This function is used to make unauthorized post api requests*/
export default async (url, body, errorHandler) => {
  const res = await fetch(apiHost + url, {
    method: 'POST',
    body: JSON.stringify(body),
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
