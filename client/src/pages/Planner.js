import { useEffect, useState } from 'react'

function Planner() {
  const [selectedPlace, setSelectedPlace] = useState([])

  useEffect(() => {
    // get selectedPlaceData from localStorage
    const selectedPlaceData = JSON.parse(localStorage.getItem('selectedPlace'))
    if (selectedPlaceData) {
      setSelectedPlace(selectedPlaceData.cart.map((item) => item))
    }
  }, [])

  return (
    <div>
      <h1>แพลนเนอร์</h1>
      {selectedPlace.map((item, index) => (
        <div key={index}>
          <p>{item.name}</p>
          <p>{item.formatted_address}</p>
        </div>
      ))}
    </div>
  )
}

export default Planner
