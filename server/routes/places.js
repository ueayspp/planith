require('dotenv').config()

const express = require('express')
const { searchPlace, getPlace, getDurations } = require('../controllers/placeController')

const router = express.Router()

// Search places
router.get('/', searchPlace)

// GET a place
router.get('/:place_id', getPlace)

// GET each duration
router.get('/duration', getDurations)

module.exports = router
