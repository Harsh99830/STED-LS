import React, { useEffect, useState } from 'react';
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
import PublicPythonProject from './PythonProject/PublicPythonProject';

function App() {
  const [isOnline, setIsOnline] = useState(navigator.onLine);

  useEffect(() => {
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);
    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);
    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  if (!isOnline) {
    return (
      <div style={{ minHeight: '100vh' }} className="flex flex-col items-center justify-center bg-slate-50">
        <div className="text-3xl font-bold text-slate-800 mb-4">No internet connection</div>
        <button
          className="bg-purple-600 hover:bg-purple-700 text-white text-lg font-semibold px-8 py-4 rounded-lg shadow-md transition-colors"
          onClick={() => window.location.reload()}
        >
          Refresh
        </button>
      </div>
    );
  }

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
      <Route path="/python-project/:userId/:projectId" element={<PublicPythonProject />} />
    </Routes>
  );
}

export default App;