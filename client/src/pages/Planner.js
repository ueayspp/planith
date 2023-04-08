import axios from 'axios'
import { useEffect, useState, useContext } from 'react'
import { Link } from 'react-router-dom'

import { UserContext } from '../contexts/UserContext'

import { TruckIcon } from '@heroicons/react/24/outline'
import { Button, Rating, Spinner, Timeline } from 'flowbite-react'
import { DragDropContext, Droppable, Draggable } from 'react-beautiful-dnd'

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

  function onDragEnd(result) {
    const tripPlanData = JSON.parse(localStorage.getItem('tripPlan')) || {}

    if (!result.destination) {
      return
    }

    const newItems = Array.from(selectedPlace)
    const [reorderedItem] = newItems.splice(result.source.index, 1)
    newItems.splice(result.destination.index, 0, reorderedItem)

    tripPlanData.cart = newItems
    setSelectedPlace(newItems)
    localStorage.setItem('tripPlan', JSON.stringify(tripPlanData))
  }

  return (
    <div>
      {showToast && <ToastMessage method={method} />}

      <h1>แพลนเนอร์</h1>
      {tripPlan.guest && tripPlan.startDate && tripPlan.endDate ? (
        <div>
          {tripPlan.startDate === tripPlan.endDate ? (
            <span>
              {tripPlan.startDate &&
                dayjs(tripPlan.startDate).locale('th').add(543, 'year').format('D MMMM YYYY')}
            </span>
          ) : (
            <span>
              {tripPlan.startDate &&
                dayjs(tripPlan.startDate).locale('th').add(543, 'year').format('D MMMM YYYY')}
              &nbsp;-&nbsp;
              {tripPlan.endDate &&
                dayjs(tripPlan.endDate).locale('th').add(543, 'year').format('D MMMM YYYY')}
            </span>
          )}
          <p>{tripPlan.guest} คน</p>
        </div>
      ) : (
        ''
      )}

      {selectedPlace.length > 0 ? (
        <div>
          {loading ? (
            <Spinner />
          ) : (
            <div>
              <DragDropContext onDragEnd={onDragEnd}>
                <Droppable droppableId="places">
                  {(provided) => (
                    <div {...provided.droppableProps} ref={provided.innerRef}>
                      <Timeline className="m-4">
                        <Timeline.Item>
                          <Timeline.Content className="space-y-8">
                            {selectedPlace.map((place, index) => (
                              <Draggable
                                key={place.place_id}
                                draggableId={place.place_id}
                                index={index}
                              >
                                {(provided) => (
                                  <div
                                    {...provided.draggableProps}
                                    {...provided.dragHandleProps}
                                    ref={provided.innerRef}
                                  >
                                    <Timeline.Point />
                                    <Timeline.Time>
                                      <input placeholder="กรุณาระบุวันและเวลา" />
                                    </Timeline.Time>
                                    <>
                                      {place.photos && place.photos.length > 0 && (
                                        <img
                                          src={`https://maps.googleapis.com/maps/api/place/photo?maxwidth=1600&photoreference=${place.photos[0].photo_reference}&key=AIzaSyDGRFphLumw98ls5l02FfV3ppVA2nljW6o`}
                                          alt={place.name}
                                          className="h-28 md:h-60 w-auto object-cover"
                                        />
                                      )}
                                    </>
                                    <Timeline.Title>
                                      <Link to={`/places/${place.place_id}`}>{place.name}</Link>
                                    </Timeline.Title>
                                    <Timeline.Body>
                                      <Rating>
                                        <Rating.Star />
                                        <p>{place.rating}</p>
                                      </Rating>
                                    </Timeline.Body>
                                    <Button
                                      size="xs"
                                      color="dark"
                                      onClick={() => handleDelete(place, index)}
                                    >
                                      ลบ
                                    </Button>
                                    <div className="my-4">
                                      {durations.length > index &&
                                      durations[index].durationInMins ? (
                                        <p className="flex gap-2">
                                          <TruckIcon className="h-6 w-6 text-gray-500" />
                                          <span>{durations[index].durationInMins}</span>
                                          <span>
                                            ~ {durations[index].distanceInKiloMeters} กิโลเมตร
                                          </span>
                                        </p>
                                      ) : (
                                        ''
                                      )}
                                    </div>
                                  </div>
                                )}
                              </Draggable>
                            ))}
                            {provided.placeholder}
                          </Timeline.Content>
                        </Timeline.Item>
                      </Timeline>
                    </div>
                  )}
                </Droppable>
              </DragDropContext>
            </div>
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
