import { useState, useContext } from 'react'
import { useNavigate } from 'react-router-dom'

import { UserContext } from '../contexts/UserContext'

// datepicker
import dayjs from 'dayjs'
import 'dayjs/locale/th'
import Datepicker from 'react-tailwindcss-datepicker'

// flowbite components
import { Button, TextInput } from 'flowbite-react'

// components
import AlertMessage from './AlertMessage'

function Hero() {
  const navigate = useNavigate()

  const [showAlert, setShowAlert] = useState(false)

  const [guest, setGuest] = useState('')
  const [value, setValue] = useState({
    startDate: null,
    endDate: null,
  })

  function handleValueChange(newValue) {
    console.log('selected date:', newValue)
    setValue(newValue)
  }

  function handleSubmit(event) {
    const tripPlanData = JSON.parse(localStorage.getItem('tripPlan')) || {}

    // Check value if it's null or not
    if (guest !== '' && value.startDate !== null && value.endDate !== null) {
      // Value not null
      // Add new properties to tripPlanData object
      tripPlanData.guest = guest
      tripPlanData.startDate = value.startDate
      tripPlanData.endDate = value.endDate
      console.log(tripPlanData)

      // Save updated tripPlanData value to localStorage
      localStorage.setItem('tripPlan', JSON.stringify(tripPlanData))
      navigate('/search')
    } else {
      event.preventDefault()
      setShowAlert(true)
      setTimeout(() => {
        setShowAlert(false)
      }, 1000)
    }
  }

  return (
    <div>
      {showAlert && <AlertMessage message="เกิดข้อผิดพลาด !" color="failure" />}

      <form onSubmit={handleSubmit}>
        <TextInput
          type="number"
          min={1}
          placeholder="กรุณาใส่จำนวนผู้เดินทาง"
          onChange={(event) => setGuest(event.target.value)}
        />
        <Datepicker
          value={value}
          onChange={handleValueChange}
          separator={'-'}
          placeholder={'กรุณาใส่วันเดินทาง'}
          displayFormat={'DD/MM/YYYY'}
        />
        <Button color="dark" type="submit">
          เริ่มแพลนกันเลย !
        </Button>
      </form>
    </div>
  )
}

export default Hero
