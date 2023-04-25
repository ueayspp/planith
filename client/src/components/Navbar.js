import { useState } from 'react'
import { Link } from 'react-router-dom'
import { slide as Menu } from 'react-burger-menu'
import { Bars3Icon } from '@heroicons/react/24/outline'

function Navbar() {
  const [menuOpen, setMenuOpen] = useState(false)

  const handleMenuButtonClick = () => {
    setMenuOpen(!menuOpen)
  }

  return (
    <div className="px-4">
      <div className="hidden md:block">
        <div className="flex justify-between md:justify-start gap-4 p-2 md:p-4 lg:p-8">
          <Link to="/" id="nav-logo">
            Planith
          </Link>
          <Link to="/search" className="">
            ค้นหาสถานที่
          </Link>
          <Link to="/planner" className="">
            จัดแพลนเนอร์
          </Link>
        </div>
      </div>

      <div className="md:hidden">
        <div className="flex justify-between p-4">
          <Link to="/" id="nav-logo">
            Planith
          </Link>
          <button onClick={handleMenuButtonClick}>
            <Bars3Icon className="h-6 w-6 text-black" />
          </button>
        </div>
        {menuOpen && (
          <div className="fixed inset-0 z-50">
            <Menu
              width={'50%'}
              right
              isOpen={menuOpen}
              onClose={() => setMenuOpen(false)}
              noOverlay
              className="bg-gray-100"
            >
              <Link to="/" className="px-2 pt-2">
                หน้าหลัก
              </Link>
              <Link to="/search" className="px-2">
                ค้นหาสถานที่
              </Link>
              <Link to="/planner" className="px-2">
                จัดแพลนเนอร์
              </Link>
            </Menu>
          </div>
        )}
      </div>
    </div>
  )
}

export default Navbar
