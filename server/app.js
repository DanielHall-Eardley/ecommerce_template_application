const express = require('express')
const app = express()

const Easypost = require('@easypost/api')
const api = new Easypost('EZTK9ac803df43c946479ebe8e43c56cf836v7SbRH70kJCmWRB57yl2qA')


const generateRates = async (from, to, parcel, api) => {
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
    console.log(rates)
    return rates
  } catch (error) {
    console.log(error)
  }
}

const fromAddress = {
  street1: '3226 Redpath Circle',
  city: 'Mississauga',
  state: 'Ontario',
  country: 'CA',
  zip: 'L5N8R2'
}

const toAddress = {
  street1: '65 High Park Avenue',
  street2: 'apt 401',
  city: 'Etobicoke',
  state: 'Ontario',
  country: 'CA',
  zip: 'M6P2R7'
}

const parcel = {
  predefined_package: 'FlatRateEnvelope',
  weight: 10,
}

const getRates = generateRates(fromAddress, toAddress, parcel, api)

app.use((req, res, next) => {
  res.json({rates: getRates})
})

app.listen(3000)