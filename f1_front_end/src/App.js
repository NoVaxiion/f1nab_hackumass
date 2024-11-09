import './App.css';
import React from 'react';
import { useState } from 'react';


// const chatBot = () => {
//   const [messages, setMessages] = useState([]);
//   const [input, setInput] = useState('');
// }





function App() {
  return (
    <div>
      // Box for Embedding
      <div id="embedding-box">
        <iframe 
        src="input link here" 
        title="embedded video"
        allowFullScreen
        ></iframe>
      </div>

      // Box for the Chat AI
      <div id="aichat-box">
        <div id="input">
          <p><strong>User:</strong> Hello there!</p>
          <p><strong>Bot:</strong> Hi! How can I help you?</p>
        </div>
        <input type="text" placeholder="Type your message..."/>
        <button>Send</button>
      </div>
      
    </div>
    
  );
}

export default App;
