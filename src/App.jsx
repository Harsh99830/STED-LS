import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import './App.css'
import Start from './Pages/Start'
import Login from './Pages/Login'
import Dashboard from './Pages/Dashboard';
import Signup from './Pages/Signup';
import Home from './Pages/Home';
import Survey from './components/Survey';

function App() {

  return (
    <>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Start/>} />
          <Route path="/task" element={<Dashboard/>} />
          <Route path="/login" element={<Login/>} />
          <Route path="/signup" element={<Signup/>} />
          <Route path='/home' element={<Home/>}/>
          <Route path='/survey' element={<Survey/>}/>
        </Routes>
      </BrowserRouter>
    </>
  )
}

export default App
