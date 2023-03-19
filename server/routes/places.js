require('dotenv').config()

const express = require('express')
const { searchPlace, getDuration, getDurations } = require('../controllers/placeController')

const router = express.Router()

// Search a place
router.get('/', searchPlace)

// Calculate Time
router.get('/time', getDuration)

// GET each duration
router.get('/duration', getDurations)

module.exports = router
