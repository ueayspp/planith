import axios from 'axios'
import { useEffect, useState } from 'react'

function Planner() {
  const [selectedPlace, setSelectedPlace] = useState([])
  const [durations, setDurations] = useState([])

  const [origin, setOrigin] = useState('')
  const [destination, setDestination] = useState('')
  const [duration, setDuration] = useState('')
  const [distance, setDistance] = useState('')

  const [placeNames, setPlaceNames] = useState([])

  useEffect(() => {
    // get selectedPlaceData from localStorage
    const selectedPlaceData = JSON.parse(localStorage.getItem('selectedPlace'))
    if (selectedPlaceData) {
      setSelectedPlace(selectedPlaceData.cart.map((item) => item)) // store all selectedPlace data
      setPlaceNames(selectedPlaceData.cart.map((item) => item.name)) // store selectedPlace name
    }
  }, [])

  async function handleCalculate(event) {
    event.preventDefault()

    const params = {
      origin: origin,
      destination: destination,
    }

    try {
      const response = await axios.get('/api/places/time', { params })
      setDuration(response.data.durationInMins)
      setDistance(response.data.distanceInKiloMeters)
    } catch (error) {
      console.log(error)
    }
  }

  // get durations between places from localstorage
  async function getDurations() {
    const params = {
      placeNames,
    }

    try {
      const response = await axios.get('/api/places/duration', { params })
      setDurations(response.data)
    } catch (error) {
      console.log(error)
    }
  }

  return (
    <div>
      <h1>แพลนเนอร์</h1>
      {selectedPlace.map((item, index) => (
        <div key={index}>
          <p>{item.name}</p>
        </div>
      ))}

      <h2>คำนวณระยะเวลา</h2>
      <form onSubmit={handleCalculate}>
        <input
          type="text"
          value={origin}
          placeholder="origin"
          onChange={(event) => setOrigin(event.target.value)}
        />
        <input
          type="text"
          value={destination}
          placeholder="destination"
          onChange={(event) => setDestination(event.target.value)}
        />
        <button type="submit">คำนวณ</button>
      </form>

      {distance && (
        <p>
          {duration} &nbsp; {distance} กิโลเมตร
        </p>
      )}

      <h2>คำนวณระยะเวลา</h2>
      <button onClick={getDurations}>get durations</button>
      {durations.map((duration, index) => (
        <div key={index}>
          <p>
            From {duration.origin} to {duration.destination}: {duration.durationInMins}
          </p>
        </div>
      ))}
    </div>
  )
}

export default Planner
