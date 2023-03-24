require('dotenv').config()

const express = require('express')
const { searchPlace, getDurations } = require('../controllers/placeController')

const router = express.Router()

// Search a place
router.get('/', searchPlace)

// GET each duration
router.get('/duration', getDurations)

module.exports = router
