import { Route, Routes } from 'react-router-dom';
import './App.css';

import SignIn from './Components/SignIn/SignIn';
import SignUp from './Components/SignUp/SignUp';
import Layout from './Components/Layout/Layout';
import RequireAuth from './Components/RequireAuth/RequireAuth';
import PublicOnly from './Components/PublicOnly/PublicOnly';
import Home from './Components/Home/Home';
import Flashcards from './Components/Flashcards/Flashcards';

function App() {
  return (
    <Routes>
      <Route path='/' element={<Layout />}>
        <Route index element={<Home />} />
        <Route element={<PublicOnly />}>
          <Route path='signup' element={<SignUp />} />
          <Route path='signin' element={<SignIn />} />
        </Route>
        <Route element={<RequireAuth />}>
          <Route path='flashcards' element={<Flashcards />} />
        </Route>
      </Route>
    </Routes>
  );
}

export default App;
