// import { useEffect, useState } from 'react'
import { Routes, Route } from 'react-router-dom';
import Assets from './pages/Assets.tsx';
import Goals from './pages/Goals.tsx';
import Review from './pages/Review.tsx';
import './App.css'

function App() {
  
  return (
    <Routes>
      <Route path="/onboarding/assets" element={<Assets />} />
      <Route path="/onboarding/goals" element={<Goals />} />
      <Route path="/review" element={<Review />} />
      <Route path="*" element={<div>Not Found</div>} />
    </Routes>
  );
}

export default App
