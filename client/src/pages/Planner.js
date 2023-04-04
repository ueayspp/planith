import axios from 'axios'
import { useEffect, useState, useContext } from 'react'
import { Link } from 'react-router-dom'

import { UserContext } from '../contexts/UserContext'

import { Button, Spinner, Timeline } from 'flowbite-react'

import dayjs from 'dayjs'
import 'dayjs/locale/th'

function Planner() {
  const [selectedPlace, setSelectedPlace] = useState([])
  const [durations, setDurations] = useState([])

  const { userData } = useContext(UserContext)

  const [loading, setLoading] = useState(false)

  useEffect(() => {
    // get selectedPlaceData from localStorage
    const selectedPlaceData = JSON.parse(localStorage.getItem('selectedPlace'))
    if (selectedPlaceData) {
      setSelectedPlace(selectedPlaceData.cart.map((item) => item)) // store selectedPlace all data
    }
  }, [])

  // useEffect(() => {
  //   // call getDurations() only after the selectedPlace state is updated
  //   getDurations()
  // }, [selectedPlace])

  // delete place
  async function handleDelete(place, index) {
    const deletedPlace = [...selectedPlace]
    deletedPlace.splice(index, 1)
    setSelectedPlace(deletedPlace)
    // update array to localstorage
    const updatedSelectedPlaceData = { cart: deletedPlace, currentUser: '' }
    localStorage.setItem('selectedPlace', JSON.stringify(updatedSelectedPlaceData))
  }

  // get durations between places from localstorage
  async function getDurations() {
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
      <div>
        <p>{userData.guest} คน</p>
        <p>
          {userData.start &&
            dayjs(userData.start).locale('th').add(543, 'year').format('D MMMM YYYY')}
          &nbsp;-&nbsp;
          {userData.end && dayjs(userData.end).locale('th').add(543, 'year').format('D MMMM YYYY')}
        </p>
        <p>{userData.diff} วัน</p>
      </div>
      <button onClick={getDurations}>คำนวณระยะเวลาและระยะทาง</button>
      {loading ? (
        <Spinner />
      ) : (
        <Timeline className="m-8">
          <Timeline.Item>
            <Timeline.Content className="space-y-12">
              {selectedPlace.map((place, index) => (
                <div key={index}>
                  <Timeline.Point />
                  <Timeline.Time>
                    <input placeholder="กรุณาระบุเวลา" />
                  </Timeline.Time>
                  <Timeline.Title>
                    <Link to={`/places/${place.place_id}`}>{place.name}</Link>
                  </Timeline.Title>
                  <Timeline.Body>{place.formatted_address}</Timeline.Body>
                  <Button size="xs" color="dark" onClick={() => handleDelete(place, index)}>
                    ลบ
                  </Button>
                  <p className="my-8">
                    {durations.length > index && durations[index].durationInMins
                      ? `${durations[index].durationInMins} --- ${durations[index].distanceInKiloMeters} กิโลเมตร`
                      : ''}
                  </p>
                </div>
              ))}
            </Timeline.Content>
          </Timeline.Item>
        </Timeline>
      )}
    </div>
  )
}

export default Planner
