import { use, useEffect, useState } from 'react'
import reactLogo from './assets/react.svg'
import viteLogo from '/vite.svg'
import './App.css'

function App() {
  const [data, setData] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await fetch('http://127.0.0.1:8000/data');
        const jsonData = await response.json();
        setData(jsonData.message);
        } catch (error) {
          console.error('Error fetching data:', error);
      }
    }

    fetchData();
  }, []);
  
  return (
    <div>
      <div> {data === null ? "Loading...": data} </div>
    </div>
  );
}

export default App
