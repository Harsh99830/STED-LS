import React from 'react'
import { Link } from 'react-router-dom'
import Sidebar from '../components/Sidebar'
import Navbar from '../components/Navbar'
function Home() {
  return (
    <div>
        <Navbar/>

        <Sidebar/>
        <button>
        <Link to="/task">
        Task
        </Link>
        </button>

    </div>
  )
}

export default Home