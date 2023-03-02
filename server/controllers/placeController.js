require('dotenv').config()

// axios
const axios = require('axios')

// API_KEY
const apiKey = process.env.API_KEY

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
  // const url = `https://maps.googleapis.com/maps/api/place/findplacefromtext/json?input=${query}&inputtype=textquery&fields=place_id&language=th&key=${apiKey}`
  const url = `https://maps.googleapis.com/maps/api/place/textsearch/json?input=${query}&type=tourist_attraction&language=th&key=${apiKey}`

  try {
    const response = await axios.get(url)
    res.send(response.data.results)
  } catch (error) {
    console.log(error)
    res.status(500).send(error)
  }
}

module.exports = {
  getPlaces,
  getPlace,
  searchPlace,
}
