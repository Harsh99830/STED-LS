import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App'
import { ClerkProvider } from '@clerk/clerk-react'
import { BrowserRouter } from 'react-router-dom'

const clerkFrontendApi = import.meta.env.VITE_CLERK_PUBLISHABLE_KEY; // Replace this!

ReactDOM.createRoot(document.getElementById('root')).render(
  <ClerkProvider publishableKey={clerkFrontendApi}>
    <BrowserRouter>
      <App />
    </BrowserRouter>
  </ClerkProvider>
)
