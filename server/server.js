require('dotenv').config()

const express = require('express')
const cors = require('cors')
const placeRoutes = require('./routes/places')

// express app
const app = express()

// cors
app.use(cors())

// middleware
app.use(express.json())

app.use((req, res, next) => {
  console.log(req.path, req.method)
  next()
})

// routes
app.use('/api/places', placeRoutes)

// listen for requests
app.listen(process.env.PORT, () => {
  console.log('Server listening on port', process.env.PORT)
})
