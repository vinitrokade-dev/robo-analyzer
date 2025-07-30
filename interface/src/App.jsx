import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Navbar from './components/Navbar';
import Home from './pages/Home';
import Login from './pages/Login';
import Register from './pages/Register';
import Chatbot from './components/Chatbot';
import CommunityChat from './components/CommunityChat';
import ProtectedRoute from './components/ProtectedRoute';

function App() {
  return (
    <Router>
      <div className='min-h-screen bg-gray-100'>
        <Navbar />
        <Routes>
          <Route path='/' element={<Home />} />
          <Route path='/login' element={<Login />} />
          <Route path='/register' element={<Register />} />
          <Route path='/chatbot' element={<Chatbot />} />
          <Route 
            path='/community' 
            element={
              <ProtectedRoute>
                <CommunityChat />
              </ProtectedRoute>
            } 
          />
        </Routes>
      </div>
    </Router>
  );
}

export default App;
