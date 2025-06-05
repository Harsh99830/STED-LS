import React from 'react'

function TaskStartButton({onClick}) {

    const handleClick = () => {
        // Call the onClick function passed as a prop
        onClick();
    }
  return (
    <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2">
        <button 
        onClick={handleClick}
        className='bg-[#B4A08C] hover:bg-[#8B7355] text-white text-lg text-center h-12 w-32 
                  shadow-lg transition-all duration-300 rounded-xl 
                  transform hover:scale-105 hover:shadow-xl
                  font-semibold tracking-wide'>
            Start Task
        </button>
    </div>
  )
}

export default TaskStartButton