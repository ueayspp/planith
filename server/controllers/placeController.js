require('dotenv').config()

const axios = require('axios')

const API_KEY = process.env.API_KEY
const TEXT_SEARCH_URL = 'https://maps.googleapis.com/maps/api/place/textsearch/json'
const PLACE_DETAILS_URL = 'https://maps.googleapis.com/maps/api/place/details/json'
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

// Get a place
const getPlace = async (req, res) => {
  const place_id = req.query.place_id
  console.log(place_id)

  const params = {
    key: API_KEY,
    place_id: place_id,
    language: 'th',
  }

  axios
    .get(PLACE_DETAILS_URL, { params })
    .then(function (response) {
      const result = response.data.result
      res.send(result)
    })
    .catch(function (error) {
      console.log(error)
    })
}

// Get durations for each day
const getDurations = async (req, res) => {
  const durations = {}

  const placeIds = req.query.placeIds
  for (const day in placeIds) {
    const dayPlaceIds = placeIds[day]
    const origins = dayPlaceIds.slice(0, -1)
    const destinations = dayPlaceIds.slice(1)

    const dayDurations = []
    for (let i = 0; i < origins.length; i++) {
      const origin = origins[i]
      const destination = destinations[i]
      const response = await axios.get(DIRECTIONS_URL, {
        params: {
          origin: `place_id:${origin}`,
          destination: `place_id:${destination}`,
          language: 'th',
          key: API_KEY,
        },
      })

      const route = response.data.routes[0]
      const leg = route.legs[0]
      const durationInMins = leg.duration.text
      const distanceInKiloMeters = (leg.distance.value / 1000).toFixed(1)
      dayDurations.push({ durationInMins, distanceInKiloMeters })
    }

    durations[day] = dayDurations
  }

  console.log(durations)
  res.send(durations)
}

module.exports = {
  searchPlace,
  getPlace,
  getDurations,
}
