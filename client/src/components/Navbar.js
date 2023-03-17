import React from 'react'
import { Link } from 'react-router-dom'

function Navbar() {
  return (
    <div className="navbar">
      <Link to="/" className="nav-items">
        หน้าหลัก
      </Link>
      &nbsp;
      <Link to="/search" className="nav-item">
        ค้นหาสถานที่
      </Link>
      &nbsp;
      <Link to="/planner" className="nav-item">
        จัดแพลนเนอร์
      </Link>
    </div>
  )
}

export default Navbar
