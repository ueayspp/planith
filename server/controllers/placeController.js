require('dotenv').config()

const axios = require('axios')

const API_KEY = process.env.API_KEY
const TEXT_SEARCH_URL = 'https://maps.googleapis.com/maps/api/place/textsearch/json'
const DIRECTIONS_URL = 'https://maps.googleapis.com/maps/api/directions/json'

// Search a place
const searchPlace = async (req, res) => {
  const input = req.query.input
  const pagetoken = req.query.pagetoken

  const params = {
    key: API_KEY,
    input: input,
    type: 'tourist_attraction',
    language: 'th',
  }

  if (pagetoken) {
    params.pagetoken = pagetoken
  }

  axios
    .get(TEXT_SEARCH_URL, { params })
    .then(function (response) {
      const results = response.data.results
      const nextPageToken = response.data.next_page_token
      // console.log(JSON.stringify(response.data))
      res.send({ results, nextPageToken })
    })
    .catch(function (error) {
      console.log(error)
    })
}

// Calculate Time
// default driving mode
const getDuration = async (req, res) => {
  const origin = req.query.origin
  const destination = req.query.destination

  const params = {
    key: API_KEY,
    origin: origin,
    destination: destination,
    language: 'th',
  }

  axios
    .get(DIRECTIONS_URL, { params })
    .then(function (response) {
      console.log(response.data)

      const route = response.data.routes[0]
      const leg = route.legs[0]
      const durationInMins = leg.duration.text
      const distanceInKiloMeters = (leg.distance.value / 1000).toFixed(1)
      console.log('duration', durationInMins)
      console.log('distance', distanceInKiloMeters)
      res.send({ durationInMins, distanceInKiloMeters })
    })
    .catch(function (error) {
      console.log(error)
    })
}

const getDurations = async (req, res) => {
  const durations = []

  const placeNames = req.query.placeNames
  console.log('server place names', placeNames)

  const origins = placeNames.slice(0, -1) // remove last index
  const destinations = placeNames.slice(1) // remove first index

  for (let i = 0; i < origins.length; i++) {
    const origin = origins[i]
    const destination = destinations[i]

    const response = await axios.get(DIRECTIONS_URL, {
      params: {
        origin,
        destination,
        language: 'th',
        key: API_KEY,
      },
    })

    const route = response.data.routes[0]
    const leg = route.legs[0]
    const durationInMins = leg.duration.text
    durations.push({ origin, destination, durationInMins })
  }

  console.log(durations)
  res.send(durations)
}

module.exports = {
  searchPlace,
  getDuration,
  getDurations,
}
