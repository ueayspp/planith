require('dotenv').config()

const express = require('express')
const { getPlaces, getPlace, searchPlace } = require('../controllers/placeController')

const router = express.Router()

// GET all places
// router.get('/', getPlaces)

// GET a single place
// router.get('/:name', getPlace)

// Search a place
router.get('/', searchPlace)

module.exports = router
