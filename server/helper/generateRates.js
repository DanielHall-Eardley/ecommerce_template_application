module.exports = async (from, to, parcel, api) => {
  try {
    const fromAddress = new api.Address(from)
    const toAddress = new api.Address(to)
    const parcelToSend = new api.Parcel(parcel)
    
    await Promise.all([fromAddress.save(), toAddress.save(), parcelToSend.save()])

    const shipment = new api.Shipment ({
      to_address: toAddress,
      from_address: fromAddress,
      parcel: parcelToSend
    })

    const rates = await shipment.save()
    
    return rates
  } catch (error) {
    return error
  }
}