import { Link, useNavigate } from 'react-router-dom';
import { useState, useEffect } from 'react';
import { Menu, X } from 'lucide-react';

const Navbar = () => {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  useEffect(() => {
    try {
      const userData = localStorage.getItem('user');
      if (userData) {
        setUser(JSON.parse(userData));
      }
    } catch (error) {
      console.error('Error parsing user data:', error);
      localStorage.removeItem('user');
      localStorage.removeItem('token');
    }
  }, []);

  const handleLogout = () => {
    localStorage.removeItem('user');
    localStorage.removeItem('token');
    setUser(null);
    navigate('/');
  };

  return (
    <nav className="bg-gradient-to-r from-blue-600 via-indigo-500 to-purple-600 shadow-md text-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo and Title */}
          <Link to="/" className="flex items-center space-x-3">
            <img src="/img/logo.png" alt="Logo" className="h-10 w-10 object-contain" />
            <span className="text-2xl font-semibold tracking-wide">RoboAnalyzer</span>
          </Link>

          {/* Desktop Links */}
          <div className="hidden md:flex space-x-6 items-center">
            <Link to="/" className="hover:text-gray-200 transition">Home</Link>
            <Link to="/chatbot" className="hover:text-gray-200 transition">Chatbot</Link>
            {user ? (
              <>
                <Link to="/community" className="hover:text-gray-200 transition">Community</Link>
                <div className="flex items-center space-x-3">
                  <span className="text-sm font-medium">Hi, {user.name || user.email || 'User'}</span>
                  <button
                    onClick={handleLogout}
                    className="bg-red-500 hover:bg-red-600 text-white px-3 py-1 rounded text-sm transition"
                  >
                    Logout
                  </button>
                </div>
              </>
            ) : (
              <>
                <Link to="/login" className="hover:text-gray-200 transition">Login</Link>
                <Link
                  to="/register"
                  className="bg-white text-blue-700 font-semibold px-4 py-1 rounded hover:bg-gray-100 transition"
                >
                  Register
                </Link>
              </>
            )}
          </div>

          {/* Mobile Menu Toggle */}
          <div className="md:hidden flex items-center">
            <button onClick={() => setIsMenuOpen(!isMenuOpen)}>
              {isMenuOpen ? <X size={26} /> : <Menu size={26} />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Dropdown Menu */}
      {isMenuOpen && (
        <div className="md:hidden px-4 pb-4 space-y-2 bg-gradient-to-b from-indigo-500 to-purple-600 text-white">
          <Link to="/" className="block hover:text-gray-200" onClick={() => setIsMenuOpen(false)}>Home</Link>
          <Link to="/chatbot" className="block hover:text-gray-200" onClick={() => setIsMenuOpen(false)}>Chatbot</Link>
          {user ? (
            <>
              <Link to="/community" className="block hover:text-gray-200" onClick={() => setIsMenuOpen(false)}>Community</Link>
              <div className="text-sm mt-2">Hi, {user.name || user.email || 'User'}</div>
              <button
                onClick={() => {
                  handleLogout();
                  setIsMenuOpen(false);
                }}
                className="w-full bg-red-500 hover:bg-red-600 text-white px-3 py-1 rounded text-sm mt-2"
              >
                Logout
              </button>
            </>
          ) : (
            <>
              <Link to="/login" className="block hover:text-gray-200" onClick={() => setIsMenuOpen(false)}>Login</Link>
              <Link
                to="/register"
                className="block bg-white text-blue-700 font-semibold px-4 py-1 rounded hover:bg-gray-100 transition mt-2"
                onClick={() => setIsMenuOpen(false)}
              >
                Register
              </Link>
            </>
          )}
        </div>
      )}
    </nav>
  );
};

export default Navbar;
