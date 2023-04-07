import { useState, useContext } from 'react'
import { useNavigate } from 'react-router-dom'

import { UserContext } from '../contexts/UserContext'

// datepicker
import dayjs from 'dayjs'
import 'dayjs/locale/th'
import Datepicker from 'react-tailwindcss-datepicker'

import { Button, TextInput } from 'flowbite-react'

function Hero() {
  const navigate = useNavigate()

  const { setUserData } = useContext(UserContext)

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
    // event.preventDefault()
    const start = new Date(value.startDate)
    const end = new Date(value.endDate)
    const diff = Math.floor((end - start) / (1000 * 60 * 60 * 24)) + 1

    // Add new properties to tripPlanData object
    tripPlanData.guest = guest
    tripPlanData.startDate = value.startDate
    tripPlanData.endDate = value.endDate
    console.log(tripPlanData)

    // Save updated tripPlanData value to localStorage
    localStorage.setItem('tripPlan', JSON.stringify(tripPlanData))
    navigate('/search')
  }

  return (
    <div>
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

      <div>
        {guest}
        {value.startDate &&
          dayjs(value.startDate).locale('th').add(543, 'year').format('D MMMM YYYY')}
        &nbsp;
        {value.startDate &&
          dayjs(value.endDate).locale('th').add(543, 'year').format('D MMMM YYYY')}
      </div>
    </div>
  )
}

export default Hero
