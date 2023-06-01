import { Routes, Route  } from "react-router-dom";

import Home from "../Components/Home";
import SignUp from "../Components/SignUp";
import SignIn from '../Components/SignIn';
import About from "../Components/About";
import Contact from "../Components/Contact";
import Dashboard from "../Components/Dashboard";

function AllRoutes() {
  return (
    <div>
      <Routes>
          <Route path='/' element={ <Home /> } />
          <Route path='/signup' element={ <SignUp /> } />
          <Route path='/signin' element={ <SignIn /> } />
          <Route path='/about' element={ <About /> } />
          <Route path='/contact' element={ <Contact /> } />
          <Route path='/dashboard' element={ <Dashboard />} />
      </Routes>
    </div>
  )
}

export default AllRoutes