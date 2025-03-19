import { createBrowserRouter, RouterProvider } from 'react-router-dom';
import {ForgetPassword, Login, ResetPassword} from './components/Login';
import Singup from './components/Signup';
import './App.css'
import Home from './components/Home';
import { AppContextProvider } from './app/AppContext.jsx';
import Profile, { EmailVerification, UpdateEmail, UpdatePassword, UpdateProfile, UserProfile } from './components/Profile.jsx';

const router = createBrowserRouter([
  { path: '/', element: <Home/> },
  { path: '/login', element: <Login /> },
  { path: '/forgetpassword', element: <ForgetPassword /> },
  { path: '/resetpassword', element: <ResetPassword /> },
  { path: '/signup', element: <Singup /> },
  { path: '/profile', element: <Profile />,
    children: [
      // if i add / at the begining of child path, then it will be resolved relative to the origin
      // not relative to its direct parent. for example:
      // path='/verify' => http://example.com/verify
      // but path='verify' => http://example.com/profile/verify
      { path: '', element: <UserProfile /> },
      { path: 'verification/email', element: <EmailVerification /> },
      { path: 'update', element: <UpdateProfile />, 
        children: [
          { path: 'password', element: <UpdatePassword /> },
          { path: 'email', element: <UpdateEmail /> }
        ]
      },
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
