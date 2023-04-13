import axios from 'axios'
import { useState, useEffect, useRef } from 'react'
import { Link, useNavigate } from 'react-router-dom'

import html2canvas from 'html2canvas'

import { Badge, Button, Rating, Timeline } from 'flowbite-react'
import { DragDropContext, Droppable, Draggable } from 'react-beautiful-dnd'

import { ArrowLongLeftIcon } from '@heroicons/react/24/outline'

import dayjs from 'dayjs'
import 'dayjs/locale/th'

// components
import ToastMessage from './ToastMessage'
import AlertMessage from './AlertMessage'

function DnDPlanner() {
  const navigate = useNavigate()

  const [tripPlan, setTripPlan] = useState([])

  const [durations, setDurations] = useState([])

  const [showToast, setShowToast] = useState(false)
  const [method, setMethod] = useState()
  const [showAlert, setShowAlert] = useState(false)

  const [itinerary, setItinerary] = useState()
  const [time, setTime] = useState()

  const divRef = useRef()

  useEffect(() => {
    // Get tripPlanData from localStorage
    const tripPlanData = JSON.parse(localStorage.getItem('tripPlan'))
    if (tripPlanData) {
      setTripPlan(tripPlanData)

      if (tripPlanData.cart) {
        if (tripPlanData.planner) {
          setItinerary(tripPlanData.planner)
          getDurations()
        } else {
          createPlanner()
        }
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

  function handlePlaceTime(place) {
    const tripPlan = JSON.parse(localStorage.getItem('tripPlan'))

    // Validate the format of the new time using regex
    const regex = /^(0?[0-9]|1[0-9]|2[0-3])\.([0-5][0-9])$/
    if (!regex.test(time)) {
      // Show an error message and return early if the format is incorrect
      setShowAlert(true)
      setTimeout(() => {
        setShowAlert(false)
      }, 1000)
      return
    }

    if (time)
      for (const day in tripPlan.planner) {
        for (const item of tripPlan.planner[day]) {
          if (item[0].place_id === place.place_id) {
            item[1].time = time
            console.log('Found place:', place.place_id, 'in day:', day)
            localStorage.setItem('tripPlan', JSON.stringify(tripPlan))
            console.log('Updated time:', time, 'in local storage')
            return
          }
        }
      }
  }

  function handleDownload() {
    const div = divRef.current

    div.style.display = 'block'

    html2canvas(div, {
      allowTaint: true,
      useCORS: true,
    }).then(function (canvas) {
      const link = document.createElement('a')
      link.download = 'planner.png'
      link.href = canvas.toDataURL()
      link.click()
    })

    div.style.display = 'none'
  }

  return (
    <div>
      {showToast && <ToastMessage method={method} />}
      {showAlert && (
        <AlertMessage
          message="รูปแบบไม่ถูกต้อง กรุณากรอกเวลาในรูปแบบ HH.MM (เช่น 09.30)"
          color="failure"
        />
      )}

      {tripPlan.length !== 0 ? (
        tripPlan.cart ? (
          itinerary ? (
            <div>
              <Button color="dark" size="sm" onClick={deletePlanner}>
                ลบแพลน
              </Button>
              <Button color="dark" size="sm" onClick={handleDownload}>
                ดาวน์โหลดแพลน
              </Button>
            </div>
          ) : (
            <div>
              <span>กรุณากรอกจำนวนผู้เดินทาง วันออกเดินทาง และวันเดินทางกลับก่อนจัดแพลนเนอร์</span>
              <Button color="dark" onClick={() => navigate('/')}>
                <ArrowLongLeftIcon className="h-5 w-5 text-white" />
                ไปกรอกข้อมูล
              </Button>
            </div>
          )
        ) : (
          <div>
            <span>
              โอ๊ะโอ คุณยังไม่ได้เลือกสถานที่ <br /> กรุณาเลือกสถานที่ก่อนจัดแพลนเนอร์
            </span>
            <Button color="dark" onClick={() => navigate('/search')}>
              <ArrowLongLeftIcon className="h-5 w-5 text-white" />
              ไปเลือกสถานที่
            </Button>
          </div>
        )
      ) : (
        <div>
          <span>โปรดป้อนข้อมูลและเลือกสถานที่ก่อนจัดแพลนเนอร์</span>
          <Button color="dark" onClick={() => navigate('/')}>
            <ArrowLongLeftIcon className="h-5 w-5 text-white" />
            ไปกรอกข้อมูล
          </Button>
        </div>
      )}

      <br />

      <div>
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
                                    <div className="my-2">
                                      {item[1].time === '' ? (
                                        <input
                                          placeholder="กรุณาระบุเวลา"
                                          defaultValue={item[1].time}
                                          onBlur={() => handlePlaceTime(item[0])}
                                          onChange={(event) => setTime(event.target.value)}
                                        />
                                      ) : (
                                        <input
                                          defaultValue={item[1].time}
                                          onBlur={() => handlePlaceTime(item[0])}
                                          onChange={(event) => setTime(event.target.value)}
                                        />
                                      )}
                                    </div>
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
          ''
        )}
      </div>

      <div ref={divRef} style={{ display: 'none' }} className="p-4">
        {itinerary
          ? Object.keys(itinerary).map((day, index) => (
              <div className="flex flex-col">
                <div className="flex m-2">
                  <Badge className="p-4 rounded-full" color="gray" size="sm">
                    <p className="inline-block align-middle">{day}</p>
                  </Badge>
                </div>
                <Timeline className="m-4">
                  <Timeline.Item>
                    <Timeline.Content className="space-y-4">
                      {itinerary[day].map((item, itemIndex) => (
                        <div className="space-y-2">
                          <Timeline.Point />
                          <Timeline.Time>
                            <div className="">
                              {item[1].time === '' ? (
                                <input
                                  placeholder="กรุณาระบุเวลา"
                                  defaultValue={item[1].time}
                                  onBlur={() => handlePlaceTime(item[0])}
                                  onChange={(event) => setTime(event.target.value)}
                                />
                              ) : (
                                <input
                                  defaultValue={item[1].time}
                                  onBlur={() => handlePlaceTime(item[0])}
                                  onChange={(event) => setTime(event.target.value)}
                                />
                              )}
                            </div>
                          </Timeline.Time>
                          <br />
                          <Timeline.Title>
                            <p>{item[0].name}</p>
                          </Timeline.Title>
                          <Timeline.Body className="space-y-2">
                            <Badge className="p-4 w-fit rounded-full" color="success" size="sm">
                              {item[0].types[0]}
                            </Badge>
                            <Rating>
                              <Rating.Star />
                              <p>{item[0].rating}</p>
                            </Rating>
                          </Timeline.Body>
                          {durations[day] && durations[day][itemIndex] && (
                            <div className="flex">
                              ระยะเวลา: {durations[day][itemIndex].durationInMins}
                              ระยะทาง: {durations[day][itemIndex].distanceInKiloMeters} กม.
                            </div>
                          )}
                        </div>
                      ))}
                    </Timeline.Content>
                  </Timeline.Item>
                </Timeline>
              </div>
            ))
          : ''}
      </div>
    </div>
  )
}

export default DnDPlanner
