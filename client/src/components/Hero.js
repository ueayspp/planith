import { useState, useContext } from 'react'
import { useNavigate } from 'react-router-dom'

// context
import { UserContext } from '../contexts/UserContext'

// dayjs
import dayjs from 'dayjs'
import 'dayjs/locale/th'

// datepicker
import Datepicker from 'react-tailwindcss-datepicker'

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
    event.preventDefault()
    // save to context
    const start = new Date(value.startDate)
    const end = new Date(value.endDate)
    const diff = Math.floor((end - start) / (1000 * 60 * 60 * 24)) + 1
    setUserData({ guest, start, end, diff })
    navigate('/search')
  }

  return (
    <div>
      <form onSubmit={handleSubmit}>
        <input
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
        <button type="submit">เริ่มแพลนกันเลย !</button>
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
