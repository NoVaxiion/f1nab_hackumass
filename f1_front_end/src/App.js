import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios'; // Import axios for API requests
import './App.css';

function App() {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [messageSent, setMessageSent] = useState(false);
  const [showGreeting, setShowGreeting] = useState(true);  
  const [fadeOut, setFadeOut] = useState(false); 
  const messagesEndRef = useRef(null);
  const greetingRef = useRef(null); 

  // Function to send message to the backend API
  const handleSendMessage = async () => {
    if (input.trim()) {
      // Add user message to the chat
      setMessages(prevMessages => [
        ...prevMessages,
        { sender: 'user', text: input },
      ]);

      try {
        // Send user input to backend
        const response = await axios.post('http://localhost:5000/api/query', { query: input });
        
        // Add bot response to the chat
        setMessages(prevMessages => [
          ...prevMessages,
          { sender: 'bot', text: response.data.response } // Bot's response from backend
        ]);
      } catch (error) {
        console.error('Error querying backend:', error);
        setMessages(prevMessages => [
          ...prevMessages,
          { sender: 'bot', text: "Sorry, something went wrong. Please try again." }
        ]);
      }

      setInput(''); // Clear input field
      setMessageSent(true); 
    }
  };

  // Auto-scroll to bottom of chat when new message is added
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Handle greeting fade-out
  useEffect(() => {
    if (showGreeting) {
      const timeout = setTimeout(() => {
        setFadeOut(true); 
      }, 3000); 

      return () => clearTimeout(timeout); 
    }
  }, [showGreeting]);

  // Handle click outside of the greeting popup
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (greetingRef.current && !greetingRef.current.contains(event.target)) {
        setShowGreeting(false); 
      }
    };

    document.addEventListener('mousedown', handleClickOutside);

    return () => {
      document.removeEventListener('mousedown', handleClickOutside); 
    };
  }, []);

  // Remove greeting popup after fade-out
  useEffect(() => {
    if (fadeOut) {
      const timeout = setTimeout(() => {
        setShowGreeting(false); 
      }, 2000); 

      return () => clearTimeout(timeout); 
    }
  }, [fadeOut]);

  return (
    <div id="container">
      <div id="embedding-box">
        <iframe
          style={{
            width: "100%",
            height: "100%",
            border: "none",
          }}
          src="https://www.formula1.com/en/video"
          title="F1 TV Embedding"
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
          allowFullScreen
        ></iframe>
      </div>
      <div id="aichat-box" style={{ position: 'relative', height: '100vh' }}>
        <div id="margin-top">
          <span style={{
            fontStyle: 'italic',
            color: 'rgb(225 6 0)',
            fontWeight: 'bold',
          }}>F1</span> NAB
        </div>
        <div id="aichat-box-inner">
          {messages.length === 0 && !messageSent && (
            <div className="input-container">
              <p className="text">Enter the race and year you'd like to learn about</p>
            </div>
          )}

          <div className="messages-wrapper">
            <div
              id="input"
              className="messages-container"
              style={{
                position: 'absolute',
                top: messageSent ? '20px' : '100px',
                left: '0',
                right: '0',
                margin: '0 auto',
                maxWidth: '500px',
                height: messageSent ? 'calc(100vh - 150px)' : 'auto',
                padding: '10px',
                overflowY: 'auto',
                boxSizing: 'border-box',
              }}
            >
              {messages.map((message, index) => (
                <div
                  key={index}
                  className={`chat-bubble ${message.sender === 'user' ? 'user-bubble' : 'bot-bubble'}`}
                >
                  <p>{message.text}</p>
                </div>
              ))}
              <div ref={messagesEndRef} /> {/* This is the "scroll-to-bottom" ref */}
            </div>
          </div>

          <div
            className="search-bar-container"
            style={{
              position: 'absolute',
              bottom: messageSent ? '20px' : '330px',
              left: '50%',
              transform: 'translateX(-50%) translateY(-50%)',
              width: '80%',
              maxWidth: '500px',
            }}
          >
            <input
              type="text"
              className="search-bar"
              placeholder="Type your message..."
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  handleSendMessage();
                }
              }}
              style={{
                width: '80%',
                padding: '10px',
                marginRight: '10px',
              }}
            />
            <button
              className="search-button"
              onClick={handleSendMessage}
              style={{
                width: '15%',
                padding: '10px',
                cursor: 'pointer',
              }}
            >
              <span className="material-symbols-outlined">send</span>
            </button>
          </div>
        </div>
      </div>

      {/* Greeting popup */}
      {showGreeting && (
        <div
          className={`greeting-popup ${fadeOut ? 'fade-out' : ''}`}
          ref={greetingRef}
        >
          <div className="greeting-content">
            <p>Welcome! How can I assist you with F1 Racing?</p>
          </div>
        </div>
      )}
    </div>
  );
}

export default App;
