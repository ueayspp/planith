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
  const query = req.params.query

  axios
    .get(TEXT_SEARCH_URL, {
      method: 'get',
      headers: {},
      params: {
        key: API_KEY,
        input: query,
        type: 'tourist_attraction',
        language: 'th',
      },
    })
    .then(function (response) {
      console.log(JSON.stringify(response.data))
      res.send(response.data.results)
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
