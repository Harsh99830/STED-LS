import React from 'react';
import { SignUp } from '@clerk/clerk-react';

function Signup() {
  return (
    <div className="flex items-center justify-center bg-white">
      <div className="scale-100 mt-10"> 
        <SignUp afterSignUpUrl="/home"/>
      </div>
    </div>
  );
}

export default Signup;
