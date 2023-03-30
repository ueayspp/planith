import axios from 'axios'
import { useState, useEffect, useContext } from 'react'
import { useNavigate } from 'react-router-dom'

import { UserContext } from '../contexts/UserContext'

import { Badge, Button, Checkbox, Modal, TextInput } from 'flowbite-react'

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
    const selectedPlaceData = JSON.parse(localStorage.getItem('selectedPlace')) || []
    if (Array.isArray(selectedPlaceData.cart)) {
      setSelectedPlace(selectedPlaceData.cart)
      setNumSelectedPlaces(selectedPlaceData.cart.length)
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
  // store selectedPlace to localStorage
  function handleSelect(place) {
    const selectedPlaceData = JSON.parse(localStorage.getItem('selectedPlace')) || {
      cart: [],
      currentUser: '',
    }
    const updatedSelectedPlace = [...selectedPlaceData.cart, place]
    const updatedSelectedPlaceData = { cart: updatedSelectedPlace, currentUser: '' }

    setSelectedPlace(updatedSelectedPlace)
    setNumSelectedPlaces(updatedSelectedPlace.length)
    localStorage.setItem('selectedPlace', JSON.stringify(updatedSelectedPlaceData))
  }

  // Select place to delete using checkbox
  function handleCheckboxChange(index) {
    const isChecked = checkboxItems.includes(index)
    const newCheckboxItems = isChecked
      ? checkboxItems.filter((item) => item !== index)
      : [...checkboxItems, index]

    setCheckboxItems(newCheckboxItems)
  }

  // Delete place
  function handleDelete(place, index) {
    const updatedSelectedPlace = selectedPlace.filter((place, index) => {
      return !checkboxItems.includes(index)
    })

    const updatedCheckboxItems = checkboxItems.filter((item) => item !== index)
    const updatedSelectedPlaceData = { cart: updatedSelectedPlace, currentUser: '' }

    setSelectedPlace(updatedSelectedPlace)
    setNumSelectedPlaces(updatedSelectedPlace.length)
    localStorage.setItem('selectedPlace', JSON.stringify(updatedSelectedPlaceData))

    setCheckboxItems(updatedCheckboxItems)
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
        <Button type="submit">ค้นหา</Button>
      </form>

      <Button onClick={() => setShowModal(true)}>
        เลือก {numSelectedPlaces > 0 ? <Badge>{numSelectedPlaces}</Badge> : ''}
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
              <Button color="failure" onClick={handleDelete}>
                ลบ
              </Button>
            ) : (
              <Button onClick={() => navigate('/planner')}>จัดแพลน</Button>
            )
          ) : (
            ''
          )}
        </Modal.Footer>
      </Modal>

      {loading ? (
        <p>กำลังโหลด...</p>
      ) : (
        <>
          {places.map((place) => (
            <div key={place.place_id}>
              <p>{place.name}</p>
              <p>{place.formatted_address}</p>
              <Button onClick={() => handleSelect(place)}>เลือก</Button>
            </div>
          ))}
        </>
      )}
      {nextPageToken && <button onClick={handleNextPage}>โหลดเพิ่ม</button>}
    </div>
  )
}

export default Search
