import React from 'react'

function TaskStartButton({onClick}) {

    const handleClick = () => {
        // Call the onClick function passed as a prop
        onClick();
    }
  return (
    <div>
        <button 
        onClick={handleClick}
        className='bg-[#155DFC] hover:bg-[#1f4189] text-white text-lg text-center h-12 w-25 shadow-lg transition-all duration-200 rounded-xl'>
            Start Task
        </button>
    </div>
  )
}

export default TaskStartButton