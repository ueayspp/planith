import { useEffect, useState } from 'react'

// components
import Navbar from '../components/Navbar'
import DnDPlanner from '../components/DnDPlanner'

import { Card } from 'flowbite-react'

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
      <Navbar />
      <div className="p-6 space-y-8 md:px-8 md:space-y-12 lg:px-12">
        {tripPlan.guest && tripPlan.startDate && tripPlan.endDate ? (
          <Card>
            <p>จำนวนผู้เดินทาง {tripPlan.guest} คน</p>
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
          </Card>
        ) : (
          ''
        )}

        <DnDPlanner />
      </div>
    </div>
  )
}

export default Planner
