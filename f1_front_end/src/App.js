import './App.css';
import React, { useState } from 'react';

function App() {
  // State for storing messages
  const [messages, setMessages] = useState([]);
  // State for storing input text
  const [input, setInput] = useState('');
  // State to track if a message has been sent (to move the search bar)
  const [messageSent, setMessageSent] = useState(false);

  // Handle sending a message
  const handleSendMessage = () => {
    if (input.trim()) {
      // Add user's message and bot's response to messages
      setMessages(prevMessages => [
        ...prevMessages,
        { sender: 'user', text: input },
        { sender: 'bot', text: "Got it! What else would you like to know about F1 Racing?" } // Bot's response
      ]);
      setInput(''); // Clear input field
      setMessageSent(true); // Set messageSent to true to move the search bar down
    }
  };

  return (
    <div id="container">
      {/* Box for Embedding */}
      <div id="embedding-box">
        <iframe
          style={{
            width: "100%",
            height: "100%",
            border: "none",
          }}
          src="https://f1tv.formula1.com/"
          title="F1 TV Embedding"
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
          allowFullScreen
        ></iframe>
      </div>

      {/* Box for the Chat AI */}
      <div id="aichat-box" style={{ position: 'relative', height: '100vh' }}>
        <div id="aichat-box-inner">
          {/* Conditionally render the initial bot message */}
          {messages.length === 0 && !messageSent && (
            <div className="input-container">
              <p className="text">What would you like to know about F1 Racing?</p>
            </div>
          )}

          {/* Wrapper for the messages */}
          <div className="messages-wrapper">
            {/* Scrollable container for the conversation */}
            <div
              id="input"
              className="messages-container"
              style={{
                position: 'absolute',
                top: messageSent ? '20px' : '100px', // "Teleport" to top after the first message
                left: '0',
                right: '0',
                margin: '0 auto',
                maxWidth: '500px',
                height: messageSent ? 'calc(100vh - 150px)' : 'auto', // Adjust height when moved to top
                padding: '10px',
                overflowY: 'auto', // Enable vertical scrolling
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
            </div>
          </div>

          {/* The search bar container */}
          <div
            className="search-bar-container"
            style={{
              position: 'absolute', // The search bar will always be absolute within the chat box
              bottom: messageSent ? '20px' : '330px', // Adjust bottom to start lower
              left: '50%', // Center horizontally
              transform: 'translateX(-50%) translateY(-50%)', // Center horizontally using transform
              width: '80%', // Set width of the search bar
              maxWidth: '500px', // Set a max width
            }}
          >
            <input
              type="text"
              className="search-bar"
              placeholder="Type your message..."
              value={input}
              onChange={(e) => setInput(e.target.value)}
              style={{
                width: '80%', // Make input field smaller, taking only 80% of the container
                padding: '10px', // Add some padding to make it look good
                marginRight: '10px', // Space between input and button
              }}
            />
            <button
              className="search-button"
              onClick={handleSendMessage}
              style={{
                width: '15%', // Limit the button width
                padding: '10px', // Add padding to the button
                cursor: 'pointer', // Make button clickable
              }}
            >
              Send
            </button>
          </div>
          <div className="output"></div>
        </div>
      </div>
    </div>
  );
}

export default App;
