import { useEffect, useState } from 'react';

import './App.css';
import CatForm from './CatForm';

function App() {
  const [message, setMessage] = useState('');
  useEffect(() => {
    fetch('http://localhost:3000/api/hello')
      .then((res) => res.text())
      .then(setMessage);
  }, []);

  return (
    <>
      <div>{<CatForm />}</div>
    </>
  );
}

export default App;
