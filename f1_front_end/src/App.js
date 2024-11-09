import './App.css';
import React from 'react';
import { useState } from 'react';


// const chatBot = () => {
//   const [messages, setMessages] = useState([]);
//   const [input, setInput] = useState('');
// }


const containerStyle = {
  display: 'flex',
  justifyContent: 'space-between',
  alignItems: 'flex-start',
  height: '100vh',
};

const chatBoxContainerStyle = {
  display: 'flex',
  flexDirection: 'column',
  width: '30%',  // Adjust the width of the AI chat box to 30%
  marginRight: '20px',
};

const iframeStyle = {
  width: "100%",  // Full width of the container (embedding-box)
  height: "750px",
  title: "F1 TV Embedding",
};

function App() {
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
        name="iframe"
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
          allowFullScreen
        ></iframe>
      </div>

      {/* Box for the Chat AI */}
      <div id="aichat-box">
        <div id="aichat-box-inner">
          <div className="input-container">
            <p className="text">What would you like to know about F1 Racing?</p>
          </div>
          <div id="input">
            <p><strong>User:</strong> Hello there!</p>
            <p><strong>Bot:</strong> Hi! How can I help you?</p>
          </div>

          <div className="search-bar-container">
            <input type="text" className="search-bar" placeholder="Type your message..." />
            <button className="search-button">Send</button>
          </div>

          <div className="output"></div>
        </div>
      </div>
    </div>
  );
}

export default App;