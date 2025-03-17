import { createBrowserRouter, RouterProvider } from 'react-router-dom';
import Login from './components/Login';
import Singup from './components/Signup';
import './App.css'
import Home from './components/Home';
import { AppContextProvider } from './app/AppContext.jsx';
import Profile, { UserProfile, Verifier } from './components/Profile.jsx';

const router = createBrowserRouter([
  { path: '/', element: <Home/> },
  { path: '/login', element: <Login /> },
  { path: '/signup', element: <Singup /> },
  { path: '/profile', element: <Profile />,
    children: [
      // if i add / at the begining of child path, then it will be resolved relative to the origin
      // not relative to its direct parent. for example:
      // path='/verify' => http://example.com/verify
      // but path='verify' => http://example.com/profile/verify
      { path: '', element: <UserProfile /> },
      { path: 'verify', element: <Verifier /> }
    ]
  }
]);


function App() {

  return (
    <> 
      <AppContextProvider>
        <RouterProvider router={router} >
        </RouterProvider>
      </AppContextProvider>
    </>
  )
}

export default App
