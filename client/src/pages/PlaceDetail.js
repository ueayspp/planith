import axios from 'axios'
import { useParams } from 'react-router-dom'
import { useState, useEffect } from 'react'

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
      {placeDetail && (
        <div>
          <h1>{placeDetail.result.name}</h1>
          {placeDetail.result.photos.map((photo, index) => (
            <img
              key={index}
              src={`https://maps.googleapis.com/maps/api/place/photo?maxwidth=1600&photoreference=${photo.photo_reference}&key=AIzaSyDGRFphLumw98ls5l02FfV3ppVA2nljW6o`}
              alt={placeDetail.result.name}
              className="h-48 md:h-60 w-auto"
            />
          ))}
          <p>{placeDetail.result.formatted_address}</p>
          <p>{placeDetail.result.current_opening_hours.weekday_text}</p>
          <p>{placeDetail.result.rating}</p>
        </div>
      )}
    </div>
  )
}

export default PlaceDetail
