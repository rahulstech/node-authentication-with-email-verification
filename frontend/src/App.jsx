import { createBrowserRouter, RouterProvider } from 'react-router-dom';
import Login from './components/Login';
import Singup from './components/Signup';
import './App.css'
import Home from './components/Home';
import { AppContextProvider } from './app/AppContext.jsx';

const router = createBrowserRouter([
  { path: '/', element: <Home/> },
  { path: '/login', element: <Login /> },
  { path: '/signup', element: <Singup /> }
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
