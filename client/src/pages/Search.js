import axios from 'axios'
import { useState, useEffect, useContext } from 'react'
import { Link, useNavigate } from 'react-router-dom'

import { UserContext } from '../contexts/UserContext'

import { Badge, Button, Card, Checkbox, Modal, Rating, TextInput } from 'flowbite-react'

function Search() {
  const navigate = useNavigate()

  const [showModal, setShowModal] = useState(false)

  const { userData } = useContext(UserContext)

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
    setLoading(true)
    event.preventDefault()

    const params = {
      input: query,
    }

    try {
      const response = await axios.get('/api/places/', { params })
      setPlaces(response.data.results)
      setNextPageToken(response.data.nextPageToken)
      setLoading(false)
    } catch (error) {
      console.log(error)
      setLoading(false)
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
      const response = await axios.get('/api/places/', { params })
      setPlaces([...places, ...response.data.results])
      setNextPageToken(response.data.nextPageToken)
      setLoading(false)
    } catch (error) {
      console.log(error)
      setLoading(false)
    }
  }

  // Select Place
  // Store selectedPlace to localStorage
  function handleSelect(place) {
    const tripPlanData = JSON.parse(localStorage.getItem('tripPlan')) || {}

    // Initialize tripPlanData.cart to an empty array if it is not defined
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

  // Unselect Place
  function handleUnselect(place) {
    const tripPlanData = JSON.parse(localStorage.getItem('tripPlan')) || {}

    // Remove the selected place from the cart
    const updatedSelectedPlace = tripPlanData.cart.filter((p) => p.place_id !== place.place_id)

    // Update the selected place data
    tripPlanData.cart = updatedSelectedPlace

    // Update state and localStorage
    setSelectedPlace(updatedSelectedPlace)
    setNumSelectedPlaces(updatedSelectedPlace.length)
    localStorage.setItem('tripPlan', JSON.stringify(tripPlanData))
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

    const updatedSelectedPlace = selectedPlace.filter((place, index) => {
      return !checkboxItems.includes(index)
    })

    const updatedCheckboxItems = checkboxItems.filter(
      (item) => item !== index && item < updatedSelectedPlace.length
    )

    // Update the selected place data
    tripPlanData.cart = updatedSelectedPlace

    // Update state and localStorage
    setCheckboxItems(updatedCheckboxItems)
    setSelectedPlace(updatedSelectedPlace)
    setNumSelectedPlaces(updatedSelectedPlace.length)
    localStorage.setItem('tripPlan', JSON.stringify(tripPlanData))
  }

  return (
    <div>
      <form onSubmit={handleSearch}>
        <label htmlFor="query">ค้นหาสถานที่</label>
        <br />
        <TextInput
          type="text"
          id="query"
          value={query}
          onChange={(event) => setQuery(event.target.value)}
          required
        />
        <Button color="dark" type="submit">
          ค้นหา
        </Button>
      </form>

      <Button color="light" onClick={() => setShowModal(true)}>
        เลือก {numSelectedPlaces > 0 ? <Badge color="dark">{numSelectedPlaces}</Badge> : ''}
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
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
          {places.map((place) => (
            <Card className="flex" key={place.place_id}>
              {place.photos && place.photos.length > 0 && (
                <img
                  src={`https://maps.googleapis.com/maps/api/place/photo?maxwidth=1600&photoreference=${place.photos[0].photo_reference}&key=AIzaSyDGRFphLumw98ls5l02FfV3ppVA2nljW6o`}
                  alt={place.name}
                  className="h-48 md:h-60 w-auto object-cover"
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
                  เลือก
                </Button>
              )}
            </Card>
          ))}
        </div>
      )}
      {nextPageToken && (
        <Button color="light" onClick={handleNextPage}>
          โหลดเพิ่ม
        </Button>
      )}
    </div>
  )
}

export default Search
