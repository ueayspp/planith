import axios from 'axios'
import { useState, useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'

import { Badge, Button, Card, Checkbox, Modal, Rating, TextInput } from 'flowbite-react'

import { PlusSmallIcon, SparklesIcon } from '@heroicons/react/24/solid'

// components
import Navbar from '../components/Navbar'
import AlertMessage from '../components/AlertMessage'
import ToastMessage from '../components/ToastMessage'

function Search() {
  const navigate = useNavigate()

  const [showModal, setShowModal] = useState(false)
  const [showAlert, setShowAlert] = useState(false)
  const [showToast, setShowToast] = useState(false)
  const [method, setMethod] = useState()

  // search place
  const [query, setQuery] = useState('')
  const [places, setPlaces] = useState([])
  const [nextPageToken, setNextPageToken] = useState(null)

  // loading state
  const [loading, setLoading] = useState(false)

  // selected place
  const [selectedPlace, setSelectedPlace] = useState([])
  const [numSelectedPlaces, setNumSelectedPlaces] = useState()

  // checkbox
  const [checkboxItems, setCheckboxItems] = useState([])

  useEffect(() => {
    const tripPlanData = JSON.parse(localStorage.getItem('tripPlan')) || []
    if (Array.isArray(tripPlanData.cart)) {
      setSelectedPlace(tripPlanData.cart)
      setNumSelectedPlaces(tripPlanData.cart.length)
    }
  }, [])

  // Search Places
  async function handleSearch(event) {
    if (query !== '') {
      setLoading(true)
      event.preventDefault()

      const params = {
        input: query,
      }

      try {
        const response = await axios.get('/api/places/search', { params })
        setPlaces(response.data.results)
        setNextPageToken(response.data.nextPageToken)
        console.log(nextPageToken)
        setLoading(false)
      } catch (error) {
        console.log(error)
        setLoading(false)
      }
    } else {
      event.preventDefault()
      setShowAlert(true)
      setTimeout(() => {
        setShowAlert(false)
      }, 1000)
    }
  }

  // Next Page
  async function handleNextPage(event) {
    setLoading(true)
    event.preventDefault()

    const params = {
      pagetoken: nextPageToken,
    }

    try {
      const response = await axios.get('/api/places/search', { params })
      setPlaces([...places, ...response.data.results])
      setNextPageToken(response.data.nextPageToken)
      setLoading(false)
    } catch (error) {
      console.log(error)
      setLoading(false)
    }
  }

  // Select Place
  function handleSelect(place) {
    const tripPlanData = JSON.parse(localStorage.getItem('tripPlan')) || {}

    // Check if the planner already create or not
    // If create already, add new place to cart and last day of planner
    if (tripPlanData.planner) {
      // Access the last key in the "planner" object
      const keys = Object.keys(tripPlanData.planner)
      const lastKey = keys[keys.length - 1]
      // Update the new selected place data to the cart
      const updatedSelectedPlace = [...tripPlanData.cart, place]
      tripPlanData.cart = updatedSelectedPlace

      // Push the new item to the last key in the planner object
      tripPlanData.planner[lastKey].push([place, { time: '' }])

      // Update state and localStorage
      setSelectedPlace(updatedSelectedPlace)
      setNumSelectedPlaces(updatedSelectedPlace.length)
      localStorage.setItem('tripPlan', JSON.stringify(tripPlanData))
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

  // Select place to delete using checkbox
  function handleCheckboxChange(index) {
    const isChecked = checkboxItems.includes(index)
    const newCheckboxItems = isChecked
      ? checkboxItems.filter((item) => item !== index)
      : [...checkboxItems, index]

    setCheckboxItems(newCheckboxItems)
  }

  // Delete the place from checkbox
  function handleCheckboxDelete(place, index) {
    const tripPlanData = JSON.parse(localStorage.getItem('tripPlan')) || {}

    const updatedSelectedPlace = selectedPlace.filter((place, i) => {
      return !checkboxItems.includes(i)
    })

    const updatedCheckboxItems = checkboxItems.filter(
      (item) => item !== index && item < updatedSelectedPlace.length
    )

    if (tripPlanData.planner) {
      const checkboxPlaces = selectedPlace[checkboxItems]

      // find the day that contains the place to delete
      const updatedPlanner = tripPlanData.planner
      const day = Object.keys(updatedPlanner).find((day) => {
        return updatedPlanner[day].find((item) => item[0].place_id === checkboxPlaces.place_id)
      })
      updatedPlanner[day] = updatedPlanner[day].filter((item) => {
        return item[0].place_id !== checkboxPlaces.place_id
      })

      // Update the selected place data
      tripPlanData.cart = updatedSelectedPlace
      tripPlanData.planner = updatedPlanner

      // Update state and localStorage
      setCheckboxItems(updatedCheckboxItems)
      setSelectedPlace(updatedSelectedPlace)
      setNumSelectedPlaces(updatedSelectedPlace.length)
      localStorage.setItem('tripPlan', JSON.stringify(tripPlanData))
    } else {
      // Update the selected place data
      tripPlanData.cart = updatedSelectedPlace

      // Update state and localStorage
      setCheckboxItems(updatedCheckboxItems)
      setSelectedPlace(updatedSelectedPlace)
      setNumSelectedPlaces(updatedSelectedPlace.length)
      localStorage.setItem('tripPlan', JSON.stringify(tripPlanData))
    }
  }

  return (
    <div className="h-screen bg-almond-beige">
      <Navbar />
      <div className="p-8 space-y-2 md:px-20 md:space-y-8 bg-almond-beige">
        {showAlert && <AlertMessage message="กรุณากรอกสถานที่" color="failure" />}
        {showToast && <ToastMessage method={method} />}

        <div className="lg:px-60 xl:px-72">
          <form onSubmit={handleSearch} className="flex flex-col justify-center gap-2">
            <span className="flex justify-center">
              <label
                htmlFor="query"
                id="header-logo"
                className="text-7xl text-center text-green-700"
              >
                Explore
              </label>
              <SparklesIcon className="h-5 w-5 text-green-700" />
            </span>

            <p className="text-center">ลองค้นหาสถานที่ในไทยดูสิ !</p>
            <br />
            <TextInput
              type="text"
              id="query"
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder="เช่น กรุงเทพ"
            />
            <Button className="bg-orange-700 hover:bg-orange-800" type="submit">
              ค้นหา
            </Button>
          </form>
        </div>

        <Button
          color="light"
          onClick={() => setShowModal(true)}
          className="fixed z-5 bottom-5 right-5 md:bottom-20 md:right-20"
        >
          รายการสถานที่ที่เลือก{' '}
          {numSelectedPlaces > 0 ? <Badge color="dark">{numSelectedPlaces}</Badge> : ''}
        </Button>

        <Modal dismissible={true} show={showModal} onClose={() => setShowModal(false)}>
          <Modal.Header>สถานที่ท่องเที่ยวที่เลือก</Modal.Header>
          <Modal.Body className="space-y-2">
            {numSelectedPlaces > 0 ? (
              selectedPlace.map((place, index) => (
                <div key={index} className="flex items-center gap-2">
                  <Checkbox id="index" onChange={() => handleCheckboxChange(index)} />
                  <p>{place.name}</p>
                </div>
              ))
            ) : (
              <div>คุณยังไม่ได้เลือกสถานที่</div>
            )}
          </Modal.Body>
          <Modal.Footer>
            {numSelectedPlaces > 0 ? (
              checkboxItems.length > 0 ? (
                <Button color="failure" onClick={handleCheckboxDelete}>
                  ลบ
                </Button>
              ) : (
                <Button color="dark" onClick={() => navigate('/planner')}>
                  จัดแพลน
                </Button>
              )
            ) : (
              ''
            )}
          </Modal.Footer>
        </Modal>

        {loading ? (
          <p>กำลังโหลด...</p>
        ) : (
          <div className="h-fit bg-almond-beige">
            <div className="mt-8 grid md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
              {places.map((place) => (
                <Card className="flex" key={place.place_id}>
                  {place.photos && place.photos.length > 0 && (
                    <img
                      src={`https://maps.googleapis.com/maps/api/place/photo?maxwidth=1600&photoreference=${place.photos[0].photo_reference}&key=AIzaSyDGRFphLumw98ls5l02FfV3ppVA2nljW6o`}
                      alt={place.name}
                      className="h-40 md:h-48 w-auto object-cover"
                    />
                  )}
                  <Link to={`/places/${place.place_id}`}>{place.name}</Link>
                  <Rating>
                    <Rating.Star />
                    <p>{place.rating}</p>
                    <span className="mx-1.5 h-1 w-1 rounded-full bg-gray-500 dark:bg-gray-400" />
                    <p>{place.user_ratings_total} รีวิว</p>
                  </Rating>
                  <p>{place.formatted_address}</p>

                  {selectedPlace.find((p) => p.place_id === place.place_id) ? (
                    <Button color="light" onClick={() => handleUnselect(place)}>
                      เลือกแล้ว
                    </Button>
                  ) : (
                    <Button color="dark" onClick={() => handleSelect(place)}>
                      <PlusSmallIcon className="h-5 w-5 text-white" />
                      เลือก
                    </Button>
                  )}
                </Card>
              ))}
            </div>
          </div>
        )}
        {nextPageToken && (
          <div className="flex justify-center">
            <Button color="light" onClick={handleNextPage}>
              โหลดเพิ่ม
            </Button>
          </div>
        )}
      </div>
    </div>
  )
}

export default Search
