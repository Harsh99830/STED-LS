import React from 'react';
import { SignIn } from '@clerk/clerk-react';

function Login() {
  return (
    <div className="flex items-center justify-center bg-white">
      <div className="scale-100 mt-10"> 
        <SignIn afterSignInUrl="/survey"/>
      </div>
    </div>
  );
}

export default Login;
