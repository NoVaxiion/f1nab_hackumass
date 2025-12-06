import React, { useState, useEffect, useRef } from "react";
import axios from "axios";
import "./App.css";
import bgImage from "./Background.png";

function App() {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const [messageSent, setMessageSent] = useState(false);
  const [showGreeting, setShowGreeting] = useState(true);
  const [fadeOut, setFadeOut] = useState(false);
  const messagesEndRef = useRef(null);
  const greetingRef = useRef(null);

  // Clean response
  const cleanText = (text) => {
    if (!text) return "";
    return text
      .replace(/\n?\*{1,2}\s*/g, "\n• ")
      .replace(/\n\s{2,}\*\s*/g, "\n   → ")
      .replace(/\*\*/g, "")
      .replace(/_/g, "")
      .replace(/`/g, "")
      .replace(/\n{3,}/g, "\n\n")
      .trim();
  };

  // Send message
  const handleSendMessage = async () => {
    if (!input.trim()) return;
    setMessages((prev) => [...prev, { sender: "user", text: input }]);
    setInput("");
    setMessageSent(true);

    try {
      // Use relative path for API calls (works on both localhost and Vercel)
      const res = await axios.post("/api/query", {
        query: input,
      });
      const cleaned = cleanText(res.data.response);
      setMessages((prev) => [...prev, { sender: "bot", text: cleaned }]);
    } catch (error) {
      console.error("API Error:", error);
      setMessages((prev) => [
        ...prev,
        {
          sender: "bot",
          text: "Sorry, something went wrong. Please try again.",
        },
      ]);
    }
  };

  // Auto scroll
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // Popup fade timing
  useEffect(() => {
    if (showGreeting) {
      const t = setTimeout(() => setFadeOut(true), 4000);
      return () => clearTimeout(t);
    }
  }, [showGreeting]);

  useEffect(() => {
    if (fadeOut) {
      const t = setTimeout(() => setShowGreeting(false), 2000);
      return () => clearTimeout(t);
    }
  }, [fadeOut]);

  return (
    <div id="container">
      {/* Background */}
      <div id="embedding-box">
        <img id="f1-bg-image" src={bgImage} alt="F1 background" />
      </div>

      {/* Chat box */}
      <div id="aichat-box">
        {/* Header */}
        <div id="margin-top">
          <span className="f1">F1</span>
          <span className="nab">NAB</span>
        </div>

        {/* Messages or centered prompt */}
        <div id="aichat-box-inner">
          {messages.length === 0 && !messageSent && (
            <div className="chat-prompt blinking">
              Ask me about any F1 race!
            </div>
          )}

          <div className="messages-wrapper">
            <div className="messages-container">
              {messages.map((msg, i) => (
                <div
                  key={i}
                  className={`chat-bubble ${
                    msg.sender === "user" ? "user-bubble" : "bot-bubble"
                  }`}
                >
                  <p style={{ whiteSpace: "pre-wrap" }}>{msg.text}</p>
                </div>
              ))}
              <div ref={messagesEndRef} />
            </div>
          </div>
        </div>

        {/* Input - moved outside aichat-box-inner */}
        <div className="search-bar-container">
          <input
            type="text"
            className="search-bar"
            placeholder="Type your message..."
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleSendMessage()}
          />
          <button className="search-button" onClick={handleSendMessage}>
            <span className="material-symbols-outlined">send</span>
          </button>
        </div>

        {/* Greeting popup */}
        {showGreeting && (
          <div
            ref={greetingRef}
            className={`greeting-popup ${fadeOut ? "fade-out" : ""}`}
          >
            Welcome! How can I assist you with F1 Racing?
          </div>
        )}
      </div>
    </div>
  );
}

export default App;
