import axios from 'axios'
import { useState, useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'

import { Badge, Button, Rating, Spinner, Timeline } from 'flowbite-react'
import { DragDropContext, Droppable, Draggable } from 'react-beautiful-dnd'

import dayjs from 'dayjs'
import 'dayjs/locale/th'

// components
import ToastMessage from '../components/ToastMessage'

function DnDPlanner() {
  const navigate = useNavigate()

  const [tripPlan, setTripPlan] = useState([])

  const [durations, setDurations] = useState([])

  const [loading, setLoading] = useState(false)
  const [showToast, setShowToast] = useState(false)
  const [method, setMethod] = useState()

  const [itinerary, setItinerary] = useState()

  useEffect(() => {
    // Get tripPlanData from localStorage
    const tripPlanData = JSON.parse(localStorage.getItem('tripPlan'))
    if (tripPlanData) {
      setTripPlan(tripPlanData)

      if (tripPlanData.planner) {
        setItinerary(tripPlanData.planner)
        getDurations()
      } else {
        createPlanner()
      }
    }
  }, [])

  // Get durations between places from localstorage
  async function getDurations() {
    const tripPlan = JSON.parse(localStorage.getItem('tripPlan'))

    // retrieve place_id from each day
    const dayPlaceIds = {}

    for (const day in tripPlan.planner) {
      const items = tripPlan.planner[day]
      const placeIds = items.map((item) => item[0].place_id)
      dayPlaceIds[day] = placeIds
    }
    console.log(dayPlaceIds)

    const params = {
      placeIds: dayPlaceIds,
    }

    try {
      const response = await axios.get('/api/places/duration', { params })
      setDurations(response.data)
    } catch (error) {
      console.log(error)
    }
    setLoading(false)
  }

  // Create planner
  function createPlanner() {
    const tripPlanData = JSON.parse(localStorage.getItem('tripPlan'))

    const startDate = new Date(tripPlanData.startDate)
    const endDate = new Date(tripPlanData.endDate)

    const cart = tripPlanData.cart

    const diffDays = Math.ceil((endDate - startDate) / (1000 * 60 * 60 * 24)) + 1
    const itemsPerDay = Math.ceil(tripPlanData.cart.length / diffDays)

    const itinerary = {}

    // loop through each day and create an array of cart items with an empty time
    for (let i = 0; i < diffDays; i++) {
      // calculate the current day
      const currentDay = new Date(startDate.getTime() + i * 24 * 60 * 60 * 1000)
      // format the current day as "dayX"
      const dayKey = dayjs(currentDay).locale('th').add(543, 'year').format('D MMMM YYYY')
      // create an array for the cart items of the current day
      itinerary[dayKey] = []

      // loop through the cart items and add them to the result array for the current day
      for (
        let j = i * itemsPerDay;
        j < (i + 1) * itemsPerDay && j < tripPlanData.cart.length;
        j++
      ) {
        itinerary[dayKey].push([cart[j], { time: '' }])
      }
    }

    setItinerary(itinerary)
    tripPlanData.planner = itinerary
    localStorage.setItem('tripPlan', JSON.stringify(tripPlanData))

    getDurations()
  }

  function handleDelete(place) {
    // find the day that contains the place to delete
    const day = Object.keys(itinerary).find((day) => {
      return itinerary[day].find((item) => item[0].place_id === place.place_id)
    })

    // remove the place from the day
    const itineraryCopy = { ...itinerary }
    itineraryCopy[day] = itineraryCopy[day].filter((item) => {
      return item[0].place_id !== place.place_id
    })
    setItinerary(itineraryCopy)

    // remove the place from the cart
    const tripPlanData = JSON.parse(localStorage.getItem('tripPlan')) || {}
    const cartCopy = tripPlanData.cart.filter((item) => {
      return item.place_id !== place.place_id
    })
    tripPlanData.cart = cartCopy
    tripPlanData.planner = itineraryCopy
    localStorage.setItem('tripPlan', JSON.stringify(tripPlanData))

    setMethod('DEL')
    setShowToast(true)
    setTimeout(() => {
      setShowToast(false)
    }, 1000)

    getDurations()
  }

  function deletePlanner() {
    // const tripPlanData = JSON.parse(localStorage.getItem('tripPlan')) || {}
    // delete tripPlanData.planner
    // setItinerary()
    setItinerary()
    localStorage.removeItem('tripPlan')
    navigate('/')
  }

  function onDragEnd(result) {
    const tripPlanData = JSON.parse(localStorage.getItem('tripPlan')) || {}
    const { source, destination } = result

    // Check if the item was dropped outside of a droppable
    if (!destination) {
      return
    }

    // Reorder items in the same list
    if (source.droppableId === destination.droppableId) {
      const day = source.droppableId
      const itineraryCopy = { ...itinerary }
      const newItems = Array.from(itineraryCopy[day])
      const [removed] = newItems.splice(source.index, 1)
      newItems.splice(destination.index, 0, removed)
      itineraryCopy[day] = newItems
      setItinerary(itineraryCopy)

      tripPlanData.planner = itineraryCopy
      localStorage.setItem('tripPlan', JSON.stringify(tripPlanData))
    } else {
      // Move items between lists
      const sourceDay = source.droppableId
      const destinationDay = destination.droppableId
      const itineraryCopy = { ...itinerary }
      const sourceListCopy = Array.from(itineraryCopy[sourceDay])
      const destinationListCopy = Array.from(itineraryCopy[destinationDay])
      const [removed] = sourceListCopy.splice(source.index, 1)
      destinationListCopy.splice(destination.index, 0, removed)
      itineraryCopy[sourceDay] = sourceListCopy
      itineraryCopy[destinationDay] = destinationListCopy
      setItinerary(itineraryCopy)

      tripPlanData.planner = itineraryCopy
      localStorage.setItem('tripPlan', JSON.stringify(tripPlanData))
    }

    getDurations()
  }

  return (
    <div>
      {showToast && <ToastMessage method={method} />}

      <div>
        <button onClick={deletePlanner}>ลบแพลน</button>
      </div>

      <br />

      {itinerary ? (
        <DragDropContext onDragEnd={onDragEnd}>
          {Object.keys(itinerary).map((day, index) => (
            <Droppable key={day} droppableId={day}>
              {(provided) => (
                <div ref={provided.innerRef} {...provided.droppableProps}>
                  <div className="flex m-2">
                    <Badge className="p-4 rounded-full" color="gray" size="sm">
                      {day}
                    </Badge>
                  </div>
                  <Timeline className="m-4">
                    <Timeline.Item>
                      <Timeline.Content className="space-y-2">
                        {itinerary[day].map((item, itemIndex) => (
                          <Draggable
                            key={item[0].place_id}
                            draggableId={item[0].place_id}
                            index={itemIndex}
                          >
                            {(provided) => (
                              <div
                                ref={provided.innerRef}
                                {...provided.draggableProps}
                                {...provided.dragHandleProps}
                              >
                                <Timeline.Point />
                                <Timeline.Time>
                                  {item[1].time}
                                  <input placeholder="กรุณาระบุเวลา" />
                                </Timeline.Time>
                                <>
                                  {item[0].photos && item[0].photos.length > 0 && (
                                    <img
                                      src={`https://maps.googleapis.com/maps/api/place/photo?maxwidth=1600&photoreference=${item[0].photos[0].photo_reference}&key=AIzaSyDGRFphLumw98ls5l02FfV3ppVA2nljW6o`}
                                      alt={item[0].name}
                                      className="h-28 md:h-60 w-auto object-cover"
                                    />
                                  )}
                                </>
                                <Timeline.Title>
                                  <Link to={`/places/${item[0].place_id}`}>{item[0].name}</Link>
                                </Timeline.Title>
                                <Timeline.Body>
                                  <Rating>
                                    <Rating.Star />
                                    <p>{item[0].rating}</p>
                                  </Rating>
                                </Timeline.Body>
                                <Button
                                  size="xs"
                                  color="dark"
                                  onClick={() => handleDelete(item[0])}
                                >
                                  ลบ
                                </Button>
                                {durations[day] && durations[day][itemIndex] && (
                                  <div>
                                    ระยะเวลา: {durations[day][itemIndex].durationInMins}
                                    <br />
                                    ระยะทาง: {durations[day][itemIndex].distanceInKiloMeters} km
                                  </div>
                                )}
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
          ))}
        </DragDropContext>
      ) : (
        'ยังไม่ได้สร้างแพลนเนอร์'
      )}
    </div>
  )
}

export default DnDPlanner
