import { Navigate } from 'react-router-dom';

const ProtectedRoute = ({ children }) => {
  let user = null;
  
  try {
    const userData = localStorage.getItem('user');
    if (userData) {
      user = JSON.parse(userData);
    }
  } catch (error) {
    console.error('Error parsing user data:', error);
    localStorage.removeItem('user');
    localStorage.removeItem('token');
  }
  
  if (!user) {
    return <Navigate to="/login" replace />;
  }
  
  return children;
};

export default ProtectedRoute; 