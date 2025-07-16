import { useEffect, useState } from 'react';

import './App.css';

function App() {
  const [message, setMessage] = useState('');
  useEffect(() => {
    fetch('http://localhost:3001/api/hello')
      .then((res) => res.text())
      .then(setMessage);
  }, []);

  return (
    <>
      <div>{message}</div>
    </>
  );
}

export default App;
