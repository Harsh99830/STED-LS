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
import ProtectedRoute from './components/ProtectedRoute';
import ProjectProtectedRoute from './components/ProjectProtectedRoute';
import AllSkills from './Pages/AllSkills';
import Project from './PythonProject/Project';
import PowerBi from './Pages/PowerBi';
import Pandas from './Pages/Pandas';
import PandasProject from './PandasProject/Project';
import Profile from './Pages/Profile';
import UserProfile from './Pages/UserProfile';
import PublicPythonProject from './PythonProject/PublicPythonProject';
import C from './Pages/C';
import Cplus from './Pages/Cplus';
import DSA from './Pages/DSA';
import Devops from './Pages/Devops';
import Java from './Pages/Java';
import Javascript from './Pages/Javascript';
import NodeJS from './Pages/NodeJS';
import ReactJS from './Pages/ReactJS';
import SQL from './Pages/SQL';
import Numpy from './Pages/Numpy';

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

      <Route path="/home" element={<Home />} />
      <Route path="/public-speaking" element={<PublicSpeaking />} />
      <Route path="/data-science" element={<DataScience />} />
      <Route path="/python" element={<Python />} />
      <Route path="/powerbi" element={<PowerBi />} />
      <Route path="/pandas" element={<Pandas />} />
      <Route
        path="/python/project"
        element={
          <ProjectProtectedRoute>
            <Project />
          </ProjectProtectedRoute>
        }
      />
      <Route
        path="/pandas/project"
        element={
          <ProjectProtectedRoute>
            <PandasProject />
          </ProjectProtectedRoute>
        }
      />
      <Route path="/All-skills" element={<AllSkills />} />
      <Route path="/c" element={<C />} />
      <Route path="/cplus" element={<Cplus />} />
      <Route path="/dsa" element={<DSA />} />
      <Route path="/devops" element={<Devops />} />
      <Route path="/java" element={<Java />} />
      <Route path="/javascript" element={<Javascript />} />
      <Route path="/nodejs" element={<NodeJS />} />
      <Route path="/numpy" element={<Numpy />} />
      <Route path="/reactjs" element={<ReactJS />} />
      <Route path="/sql" element={<SQL />} />
      <Route path="/profile" element={<Profile />} />
      
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