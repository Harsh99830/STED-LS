import React from 'react';
import { SignIn } from '@clerk/clerk-react';

function Login() {
  return (
    <div className="flex items-center justify-center bg-white">
      <div className="scale-130 mt-40"> 
        <SignIn afterSignInUrl="/dashboard"/>
      </div>
    </div>
  );
}

export default Login;
