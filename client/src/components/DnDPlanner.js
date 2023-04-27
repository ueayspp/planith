import axios from 'axios'
import { useState, useEffect, useRef } from 'react'
import { Link, useNavigate } from 'react-router-dom'

import { toPng } from 'html-to-image'

import { Badge, Button, Rating, Timeline } from 'flowbite-react'
import { DragDropContext, Droppable, Draggable } from 'react-beautiful-dnd'

import { ArrowLongLeftIcon, TruckIcon } from '@heroicons/react/24/outline'

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

  // Define a function to calculate the distance between two points using the Haversine formula
  function distance(lat1, lon1, lat2, lon2) {
    const R = 6371 // Earth's radius in kilometers
    const dLat = toRadians(lat2 - lat1)
    const dLon = toRadians(lon2 - lon1)
    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(toRadians(lat1)) *
        Math.cos(toRadians(lat2)) *
        Math.sin(dLon / 2) *
        Math.sin(dLon / 2)
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))
    return R * c // Distance in kilometers
  }

  // Define a function to convert degrees to radians
  function toRadians(degrees) {
    return (degrees * Math.PI) / 180
  }

  // Create planner
  function createPlanner() {
    const tripPlanData = JSON.parse(localStorage.getItem('tripPlan'))

    const startDate = new Date(tripPlanData.startDate)
    const endDate = new Date(tripPlanData.endDate)

    const cart = tripPlanData.cart

    const diffDays = Math.ceil((endDate - startDate) / (1000 * 60 * 60 * 24)) + 1

    function groupPlacesByKMeans(places, k) {
      const seedrandom = require('seedrandom')
      // Initialize the random number generator with a seed
      const rng = seedrandom(3)

      // Extract the coordinates of each place
      const coords = places.map((place) => [
        place.geometry.location.lat,
        place.geometry.location.lng,
      ])

      // Initialize the centroids randomly
      const centroids = []
      for (let i = 0; i < k; i++) {
        const randIndex = Math.floor(rng() * coords.length)
        centroids.push(coords[randIndex])
      }

      // Assign each point to its closest centroid
      const clusters = Array.from({ length: k }, () => [])
      coords.forEach((coord) => {
        let minDist = Infinity
        let closestCentroidIndex = null

        centroids.forEach((centroid, index) => {
          const dist = distance(coord[0], coord[1], centroid[0], centroid[1])
          if (dist < minDist) {
            minDist = dist
            closestCentroidIndex = index
          }
        })

        clusters[closestCentroidIndex].push(coord)
      })

      // Recalculate the centroids based on the mean of each cluster
      let converged = false
      while (!converged) {
        const newCentroids = []
        clusters.forEach((cluster) => {
          const meanCoord = cluster.reduce(
            (acc, coord) => [acc[0] + coord[0], acc[1] + coord[1]],
            [0, 0]
          )
          meanCoord[0] /= cluster.length
          meanCoord[1] /= cluster.length
          newCentroids.push(meanCoord)
        })

        // Check if the centroids have converged
        converged = true
        for (let i = 0; i < k; i++) {
          if (
            distance(centroids[i][0], centroids[i][1], newCentroids[i][0], newCentroids[i][1]) >
            0.0001
          ) {
            converged = false
            break
          }
        }

        // Update the centroids and clusters
        centroids.splice(0, centroids.length, ...newCentroids)
        clusters.splice(0, clusters.length, ...Array.from({ length: k }, () => []))
        coords.forEach((coord) => {
          let minDist = Infinity
          let closestCentroidIndex = null

          centroids.forEach((centroid, index) => {
            const dist = distance(coord[0], coord[1], centroid[0], centroid[1])
            if (dist < minDist) {
              minDist = dist
              closestCentroidIndex = index
            }
          })

          clusters[closestCentroidIndex].push(coord)
        })
      }

      // Convert the clusters back to place objects
      const result = clusters.map((cluster) =>
        cluster.map((coord) => {
          const place = places.find(
            (p) => p.geometry.location.lat === coord[0] && p.geometry.location.lng === coord[1]
          )
          return [place, { time: '' }]
        })
      )

      return result
    }

    const k = diffDays
    const clusters = groupPlacesByKMeans(cart, k)
    console.log('clusters', clusters) // Output: [ [ Place 1, Place 3 ], [ Place 2 ], [ Place 4 ] ]

    const itinerary = {}

    for (let date = new Date(startDate); date <= endDate; date.setDate(date.getDate() + 1)) {
      const dateString = dayjs(date).locale('th').add(543, 'year').format('D MMMM YYYY')
      itinerary[dateString] = []
    }

    for (let i = 0; i < clusters.length; i++) {
      const dateString = dayjs(startDate)
        .add(i, 'day')
        .locale('th')
        .add(543, 'year')
        .format('D MMMM YYYY')
      itinerary[dateString].push(...clusters[i])
    }

    console.log(itinerary)

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

    toPng(div)
      .then(function (dataUrl) {
        var link = document.createElement('a')
        link.download = 'planner.png'
        link.href = dataUrl
        link.click()
      })
      .catch(function (error) {
        console.error('Error:', error)
      })

    div.style.visibility = 'visible'

    setTimeout(function () {
      div.style.visibility = 'hidden' // hide the div after a certain amount of time
    }, 2000)
  }

  return (
    <div className="flex flex-col justify-center">
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
            <div className="flex mb-4 justify-between md:justify-between lg:justify-end gap-4">
              <Button color="dark" size="sm" onClick={handleDownload}>
                ดาวน์โหลดแพลน
              </Button>
              <Button color="failure" size="sm" onClick={deletePlanner}>
                ลบแพลน
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

      <div className="flex flex-col w-fit">
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
                    <Timeline>
                      <Timeline.Item>
                        <Timeline.Content className="space-y-4">
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
                                  className="space-y-4"
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
                                  <div className="py-2">
                                    {item[0].photos && item[0].photos.length > 0 && (
                                      <img
                                        src={`https://maps.googleapis.com/maps/api/place/photo?maxwidth=1600&photoreference=${item[0].photos[0].photo_reference}&key=AIzaSyDGRFphLumw98ls5l02FfV3ppVA2nljW6o`}
                                        alt={item[0].name}
                                        className="h-28 w-72 md:h-60 object-cover rounded-xl"
                                      />
                                    )}
                                  </div>
                                  <Timeline.Title>
                                    <Link to={`/places/${item[0].place_id}`}>{item[0].name}</Link>
                                  </Timeline.Title>
                                  <Timeline.Body>
                                    <Badge
                                      className="p-4 w-fit rounded-full"
                                      color="success"
                                      size="sm"
                                    >
                                      {item[0].types[0]}
                                    </Badge>
                                    <Rating>
                                      <Rating.Star />
                                      <p className="py-2">{item[0].rating}</p>
                                    </Rating>
                                    <div className="w-72 py-2">
                                      {' '}
                                      <p>{item[0].formatted_address}</p>
                                    </div>
                                  </Timeline.Body>
                                  <Button
                                    size="xs"
                                    color="dark"
                                    onClick={() => handleDelete(item[0])}
                                  >
                                    ลบ
                                  </Button>
                                  {durations[day] && durations[day][itemIndex] && (
                                    <div className="flex gap-2">
                                      <TruckIcon className="h-6 w-6 text-gray-500" />
                                      <p>{durations[day][itemIndex].durationInMins}</p>
                                      <p> {durations[day][itemIndex].distanceInKiloMeters} กม.</p>
                                    </div>
                                  )}
                                  <br />
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

      <div ref={divRef} style={{ visibility: 'hidden', backgroundColor: 'white' }} className="p-4">
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
                                  className="w-full h-full"
                                />
                              ) : (
                                <input
                                  defaultValue={item[1].time}
                                  onBlur={() => handlePlaceTime(item[0])}
                                  onChange={(event) => setTime(event.target.value)}
                                  className="w-full h-full"
                                />
                              )}
                            </div>
                          </Timeline.Time>
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
                            <div className="w-72 py-2">
                              {' '}
                              <p>{item[0].formatted_address}</p>
                            </div>
                          </Timeline.Body>
                          {durations[day] && durations[day][itemIndex] && (
                            <div className="flex gap-2">
                              <TruckIcon className="h-6 w-6 text-gray-500" />
                              <p>{durations[day][itemIndex].durationInMins}</p>
                              <p> {durations[day][itemIndex].distanceInKiloMeters} กม.</p>
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
