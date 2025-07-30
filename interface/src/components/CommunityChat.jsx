import { useState, useEffect } from 'react';
import { io } from 'socket.io-client';
import { useNavigate } from 'react-router-dom';

const socket = io('http://localhost:5000');

const CommunityChat = () => {
  const navigate = useNavigate();
  const [message, setMessage] = useState('');
  const [messages, setMessages] = useState([]);
  const [username, setUsername] = useState('Anonymous');
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    console.log('CommunityChat component mounted');
    
    // Check if user is logged in
    let user = null;
    try {
      const userData = localStorage.getItem('user');
      console.log('User data from localStorage:', userData);
      if (userData) {
        user = JSON.parse(userData);
        console.log('Parsed user:', user);
      }
    } catch (error) {
      console.error('Error parsing user data:', error);
      localStorage.removeItem('user');
      localStorage.removeItem('token');
      navigate('/login');
      return;
    }

    if (!user) {
      console.log('No user found, redirecting to login');
      navigate('/login');
      return;
    }

    console.log('Setting username to:', user.name || user.email || 'Anonymous');
    setUsername(user.name || user.email || 'Anonymous');
    
    // Load existing messages from database
    fetchMessages();
    
    // Socket event listeners for real-time communication
    socket.on('receive_message', (data) => {
      console.log('Received message via socket:', data);
      setMessages(prev => {
        // Check if message already exists to prevent duplication
        const exists = prev.some(msg => 
          msg._id === data._id || 
          (msg.message === data.message && 
           msg.user === data.user && 
           msg.timestamp === data.timestamp)
        );
        if (!exists) {
          return [...prev, data];
        }
        return prev;
      });
    });

    // Handle socket connection
    socket.on('connect', () => {
      console.log('Connected to socket server');
    });

    socket.on('disconnect', () => {
      console.log('Disconnected from socket server');
    });

    return () => {
      socket.off('receive_message');
      socket.off('connect');
      socket.off('disconnect');
    };
  }, [navigate]);

  const fetchMessages = async () => {
    try {
      console.log('Fetching messages from database...');
      const response = await fetch('http://localhost:5000/api/community');
      if (response.ok) {
        const data = await response.json();
        console.log('Fetched messages:', data);
        setMessages(data);
      } else {
        console.log('Failed to fetch messages, using local fallback');
        setMessages([
          {
            user: 'System',
            message: 'Welcome to the community chat! (Backend not available)',
            timestamp: new Date().toISOString()
          }
        ]);
      }
    } catch (error) {
      console.error('Error fetching messages:', error);
      setMessages([
        {
          user: 'System',
          message: 'Welcome to the community chat! (Backend not available)',
          timestamp: new Date().toISOString()
        }
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  const sendMessage = async () => {
    if (!message.trim()) return;

    let user = null;
    let token = null;
    
    try {
      const userData = localStorage.getItem('user');
      if (userData) {
        user = JSON.parse(userData);
      }
      token = localStorage.getItem('token');
    } catch (error) {
      console.error('Error parsing user data:', error);
      localStorage.removeItem('user');
      localStorage.removeItem('token');
      navigate('/login');
      return;
    }
    
    if (!user || !token) {
      navigate('/login');
      return;
    }

    const newMessage = {
      user: user.name || user.email || 'Anonymous',
      message: message.trim(),
      timestamp: new Date().toISOString()
    };

    // Clear input immediately for better UX
    setMessage('');

    // Try to save to backend and broadcast to all users
    try {
      const response = await fetch('http://localhost:5000/api/community', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          message: newMessage.message,
          timestamp: newMessage.timestamp
        }),
      });

      if (response.ok) {
        const savedMessage = await response.json();
        console.log('Message saved to database:', savedMessage);
        // Emit to socket for real-time updates to all users
        socket.emit('send_message', savedMessage);
      } else if (response.status === 401) {
        // Token expired or invalid
        localStorage.removeItem('user');
        localStorage.removeItem('token');
        navigate('/login');
      } else {
        console.log('Backend not available, adding message locally');
        // Add message locally if backend fails
        setMessages(prev => [...prev, newMessage]);
      }
    } catch (error) {
      console.log('Backend not available, adding message locally');
      // Add message locally if backend fails
      setMessages(prev => [...prev, newMessage]);
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter') {
      sendMessage();
    }
  };

  if (isLoading) {
    return (
      <div className='p-8 max-w-4xl mx-auto'>
        <div className='bg-white rounded-lg shadow-lg border p-8 text-center'>
          <div className='animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto'></div>
          <p className='mt-4 text-gray-600'>Loading community chat...</p>
        </div>
      </div>
    );
  }

  // Fallback in case something goes wrong
  if (!username) {
    return (
      <div className='p-8 max-w-4xl mx-auto'>
        <div className='bg-white rounded-lg shadow-lg border p-8 text-center'>
          <h2 className='text-2xl font-bold text-gray-800 mb-4'>Community Chat</h2>
          <p className='text-gray-600'>Something went wrong. Please try refreshing the page.</p>
        </div>
      </div>
    );
  }

  return (
    <div className='p-8 max-w-4xl mx-auto'>
      <h2 className='text-3xl font-bold mb-6 text-center text-gray-800'>Community Chat</h2>
      
      <div className='bg-white rounded-lg shadow-lg border'>
        <div className='border-b p-4 bg-gray-50'>
          <h3 className='text-lg font-semibold text-gray-700'>Live Community Discussion</h3>
          <p className='text-sm text-gray-500'>Connected as: {username}</p>
          {error && (
            <p className='text-sm text-red-600 mt-1'>{error}</p>
          )}
        </div>
        
        <div className='h-96 overflow-y-auto p-4 space-y-3'>
          {messages.length === 0 ? (
            <div className='text-center text-gray-500 py-8'>
              <p>No messages yet. Be the first to start the conversation!</p>
            </div>
          ) : (
            messages.map((msg, i) => (
              <div key={msg._id || i} className='flex items-start space-x-3'>
                <div className='flex-shrink-0'>
                  <div className='w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center text-white text-sm font-semibold'>
                    {msg.user ? msg.user.charAt(0).toUpperCase() : 'A'}
                  </div>
                </div>
                <div className='flex-1 min-w-0'>
                  <div className='flex items-center space-x-2'>
                    <span className='font-semibold text-gray-900'>{msg.user || 'Anonymous'}</span>
                    <span className='text-xs text-gray-500'>
                      {new Date(msg.timestamp).toLocaleTimeString()}
                    </span>
                  </div>
                  <p className='text-gray-700 mt-1'>{msg.message}</p>
                </div>
              </div>
            ))
          )}
        </div>
        
        <div className='border-t p-4 bg-gray-50'>
          <div className='flex space-x-3'>
            <input
              type='text'
              className='flex-1 border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent'
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder='Type your message...'
            />
            <button 
              onClick={sendMessage} 
              disabled={!message.trim()}
              className='bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors'
            >
              Send
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CommunityChat;
