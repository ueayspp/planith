import { BrowserRouter, Routes, Route } from 'react-router-dom'

// pages & components
import Navbar from './components/Navbar'
import Home from './pages/Home'
import Search from './pages/Search'
import PlaceDetail from './pages/PlaceDetail'
import Planner from './pages/Planner'

function App() {
  return (
    <div className="App">
      <BrowserRouter>
        <Navbar />
        <div className="pages">
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/search" element={<Search />} />
            <Route path="/places/:place_id" element={<PlaceDetail />} />
            <Route path="/planner" element={<Planner />} />
          </Routes>
        </div>
      </BrowserRouter>
    </div>
  )
}

export default App
