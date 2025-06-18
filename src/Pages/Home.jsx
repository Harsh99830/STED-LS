import React from 'react'
import { Link } from 'react-router-dom'
import Navbar from '../components/Navbar'
import Feed from '../components/Feed'
function Home() {
  return (
    <div>
        <Navbar/>
        <div className='flex justify-center'>
         <Link to={"/all-skills"}>         
        <div className='w-30 border border-black p-2 cursor-pointer'>
        See All Skills
        </div>
         </Link>
        </div>
         <Feed/>
    </div>
  )
}

export default Home