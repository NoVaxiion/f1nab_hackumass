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

      <div id="aichat-box" style={{ position: 'relative', height: '100vh' }}>
        <div id="aichat-box-inner">
          {messages.length === 0 && !messageSent && (
            <div className="input-container">
              <p className="text">Enter a race and its year you would like to learn about?</p>
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
    </div>
  );
}

export default App;
