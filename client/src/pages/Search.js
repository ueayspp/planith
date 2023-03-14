import axios from 'axios'
import { useState } from 'react'

function Search() {
  const [query, setQuery] = useState('')
  const [places, setPlaces] = useState([])
  const [loading, setLoading] = useState(false)

  // Search Places
  async function handleSearch(event) {
    setLoading(true)
    event.preventDefault()

    try {
      const response = await axios.get(`/api/places/${query}`)
      setPlaces(response.data)
      setLoading(false)
    } catch (error) {
      console.log(error)
      setLoading(false)
    }
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
            </div>
          ))}
        </>
      )}
    </div>
  )
}

export default Search
