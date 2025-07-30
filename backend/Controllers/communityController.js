const Message = require("../models/Message");

exports.getMessages = async (req, res) => {
  try {
    const messages = await Message.find().sort({ timestamp: -1 }).limit(50);
    res.json(messages.reverse()); // Reverse to show oldest first
  } catch (error) {
    console.error('Error fetching messages:', error);
    res.status(500).json({ error: 'Failed to fetch messages' });
  }
};

exports.postMessage = async (req, res) => {
  try {
    const { message, timestamp } = req.body;
    
    if (!message || !message.trim()) {
      return res.status(400).json({ error: 'Message cannot be empty' });
    }

    // Use authenticated user's information
    const user = req.user;
    
    const newMessage = await Message.create({ 
      user: user.name || user.email, 
      message: message.trim(),
      timestamp: timestamp || new Date()
    });
    
    res.status(201).json(newMessage);
  } catch (error) {
    console.error('Error posting message:', error);
    res.status(500).json({ error: 'Failed to post message' });
  }
};
