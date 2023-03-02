// import axios from 'axios'
import { useState } from 'react'

function Search() {
  const [query, setQuery] = useState('')
  const [places, setPlaces] = useState([])

  async function handleSearch(event) {
    event.preventDefault()
    try {
      const response = await fetch(`/api/places/${query}`)
      const data = await response.json()
      setPlaces(data)
    } catch (error) {
      console.log(error)
    }
  }

  return (
    <div>
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

      <ul>
        {places.map((place) => (
          <li key={place.place_id}>{place.name}</li>
        ))}
      </ul>
    </div>
  )
}

export default Search
