import axios from 'axios'
import { useParams } from 'react-router-dom'
import { useState, useEffect } from 'react'

import Navbar from '../components/Navbar'
import AlertMessage from '../components/AlertMessage'
import ToastMessage from '../components/ToastMessage'

import { Button, Carousel, Card, Rating } from 'flowbite-react'

import { PlusSmallIcon } from '@heroicons/react/24/solid'

import dayjs from 'dayjs'
import 'dayjs/locale/th'

function PlaceDetail({ places }) {
  const { place_id } = useParams()

  const [placeDetail, setPlaceDetail] = useState()

  const [showAlert, setShowAlert] = useState(false)
  const [showToast, setShowToast] = useState(false)
  const [method, setMethod] = useState()

  // selected place
  const [selectedPlace, setSelectedPlace] = useState([])
  const [numSelectedPlaces, setNumSelectedPlaces] = useState()

  const [tripPlan, setTripPlan] = useState([])
  const [itinerary, setItinerary] = useState()
  const [time, setTime] = useState()

  useEffect(() => {
    // Get tripPlanData from localStorage
    const tripPlanData = JSON.parse(localStorage.getItem('tripPlan'))
    if (tripPlanData) {
      setTripPlan(tripPlanData)
    }
  }, [])

  useEffect(() => {
    getPlace()
  }, [])

  useEffect(() => {
    const tripPlanData = JSON.parse(localStorage.getItem('tripPlan')) || []
    if (Array.isArray(tripPlanData.cart)) {
      setSelectedPlace(tripPlanData.cart)
      setNumSelectedPlaces(tripPlanData.cart.length)
    }
  }, [])

  // fetch data using place_id
  async function getPlace() {
    const params = {
      place_id,
    }

    try {
      const response = await axios.get('/api/places/:place_id', { params })
      setPlaceDetail(response.data)
    } catch (error) {
      console.log(error)
    }
  }

  // Define a function to calculate the distance between two points using the Haversine formula
  function distance(lat1, lon1, lat2, lon2) {
    const R = 6371 // Earth's radius in kilometers
    const dLat = toRadians(lat2 - lat1)
    const dLon = toRadians(lon2 - lon1)
    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(toRadians(lat1)) *
        Math.cos(toRadians(lat2)) *
        Math.sin(dLon / 2) *
        Math.sin(dLon / 2)
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))
    return R * c // Distance in kilometers
  }

  // Define a function to convert degrees to radians
  function toRadians(degrees) {
    return (degrees * Math.PI) / 180
  }

  // Create planner
  function createPlanner() {
    const tripPlanData = JSON.parse(localStorage.getItem('tripPlan'))

    const startDate = new Date(tripPlanData.startDate)
    const endDate = new Date(tripPlanData.endDate)

    const cart = tripPlanData.cart

    const diffDays = Math.ceil((endDate - startDate) / (1000 * 60 * 60 * 24)) + 1

    function groupPlacesByKMeans(places, k) {
      const seedrandom = require('seedrandom')
      // Initialize the random number generator with a seed
      const rng = seedrandom(3)

      // Extract the coordinates of each place
      const coords = places.map((place) => [
        place.geometry.location.lat,
        place.geometry.location.lng,
      ])

      // Initialize the centroids randomly
      const centroids = []
      for (let i = 0; i < k; i++) {
        const randIndex = Math.floor(rng() * coords.length)
        centroids.push(coords[randIndex])
      }

      // Assign each point to its closest centroid
      const clusters = Array.from({ length: k }, () => [])
      coords.forEach((coord) => {
        let minDist = Infinity
        let closestCentroidIndex = null

        centroids.forEach((centroid, index) => {
          const dist = distance(coord[0], coord[1], centroid[0], centroid[1])
          if (dist < minDist) {
            minDist = dist
            closestCentroidIndex = index
          }
        })

        clusters[closestCentroidIndex].push(coord)
      })

      // Recalculate the centroids based on the mean of each cluster
      let converged = false
      while (!converged) {
        const newCentroids = []
        clusters.forEach((cluster) => {
          const meanCoord = cluster.reduce(
            (acc, coord) => [acc[0] + coord[0], acc[1] + coord[1]],
            [0, 0]
          )
          meanCoord[0] /= cluster.length
          meanCoord[1] /= cluster.length
          newCentroids.push(meanCoord)
        })

        // Check if the centroids have converged
        converged = true
        for (let i = 0; i < k; i++) {
          if (
            distance(centroids[i][0], centroids[i][1], newCentroids[i][0], newCentroids[i][1]) >
            0.0001
          ) {
            converged = false
            break
          }
        }

        // Update the centroids and clusters
        centroids.splice(0, centroids.length, ...newCentroids)
        clusters.splice(0, clusters.length, ...Array.from({ length: k }, () => []))
        coords.forEach((coord) => {
          let minDist = Infinity
          let closestCentroidIndex = null

          centroids.forEach((centroid, index) => {
            const dist = distance(coord[0], coord[1], centroid[0], centroid[1])
            if (dist < minDist) {
              minDist = dist
              closestCentroidIndex = index
            }
          })

          clusters[closestCentroidIndex].push(coord)
        })
      }

      // Convert the clusters back to place objects
      const result = clusters.map((cluster) =>
        cluster.map((coord) => {
          const place = places.find(
            (p) => p.geometry.location.lat === coord[0] && p.geometry.location.lng === coord[1]
          )
          return [place, { time: '' }]
        })
      )

      return result
    }

    const k = diffDays
    const clusters = groupPlacesByKMeans(cart, k)
    console.log('clusters', clusters) // [ [ Place 1, Place 3 ], [ Place 2 ], [ Place 4 ] ]

    const itinerary = {}

    for (let date = new Date(startDate); date <= endDate; date.setDate(date.getDate() + 1)) {
      const dateString = dayjs(date).locale('th').add(543, 'year').format('D MMMM YYYY')
      itinerary[dateString] = []
    }

    for (let i = 0; i < clusters.length; i++) {
      const dateString = dayjs(startDate)
        .add(i, 'day')
        .locale('th')
        .add(543, 'year')
        .format('D MMMM YYYY')
      itinerary[dateString].push(...clusters[i])
    }

    console.log(itinerary)

    setItinerary(itinerary)
    tripPlanData.planner = itinerary
    localStorage.setItem('tripPlan', JSON.stringify(tripPlanData))
  }

  // Select Place
  function handleSelect(place) {
    const tripPlanData = JSON.parse(localStorage.getItem('tripPlan')) || {}

    // Check if the planner already create or not
    // If create already, add new place to cart and createPlanner()
    if (tripPlanData.planner) {
      tripPlanData.cart = tripPlanData.cart || []

      // Add the selected place to the cart
      const updatedSelectedPlace = [...tripPlanData.cart, place]

      // Update the selected place data
      tripPlanData.cart = updatedSelectedPlace

      // Update state and localStorage
      setSelectedPlace(updatedSelectedPlace)
      setNumSelectedPlaces(updatedSelectedPlace.length)
      localStorage.setItem('tripPlan', JSON.stringify(tripPlanData))

      createPlanner()
    } else {
      tripPlanData.cart = tripPlanData.cart || []

      // Add the selected place to the cart
      const updatedSelectedPlace = [...tripPlanData.cart, place]

      // Update the selected place data
      tripPlanData.cart = updatedSelectedPlace

      // Update state and localStorage
      setSelectedPlace(updatedSelectedPlace)
      setNumSelectedPlaces(updatedSelectedPlace.length)
      localStorage.setItem('tripPlan', JSON.stringify(tripPlanData))
    }

    setMethod('ADD')
    setShowToast(true)
    setTimeout(() => {
      setShowToast(false)
    }, 1000)
  }

  // Unselect Place
  function handleUnselect(place) {
    const tripPlanData = JSON.parse(localStorage.getItem('tripPlan')) || {}

    // Check if the planner create or not?
    // If create already, delete the place from planner and cart
    const itinerary = tripPlanData.planner
    if (tripPlanData.planner) {
      // find the day that contains the place to delete
      const day = Object.keys(itinerary).find((day) => {
        return itinerary[day].find((item) => item[0].place_id === place.place_id)
      })
      // remove the place from the day
      const updatedPlanner = { ...itinerary }
      updatedPlanner[day] = updatedPlanner[day].filter((item) => {
        return item[0].place_id !== place.place_id
      })
      // remove the place from the cart
      const updatedSelectedPlace = tripPlanData.cart.filter((item) => {
        return item.place_id !== place.place_id
      })

      // Update state and localStorage
      tripPlanData.cart = updatedSelectedPlace
      tripPlanData.planner = updatedPlanner
      setSelectedPlace(updatedSelectedPlace)
      setNumSelectedPlaces(updatedSelectedPlace.length)
      localStorage.setItem('tripPlan', JSON.stringify(tripPlanData))
    } else {
      // Remove the selected place from the cart
      const updatedSelectedPlace = tripPlanData.cart.filter((p) => p.place_id !== place.place_id)

      // Update the selected place data
      tripPlanData.cart = updatedSelectedPlace

      // Update state and localStorage
      setSelectedPlace(updatedSelectedPlace)
      setNumSelectedPlaces(updatedSelectedPlace.length)
      localStorage.setItem('tripPlan', JSON.stringify(tripPlanData))
    }

    setMethod('DEL')
    setShowToast(true)
    setTimeout(() => {
      setShowToast(false)
    }, 1000)
  }

  return (
    <div>
      <Navbar />
      {showAlert && <AlertMessage message="กรุณากรอกสถานที่" color="failure" />}
      {showToast && <ToastMessage method={method} />}
      {placeDetail && (
        <div className="px-12 pt-10 space-y-12">
          <div className="w-full h-full sm:h-64 xl:h-128 2xl:h-128">
            <Carousel className="w-128 h-128">
              {placeDetail.photos.map((photo, index) => (
                <img
                  key={index}
                  src={`https://maps.googleapis.com/maps/api/place/photo?maxwidth=1600&photoreference=${photo.photo_reference}&key=AIzaSyDGRFphLumw98ls5l02FfV3ppVA2nljW6o`}
                  alt={placeDetail.name}
                  className="h-128 w-128"
                />
              ))}
            </Carousel>
          </div>
          <div className="flex h-full">
            <div className="w-1/2 space-y-2">
              {' '}
              <h1 className="text-2xl">{placeDetail.name}</h1>
              <Rating>
                <Rating.Star />
                <p>{placeDetail.rating}</p>
                <span className="mx-1.5 h-1 w-1 rounded-full bg-gray-500 dark:bg-gray-400" />
                <p>{placeDetail.user_ratings_total} รีวิว</p>
              </Rating>
              <p>{placeDetail.formatted_address}</p>
            </div>
            <div className="w-1/2">
              <div className="flex justify-end">
                {selectedPlace.find((p) => p.place_id === placeDetail.place_id) ? (
                  <Button color="light" onClick={() => handleUnselect(placeDetail)}>
                    เลือกแล้ว
                  </Button>
                ) : (
                  <Button color="dark" onClick={() => handleSelect(placeDetail)}>
                    <PlusSmallIcon className="h-5 w-5 text-white" />
                    เลือก
                  </Button>
                )}
              </div>
            </div>
          </div>

          <div className="flex flex-col space-y-2">
            {placeDetail?.editorial_summary?.overview?.length &&
            placeDetail?.current_opening_hours ? (
              <>
                <p className="text-lg py-2">คำอธิบาย</p>
                <p>{placeDetail.editorial_summary.overview}</p>
                <br />
                <div>
                  <p className="text-lg py-4">เวลาเปิดทำการ</p>
                  <p>{placeDetail.current_opening_hours.weekday_text[0]}</p>
                  <p>{placeDetail.current_opening_hours.weekday_text[1]}</p>
                  <p>{placeDetail.current_opening_hours.weekday_text[2]}</p>
                  <p>{placeDetail.current_opening_hours.weekday_text[3]}</p>
                  <p>{placeDetail.current_opening_hours.weekday_text[4]}</p>
                  <p>{placeDetail.current_opening_hours.weekday_text[5]}</p>
                  <p>{placeDetail.current_opening_hours.weekday_text[6]}</p>
                </div>
              </>
            ) : (
              ''
            )}
          </div>
        </div>
      )}
    </div>
  )
}

export default PlaceDetail
