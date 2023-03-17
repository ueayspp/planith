import axios from 'axios'
import { useState, useEffect } from 'react'

function Search() {
  const [query, setQuery] = useState('')
  const [places, setPlaces] = useState([])
  const [nextPageToken, setNextPageToken] = useState(null)
  const [loading, setLoading] = useState(false)

  const [selectedPlace, setSelectedPlace] = useState([])

  useEffect(() => {
    const selectedPlaceData = JSON.parse(localStorage.getItem('selectedPlace')) || []
    setSelectedPlace(selectedPlaceData.cart)
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

    // console.log('Next page token= ', nextPageToken)

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

  async function handleSelect(place) {
    const updatedSelectedPlace = [...selectedPlace, place]
    setSelectedPlace(updatedSelectedPlace)
    localStorage.setItem(
      'selectedPlace',
      JSON.stringify({ cart: updatedSelectedPlace, currentUser: 'ueay' })
    )
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
