import axios from 'axios'
import { useEffect, useState, useContext } from 'react'
import { Link } from 'react-router-dom'

import { UserContext } from '../contexts/UserContext'

import { Button, Spinner, Timeline } from 'flowbite-react'

// components
import BlankPlanner from '../components/BlankPlanner'
import ToastMessage from '../components/ToastMessage'

import dayjs from 'dayjs'
import 'dayjs/locale/th'

function Planner() {
  const [tripPlan, setTripPlan] = useState([])
  const [selectedPlace, setSelectedPlace] = useState([])
  const [durations, setDurations] = useState([])

  const [loading, setLoading] = useState(false)
  const [showToast, setShowToast] = useState(false)
  const [method, setMethod] = useState()

  useEffect(() => {
    // Get tripPlanData from localStorage
    const tripPlanData = JSON.parse(localStorage.getItem('tripPlan'))
    if (tripPlanData) {
      setTripPlan(tripPlanData)
      setSelectedPlace(tripPlanData.cart.map((item) => item)) // store selectedPlace all data
    }
  }, [])

  // Call getDurations whenever selectedPlace changes
  // useEffect(() => {
  //   if (selectedPlace.length > 0) {
  //     getDurations()
  //   }
  // }, [selectedPlace])

  // Delete place
  async function handleDelete(place, index) {
    const tripPlanData = JSON.parse(localStorage.getItem('tripPlan')) || {}

    const deletedPlace = [...selectedPlace]
    deletedPlace.splice(index, 1)

    // Update state and localStorage
    tripPlanData.cart = deletedPlace
    localStorage.setItem('tripPlan', JSON.stringify(tripPlanData))
    setSelectedPlace(deletedPlace)

    setMethod('DEL')
    setShowToast(true)
    setTimeout(() => {
      setShowToast(false)
    }, 1000)
  }

  // Get durations between places from localstorage
  async function getDurations() {
    setLoading(true)

    const placeIds = selectedPlace.map((place) => place.place_id)

    const params = {
      placeIds,
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
      {showToast && <ToastMessage method={method} />}

      <h1>แพลนเนอร์</h1>
      {tripPlan.guest && tripPlan.startDate && tripPlan.endDate ? (
        <div>
          <p>{tripPlan.guest} คน</p>
          <p>
            {tripPlan.startDate &&
              dayjs(tripPlan.startDate).locale('th').add(543, 'year').format('D MMMM YYYY')}
            &nbsp;-&nbsp;
            {tripPlan.endDate &&
              dayjs(tripPlan.endDate).locale('th').add(543, 'year').format('D MMMM YYYY')}
          </p>
        </div>
      ) : (
        ''
      )}

      {selectedPlace.length > 0 ? (
        <div>
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
      ) : (
        <div>
          <BlankPlanner />
        </div>
      )}
    </div>
  )
}

export default Planner
