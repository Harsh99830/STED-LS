import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import './App.css';

import Start from './Pages/Start';
import Login from './Pages/Login';
import Dashboard from './Pages/Dashboard';
import Signup from './Pages/Signup';
import Home from './Pages/Home';
import Survey from './components/Survey';
import Done from './Pages/Done';
import PublicSpeaking from './Pages/PublicSpeaking';
import DataScience from './Pages/DataScience';
import WebDevlopment from './Pages/WebDevlopment';
import EthicalHacking from './Pages/EthicalHacking';
import DecisionMaking from './Pages/DecisionMaking';
import ProblemSolving from './Pages/ProblemSolving';
import C from './Pages/C';
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
          path="/web-devlopment"
          element={
            <SurveyProtectedRoute>
              <WebDevlopment />
            </SurveyProtectedRoute>
          }
        />
        <Route
          path="/ethical-hacking"
          element={
            <SurveyProtectedRoute>
              <EthicalHacking />
            </SurveyProtectedRoute>
          }
        />
        <Route
          path="/decision-making"
          element={
            <SurveyProtectedRoute>
              <DecisionMaking />
            </SurveyProtectedRoute>
          }
        />
        <Route
          path="/problem-solving"
          element={
            <SurveyProtectedRoute>
              <ProblemSolving />
            </SurveyProtectedRoute>
          }
        />
        <Route path="/c" element={<C />} />
        <Route
          path="/task"
          element={
            <SurveyProtectedRoute>
              <Dashboard />
            </SurveyProtectedRoute>
          }
        />
        <Route
          path="/done"
          element={
            <SurveyProtectedRoute>
              <Done />
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