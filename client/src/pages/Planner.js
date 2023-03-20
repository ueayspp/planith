import axios from 'axios'
import { useEffect, useState } from 'react'

function Planner() {
  const [selectedPlace, setSelectedPlace] = useState([])
  const [durations, setDurations] = useState([])

  const [loading, setLoading] = useState(false)

  const [origin, setOrigin] = useState('')
  const [destination, setDestination] = useState('')
  const [duration, setDuration] = useState('')
  const [distance, setDistance] = useState('')

  const [placeNames, setPlaceNames] = useState([])

  useEffect(() => {
    // get selectedPlaceData from localStorage
    const selectedPlaceData = JSON.parse(localStorage.getItem('selectedPlace'))
    if (selectedPlaceData) {
      setSelectedPlace(selectedPlaceData.cart.map((item) => item)) // store selectedPlace all data
      setPlaceNames(selectedPlaceData.cart.map((item) => item.name)) // store selectedPlace name
    }
  }, [])

  // delete place
  async function handleDelete(place, index) {
    const deletedPlace = [...selectedPlace]
    deletedPlace.splice(index, 1)
    setSelectedPlace(deletedPlace)
    // update array to localstorage
    const updatedSelectedPlaceData = { cart: deletedPlace, currentUser: 'ueay' }
    localStorage.setItem('selectedPlace', JSON.stringify(updatedSelectedPlaceData))
  }

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
    setLoading(true)

    const params = {
      placeNames,
    }

    try {
      const response = await axios.get('/api/places/duration', { params })
      setDurations(response.data)
      setLoading(false)
    } catch (error) {
      console.log(error)
    }
  }

  return (
    <div>
      <h1>แพลนเนอร์</h1>
      <h2>ตะกร้า</h2>
      {selectedPlace.map((place, index) => (
        <div key={index}>
          <p>
            {place.name} &nbsp;
            <button onClick={() => handleDelete(place, index)}>ลบ</button>
          </p>
        </div>
      ))}

      {/* <h2>คำนวณระยะเวลา</h2>
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
      </form> */}

      {/* {distance && (
        <p>
          {duration} &nbsp; {distance} กิโลเมตร
        </p>
      )} */}

      <button onClick={getDurations}>get durations</button>
      {loading ? (
        <p>กำลังโหลด...</p>
      ) : (
        <>
          {durations.map((duration, index) => (
            <div key={index}>
              <p>{duration.durationInMins}</p>
            </div>
          ))}
          {/* <p>{durations[durations.length - 1].destination}</p> */}
        </>
      )}
    </div>
  )
}

export default Planner
