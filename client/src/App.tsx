import { Route, Routes } from 'react-router-dom';
import './App.css';

import SignIn from './Components/SignIn/SignIn';
import SignUp from './Components/SignUp/SignUp';
import Layout from './Components/Layout/Layout';
import RequireAuth from './Components/RequireAuth/RequireAuth';
import PublicOnly from './Components/PublicOnly/PublicOnly';
import Home from './Components/Home/Home';
import Flashcards from './Components/Flashcards/Flashcards';
import DeviceAuth from './Components/DeviceAuth/DeviceAuth';
import DeviceManagement from './Components/DeviceManagement/DeviceManagement';
import Profile from './Components/Profile/Profile';
import Settings from './Components/Settings/Settings';
import Discover from './Components/Discover/Discover';
import Support from './Components/Support/Support';
import Download from './Components/Download/Download';
import { useSocket } from './hooks/useSocket';

function App() {
  // Connect to WebSocket for real-time updates
  useSocket();

  return (
    <Routes>
      <Route path='/' element={<Layout />}>
        <Route index element={<Home />} />
        <Route path='download' element={<Download />} />
        <Route element={<PublicOnly />}>
          <Route path='signup' element={<SignUp />} />
          <Route path='signin' element={<SignIn />} />
        </Route>
        <Route element={<RequireAuth />}>
          <Route path='flashcards' element={<Flashcards />} />
          <Route path='devices' element={<DeviceManagement />} />
          <Route path='profile' element={<Profile />} />
          <Route path='settings' element={<Settings />} />
          <Route path='discover' element={<Discover />} />
          <Route path='support' element={<Support />} />
        </Route>
        <Route path='authorize/:userCode' element={<DeviceAuth />} />
      </Route>
    </Routes>
  );
}

export default App;
