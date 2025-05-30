import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import './App.css';

import Start from './Pages/Start';
import Login from './Pages/Login';
import Dashboard from './Pages/Dashboard';
import Signup from './Pages/Signup';
import Home from './Pages/Home';
import Survey from './components/Survey';

import SurveyProtectedRoute from './components/SurveyProtectedRoute';
import ProtectedRoute from './components/ProtectedRoute';

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Start />} />
        <Route path="/login" element={<Login />} />
        <Route path="/signup" element={<Signup />} />

        <Route
          path="/home"
          element={
            <SurveyProtectedRoute>
              <Home />
            </SurveyProtectedRoute>
          }
        />
        <Route
          path="/task"
          element={
            <SurveyProtectedRoute>
              <Dashboard />
            </SurveyProtectedRoute>
          }
        />
        <Route
          path="/survey"
          element={
            <ProtectedRoute>
              <Survey />
            </ProtectedRoute>
          }
        />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
