import axios from 'axios'
import { useState, useEffect } from 'react'

function Search() {
  // search place
  const [query, setQuery] = useState('')
  const [places, setPlaces] = useState([])
  const [nextPageToken, setNextPageToken] = useState(null)

  // loading state
  const [loading, setLoading] = useState(false)

  // selected place
  const [selectedPlace, setSelectedPlace] = useState([])
  const [numSelectedPlaces, setNumSelectedPlaces] = useState()

  useEffect(() => {
    const selectedPlaceData = JSON.parse(localStorage.getItem('selectedPlace')) || []
    if (Array.isArray(selectedPlaceData)) {
      setSelectedPlace(selectedPlaceData.cart)
    }

    setNumSelectedPlaces(selectedPlaceData.cart.length)
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
    // retrieve the existing selectedPlace array from localStorage
    // if there's none, default empty array and initialize it
    const selectedPlaceData = JSON.parse(localStorage.getItem('selectedPlace')) || {
      cart: [],
      currentUser: 'ueay',
    }
    // append the new place to it
    const updatedSelectedPlace = [...selectedPlaceData.cart, place]
    // create a new updatedSelectedPlaceData object that contains the updated selectedPlace array
    const updatedSelectedPlaceData = { cart: updatedSelectedPlace, currentUser: 'ueay' }

    setSelectedPlace(updatedSelectedPlace)
    localStorage.setItem('selectedPlace', JSON.stringify(updatedSelectedPlaceData))
  }

  return (
    <div>
      <h1>ค้นหาสถานที่</h1>
      <form onSubmit={handleSearch}>
        <label htmlFor="query">Text Search</label>
        <br />
        <input
          type="text"
          id="query"
          value={query}
          onChange={(event) => setQuery(event.target.value)}
        />
        <button type="submit">ค้นหา</button>
      </form>
      <p>{numSelectedPlaces}</p>

      {loading ? (
        <p>กำลังโหลด...</p>
      ) : (
        <>
          {places.map((place) => (
            <div key={place.place_id}>
              <p>{place.name}</p>
              <p>{place.formatted_address}</p>
              <button onClick={() => handleSelect(place)}>เลือก</button>
            </div>
          ))}
        </>
      )}
      {nextPageToken && <button onClick={handleNextPage}>โหลดเพิ่ม</button>}
    </div>
  )
}

export default Search
