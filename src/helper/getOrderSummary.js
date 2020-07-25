import {apiHost} from '../global'

export default async (userId, token, storeOrderSummary, fetchFn) => {
  const res = await fetchFn(apiHost + '/order/summary/' + userId, {
    headers: {
      'Content-Type': 'application/json',
      'Authorization': token
    }
  }, [])

  const response = await res.json()

  if (!response.error) {
    storeOrderSummary(response)
  }
}