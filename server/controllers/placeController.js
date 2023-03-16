require('dotenv').config()

const axios = require('axios')

const API_KEY = process.env.API_KEY
const TEXT_SEARCH_URL = 'https://maps.googleapis.com/maps/api/place/textsearch/json'

// GET all places
const getPlaces = async (req, res) => {
  res.json(['Get all places'])
}

// GET a single place
const getPlace = async (req, res) => {
  const { name } = req.params
  res.json({ name })
}

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

module.exports = {
  getPlaces,
  getPlace,
  searchPlace,
}
