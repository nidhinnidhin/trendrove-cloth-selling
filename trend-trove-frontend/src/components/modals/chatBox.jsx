import React, { useState, useEffect, useRef } from 'react';
import { Box, IconButton, TextField, Paper, Typography, Avatar, Snackbar } from '@mui/material';
import { Send, Close, Chat } from '@mui/icons-material';
import io from 'socket.io-client';
import axiosInstance from '@/utils/axiosInstance';

const ChatBox = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [message, setMessage] = useState('');
  const [messages, setMessages] = useState([]);
  const [socket, setSocket] = useState(null);
  const [connected, setConnected] = useState(false);
  const [error, setError] = useState('');
  const [chatId, setChatId] = useState(null);
  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    setTimeout(() => {
      messagesEndRef.current?.scrollIntoView({ behavior: "smooth", block: "end" });
    }, 100);
  };

  useEffect(() => {
    if (isOpen) {
      scrollToBottom();
    }
  }, [isOpen]);
  
  useEffect(() => {
    if(localStorage.getItem("userId")){

      loadChatHistory();
    }
    
    const newSocket = io(process.env.NEXT_PUBLIC_SOCKET_URL, {
      withCredentials: true,
      reconnection: true,
      reconnectionAttempts: 5,
      reconnectionDelay: 1000
    });

    newSocket.on('connect', () => {
      console.log('Socket connected:', newSocket.id);
      setConnected(true);
      setError('');
      const userId = localStorage.getItem('userId');
      if (userId) {
        newSocket.emit('join', userId);
      } 
    });

    newSocket.on('connect_error', (err) => {
      console.error('Socket connection error:', err);
      setConnected(false);
      setError('Failed to connect to chat server. Please refresh the page.');
    });

    newSocket.on('new-message', (data) => {
      console.log('New message received:', data);
      if (!chatId) {
        setChatId(data.chatId);
      }
      setMessages(prev => [...prev, data.message]);
      scrollToBottom();
    });
    
    newSocket.on('message-sent', (data) => {
      console.log('Message sent confirmation:', data);
    });
    
    newSocket.on('error', (error) => {
      console.error('Socket error:', error);
      setError(error.message || 'An error occurred');
    });

    setSocket(newSocket);

    return () => {
      if (newSocket) {
        newSocket.disconnect();
      }
    };
  }, []);

  useEffect(() => {
    if (messages.length > 0) {
      scrollToBottom();
    }
  }, [messages]);
  
  useEffect(() => {
    if (isOpen && chatId) {
      markMessagesAsRead();
    }
  }, [isOpen, chatId]);

  const loadChatHistory = async () => {
    try {
      const response = await axiosInstance.get('/chat/user-chats');
      
      if (response.data) {
        if (response.data._id) {
          setChatId(response.data._id);
        }
        
        if (response.data.messages && Array.isArray(response.data.messages)) {
          setMessages(response.data.messages);
        }
      }
    } catch (error) {
      console.error('Error loading chat history:', error);
      if (error.response?.status === 401) {
        setError('Please login to use chat');
      } else {
        setError('Failed to load chat history');
      }
    }
  };
  
  const markMessagesAsRead = async () => {
    if (!chatId) return;
    
    try {
      await axiosInstance.put(`/chat/mark-read/${chatId}`);
    } catch (error) {
      console.error('Error marking messages as read:', error);
    }
  };

  const handleSend = async () => {
    if (!message.trim() || !connected) return;

    const userId = localStorage.getItem('userId');
    if (!userId) {
      setError('Please login to send messages');
      return;
    }
    const messageData = {
      userId,
      message: message.trim(),
      senderType: 'User'
    };
    
    const optimisticMessage = {
      message: message.trim(),
      senderType: 'User',
      timestamp: new Date(),
      read: false
    };
    
    setMessages(prev => [...prev, optimisticMessage]);
    setMessage('');

    try {
      if (socket) {
        socket.emit('send-message', messageData);
      }
      await axiosInstance.post('/chat/send-message', messageData);
    } catch (error) {
      console.error('Error sending message:', error);
      setError('Failed to send message. Please try again.');
    }
  };

  return (
    <>
      <Box sx={{ position: 'fixed', bottom: 50, right: 20, zIndex: 1000 }}>
        {!isOpen ? (
          <IconButton
            onClick={() => setIsOpen(true)}
            sx={{
              backgroundColor: '#FF9800',
              color: 'white',
              height:"50px",
              width:"50px",
              '&:hover': { backgroundColor: '#F57C00' }
            }}
          >
            <Chat />
          </IconButton>
        ) : (
          <Paper
            sx={{
              width: 350,
              height: 500,
              display: 'flex',
              flexDirection: 'column'
            }}
          >
            <Box sx={{
              p: 2,
              backgroundColor: '#FF9800',
              color: 'white',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center'
            }}>
              <Typography>Chat with Admin</Typography>
              <IconButton size="small" onClick={() => setIsOpen(false)} sx={{ color: 'white' }}>
                <Close />
              </IconButton>
            </Box>

            <Box sx={{
              flex: 1,
              overflow: 'auto',
              p: 2,
              display: 'flex',
              flexDirection: 'column',
              gap: 1
            }}>
              {messages.length === 0 ? (
                <Box sx={{ textAlign: 'center', opacity: 0.7, mt: 2 }}>
                  <Typography variant="body2">No messages yet. Start a conversation!</Typography>
                </Box>
              ) : (
                messages.map((msg, index) => (
                  <Box
                    key={index}
                    sx={{
                      alignSelf: msg.senderType === 'User' ? 'flex-end' : 'flex-start',
                      backgroundColor: msg.senderType === 'User' ? '#FF9800' : '#f0f0f0',
                      color: msg.senderType === 'User' ? 'white' : 'black',
                      p: 1,
                      borderRadius: 1,
                      maxWidth: '70%'
                    }}
                  >
                    <Typography variant="body2">{msg.message}</Typography>
                    <Typography variant="caption" sx={{ opacity: 0.7 }}>
                      {new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </Typography>
                  </Box>
                ))
              )}
              <div ref={messagesEndRef} />
            </Box>

            <Box sx={{ p: 2, display: 'flex', gap: 1 }}>
              <TextField
                fullWidth
                size="small"
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && handleSend()}
                placeholder="Type a message..."
                disabled={!connected}
              />
              <IconButton 
                onClick={handleSend} 
                color="primary"
                disabled={!connected || !message.trim()}
              >
                <Send />
              </IconButton>
            </Box>
          </Paper>
        )}
      </Box>
      <Snackbar
        open={!!error}
        autoHideDuration={6000}
        onClose={() => setError('')}
        message={error}
      />
    </>
  );
};

export default ChatBox;