import { useState, useEffect } from 'react';
import { io } from 'socket.io-client';
import { useNavigate } from 'react-router-dom';

const socket = io('wss://robo-analyzer.onrender.com/:5000');

const CommunityChat = () => {
  const navigate = useNavigate();
  const [message, setMessage] = useState('');
  const [messages, setMessages] = useState([]);
  const [username, setUsername] = useState('Anonymous');
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [replyingTo, setReplyingTo] = useState(null); // ✅ Reply state

  useEffect(() => {
    console.log('CommunityChat mounted');

    // Check user login
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
      navigate('/login');
      return;
    }

    if (!user) {
      console.log('No user, redirecting');
      navigate('/login');
      return;
    }

    setUsername(user.name || user.email || 'Anonymous');

    // Fetch messages from backend
    console.log('Calling fetchMessages...');
    fetchMessages();

    // Socket listeners
    socket.on('receive_message', (data) => {
      console.log('Socket received:', data);
      setMessages((prev) => {
        const exists = prev.some(
          (msg) =>
            msg._id === data._id ||
            (msg.message === data.message &&
              msg.user === data.user &&
              msg.timestamp === data.timestamp)
        );
        if (!exists) return [...prev, data];
        return prev;
      });
    });

    socket.on('connect', () => console.log('Socket connected'));
    socket.on('disconnect', () => console.log('Socket disconnected'));

    return () => {
      socket.off('receive_message');
      socket.off('connect');
      socket.off('disconnect');
    };
  }, [navigate]);

  const fetchMessages = async () => {
    try {
      const response = await fetch('http://localhost:5000/api/community');
      if (response.ok) {
        const data = await response.json();
        setMessages(data);
      } else {
        throw new Error('Failed to fetch');
      }
    } catch (error) {
      console.error('Error fetching messages:', error);
      setMessages([
        {
          user: 'System',
          message: 'Welcome to the community chat! (Backend offline)',
          timestamp: new Date().toISOString(),
          replies: [],
        },
      ]);
    } finally {
      setIsLoading(false); // ✅ Always stop loading
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
      timestamp: new Date().toISOString(),
      replies: [],
    };

    // ✅ If replying
    if (replyingTo) {
      setMessages((prev) =>
        prev.map((msg) =>
          msg._id === replyingTo
            ? { ...msg, replies: [...(msg.replies || []), newMessage] }
            : msg
        )
      );
      setReplyingTo(null);
    } else {
      setMessages((prev) => [...prev, newMessage]);
    }

    setMessage('');

    try {
      const response = await fetch('http://localhost:5000/api/community', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          message: newMessage.message,
          timestamp: newMessage.timestamp,
          parentId: replyingTo || null,
        }),
      });

      if (response.ok) {
        const savedMessage = await response.json();
        socket.emit('send_message', savedMessage);
      }
    } catch (error) {
      console.error('Backend not available, message stored locally');
    }
  };

  const handleReply = (msgId) => {
    setReplyingTo(msgId);
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter') sendMessage();
  };

  // ✅ Loader
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

  return (
    <div className='p-8 max-w-4xl mx-auto'>
      <h2 className='text-3xl font-bold mb-6 text-center text-gray-800'>
        Community Chat
      </h2>

      <div className='bg-white rounded-lg shadow-lg border'>
        <div className='border-b p-4 bg-gray-50'>
          <h3 className='text-lg font-semibold text-gray-700'>
            Live Community Discussion
          </h3>
          <p className='text-sm text-gray-500'>Connected as: {username}</p>
          {error && <p className='text-sm text-red-600 mt-1'>{error}</p>}
        </div>

        {/* Messages */}
        <div className='h-96 overflow-y-auto p-4 space-y-3'>
          {messages.length === 0 ? (
            <div className='text-center text-gray-500 py-8'>
              <p>No messages yet. Be the first to start!</p>
            </div>
          ) : (
            messages.map((msg, i) => (
              <div key={msg._id || i} className='space-y-2'>
                <div className='flex items-start space-x-3'>
                  <div className='w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center text-white text-sm font-semibold'>
                    {msg.user ? msg.user.charAt(0).toUpperCase() : 'A'}
                  </div>
                  <div className='flex-1'>
                    <div className='flex items-center space-x-2'>
                      <span className='font-semibold text-gray-900'>
                        {msg.user}
                      </span>
                      <span className='text-xs text-gray-500'>
                        {new Date(msg.timestamp).toLocaleTimeString()}
                      </span>
                    </div>
                    <p className='text-gray-700'>{msg.message}</p>
                    <button
                      onClick={() => handleReply(msg._id)}
                      className='text-sm text-blue-600 hover:underline mt-1'
                    >
                      Reply
                    </button>

                    {/* ✅ Replies */}
                    {msg.replies && msg.replies.length > 0 && (
                      <div className='ml-8 mt-2 space-y-2'>
                        {msg.replies.map((reply, j) => (
                          <div
                            key={j}
                            className='flex items-start space-x-2 bg-gray-50 p-2 rounded'
                          >
                            <div className='w-6 h-6 bg-green-500 rounded-full flex items-center justify-center text-white text-xs font-semibold'>
                              {reply.user.charAt(0).toUpperCase()}
                            </div>
                            <div>
                              <span className='font-semibold text-gray-800'>
                                {reply.user}
                              </span>{' '}
                              <span className='text-xs text-gray-500'>
                                {new Date(reply.timestamp).toLocaleTimeString()}
                              </span>
                              <p className='text-gray-600'>{reply.message}</p>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Input */}
        <div className='border-t p-4 bg-gray-50'>
          {replyingTo && (
            <p className='text-sm text-gray-600 mb-2'>
              Replying to a message...
              <button
                onClick={() => setReplyingTo(null)}
                className='text-red-600 ml-2'
              >
                Cancel
              </button>
            </p>
          )}
          <div className='flex space-x-3'>
            <input
              type='text'
              className='flex-1 border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500'
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder={
                replyingTo ? 'Write your reply...' : 'Type your message...'
              }
            />
            <button
              onClick={sendMessage}
              disabled={!message.trim()}
              className='bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 disabled:opacity-50'
            >
              {replyingTo ? 'Reply' : 'Send'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CommunityChat;
