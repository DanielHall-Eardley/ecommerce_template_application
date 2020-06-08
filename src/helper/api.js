export default async (url, body, headers, method) => {
  try {
    const response = await fetch("http://localhost:8000/" + url, {
      method: method,
      body: body,
      headers: headers
    })

    const responseData = await response.json();

    if (response.status !== 200) {
      const error = new Error();
      error.messages = responseData;
      throw error;
    }
    return responseData
  } catch (error) {
    return error
  }
}
