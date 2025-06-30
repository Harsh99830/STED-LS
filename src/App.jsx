import React from 'react';
import { Routes, Route } from 'react-router-dom';
import './App.css';
import Start from './Pages/Start';
import Login from './Pages/Login';
import Signup from './Pages/Signup';
import Home from './Pages/Home';
import Survey from './components/Survey';
import PublicSpeaking from './Pages/PublicSpeaking';
import DataScience from './Pages/DataScience';
import Python from './Pages/Python';
import SurveyProtectedRoute from './components/SurveyProtectedRoute';
import ProtectedRoute from './components/ProtectedRoute';
import AllSkills from './Pages/AllSkills';
import Project from './PythonProject/Project';
import PowerBi from './Pages/PowerBi';
import Profile from './Pages/Profile';
import UserProfile from './Pages/UserProfile';

function App() {
  return (
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
        path="/public-speaking"
        element={
          <SurveyProtectedRoute>
            <PublicSpeaking />
          </SurveyProtectedRoute>
        }
      />
      <Route
        path="/data-science"
        element={
          <SurveyProtectedRoute>
            <DataScience />
          </SurveyProtectedRoute>
        }
      />
      <Route
        path="/python"
        element={
          <SurveyProtectedRoute>
            <Python />
          </SurveyProtectedRoute>
        }
      />
      <Route
        path="/powerbi"
        element={
          <SurveyProtectedRoute>
            <PowerBi />
          </SurveyProtectedRoute>
        }
      />
       <Route
        path="/python/project"
        element={
          <SurveyProtectedRoute>
            <Project />
          </SurveyProtectedRoute>
        }
      />
       <Route
        path="/All-skills"
        element={
          <SurveyProtectedRoute>
            <AllSkills />
          </SurveyProtectedRoute>
        }
      />
       <Route
        path="/profile"
        element={
          <SurveyProtectedRoute>
            <Profile />
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
      <Route path="/userprofile/:id" element={<UserProfile />} />
    </Routes>
  );
}

export default App;