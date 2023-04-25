import React from 'react'

// components
import Navbar from '../components/Navbar'
import Hero from '../components/Hero'

import landscape from '../assets/images/landscape-bg.jpg'

function Home() {
  return (
    <div
      className="flex flex-col h-screen bg-hero bg-cover bg-center"
      style={{ backgroundImage: `url(${landscape})` }}
    >
      <Navbar />
      <div className="flex flex-col items-center justify-start md:justify-center md:gap-8 p-10 h-full w-full">
        <span className="flex text-8xl sm:text-7xl md:text-8xl lg:text-9xl text-center">
          <h1 id="header-logo" className="text-orange-700 drop-shadow-lg">
            Planith
          </h1>
        </span>
        <Hero />
      </div>
    </div>
  )
}

export default Home
