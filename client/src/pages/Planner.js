import { useEffect, useState } from 'react'

// components
import DnDPlanner from '../components/DnDPlanner'

import dayjs from 'dayjs'
import 'dayjs/locale/th'

function Planner() {
  const [tripPlan, setTripPlan] = useState([])

  useEffect(() => {
    // Get tripPlanData from localStorage
    const tripPlanData = JSON.parse(localStorage.getItem('tripPlan'))
    if (tripPlanData) {
      setTripPlan(tripPlanData)
    }
  }, [])

  return (
    <div>
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

      <br />

      <DnDPlanner />
    </div>
  )
}

export default Planner
