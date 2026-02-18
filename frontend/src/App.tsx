import { Routes, Route } from "react-router-dom";
import Portfolio from "./pages/Portfolio";
import "./App.css";

function App() {
  return (
    <Routes>
      <Route path="/" element={<Portfolio />} />
      <Route path="/onboarding/assets" element={<Portfolio />} />
      <Route path="*" element={<div>Not Found</div>} />
    </Routes>
  );
}

export default App;
