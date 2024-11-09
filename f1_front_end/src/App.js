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
  // flex: '1',
  marginright: '100px',
  display: 'flex',
  flexDirection: 'column'
}

const iframeStyle = {
  width: "1100px",
  height: "750px",
  title: "F1 TV Embedding"
}

function App() {
  return (
    <div style={containerStyle}>
      {/* Box for Embedding*/}
      <div id="embedding-box" padding="10px">
        <iframe
        style={iframeStyle}
        src="https://f1tv.formula1.com/" // Replace with your video URL
        title="F1 TV Embedding"
        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
        allowFullScreen
        ></iframe>
      </div>

      {/* Box for the Chat AI */}
      <div id="aichat-box" style={chatBoxContainerStyle}>
        <div id="input" padding="8px">
      
          <p><strong>User:</strong> Hello there!</p>
          <p><strong>Bot:</strong> Hi! How can I help you?</p>
        </div>

        <input padding="8px 16px" marginLeft="5px" type="text" placeholder="Type your message..."/>
        <button>Send</button>
      </div>
      
    </div>
    
  );
}

export default App;
