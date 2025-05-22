import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App'
import { ClerkProvider } from '@clerk/clerk-react'

const clerkFrontendApi = import.meta.env.VITE_CLERK_PUBLISHABLE_KEY; // Replace this!

ReactDOM.createRoot(document.getElementById('root')).render(
  <ClerkProvider publishableKey={clerkFrontendApi}>
    <App />
  </ClerkProvider>
)
