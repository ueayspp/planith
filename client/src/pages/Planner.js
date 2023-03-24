import axios from 'axios'
import { useEffect, useState } from 'react'

function Planner() {
  const [selectedPlace, setSelectedPlace] = useState([])
  const [durations, setDurations] = useState([])

  const [loading, setLoading] = useState(false)

  useEffect(() => {
    // get selectedPlaceData from localStorage
    const selectedPlaceData = JSON.parse(localStorage.getItem('selectedPlace'))
    if (selectedPlaceData) {
      setSelectedPlace(selectedPlaceData.cart.map((item) => item)) // store selectedPlace all data
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

  // get durations between places from localstorage
  async function getDurations(event) {
    event.preventDefault()
    setLoading(true)

    const placeNames = selectedPlace.map((place) => place.name)

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
      {/* {selectedPlace.map((place, index) => (
        <div key={index}>
          <p>
            {place.name} &nbsp;
            <button onClick={() => handleDelete(place, index)}>ลบ</button>
          </p>
        </div>
      ))} */}

      <button onClick={getDurations}>get durations</button>
      {loading ? (
        <p>กำลังโหลด...</p>
      ) : (
        <>
          {selectedPlace.map((place, index) => (
            <div key={index}>
              <p>
                {place.name}
                <button onClick={() => handleDelete(place, index)}>ลบ</button>
              </p>
            </div>
          ))}
          {durations.map((duration, index) => (
            <div key={index}>
              <p>
                {duration.durationInMins} &nbsp;
                {duration.distanceInKiloMeters} กิโลเมตร
              </p>
            </div>
          ))}
        </>
      )}
    </div>
  )
}

export default Planner
