import axios from 'axios'
import { useParams } from 'react-router-dom'
import { useState, useEffect } from 'react'

import Navbar from '../components/Navbar'

import { Button, Carousel, Card, Rating } from 'flowbite-react'

function PlaceDetail({ places }) {
  const { place_id } = useParams()

  const [placeDetail, setPlaceDetail] = useState()

  useEffect(() => {
    getPlace()
  }, [])

  // fetch data using place_id
  async function getPlace() {
    const params = {
      place_id,
    }

    try {
      const response = await axios.get('/api/places/:place_id', { params })
      setPlaceDetail(response.data)
    } catch (error) {
      console.log(error)
    }
  }

  return (
    <div>
      <Navbar />
      {placeDetail && (
        <div className="px-12 space-y-4">
          <div className="w-60 h-60 sm:h-64 xl:h-80 2xl:h-96">
            <Carousel className="w-128 h-128">
              {placeDetail.photos.map((photo, index) => (
                <img
                  key={index}
                  src={`https://maps.googleapis.com/maps/api/place/photo?maxwidth=1600&photoreference=${photo.photo_reference}&key=AIzaSyDGRFphLumw98ls5l02FfV3ppVA2nljW6o`}
                  alt={placeDetail.name}
                  className="h-128"
                />
              ))}
            </Carousel>
          </div>
          <div className="flex h-full">
            <div className="w-1/2 space-y-2">
              {' '}
              <h1 className="text-2xl">{placeDetail.name}</h1>
              <Rating>
                <Rating.Star />
                <p>{placeDetail.rating}</p>
                <span className="mx-1.5 h-1 w-1 rounded-full bg-gray-500 dark:bg-gray-400" />
                <p>{placeDetail.user_ratings_total} รีวิว</p>
              </Rating>
              <p>{placeDetail.formatted_address}</p>
            </div>
            <div className="w-1/2">
              {' '}
              <Button color="dark">เลือก</Button>
            </div>
          </div>

          <div className="flex flex-col space-y-2">
            {placeDetail.editorial_summary.overview && (
              <p>{placeDetail.editorial_summary.overview}</p>
            )}
            <br />
            {placeDetail.current_opening_hours && (
              <div>
                <p>{placeDetail.current_opening_hours.weekday_text[0]}</p>
                <p>{placeDetail.current_opening_hours.weekday_text[1]}</p>
                <p>{placeDetail.current_opening_hours.weekday_text[2]}</p>
                <p>{placeDetail.current_opening_hours.weekday_text[3]}</p>
                <p>{placeDetail.current_opening_hours.weekday_text[4]}</p>
                <p>{placeDetail.current_opening_hours.weekday_text[5]}</p>
                <p>{placeDetail.current_opening_hours.weekday_text[6]}</p>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  )
}

export default PlaceDetail
