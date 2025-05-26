import React from 'react'
import { Link } from 'react-router-dom'
import Sidebar from '../components/Sidebar'
import Navbar from '../components/Navbar'
import { useEffect } from 'react'
import { useUser } from '@clerk/clerk-react'
import { useNavigate } from 'react-router-dom'
function Home() {
  const { isLoaded, isSignedIn } = useUser();
  const navigate = useNavigate();
   useEffect(() => {
    if (isLoaded && !isSignedIn) {
      navigate("/");
    }
    }, [isLoaded, isSignedIn, navigate]);
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