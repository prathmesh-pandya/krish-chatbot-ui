// ChatBot.jsx
import React, { useState, useRef, useEffect } from "react";
import "./ChatBot.css";
import DOMPurify from "dompurify"; // Add this for security

const ChatBot = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([
    {
      html: `<div class="welcome-message">
        <h3>Hello there! 👋</h3>
        <p>I'm the KrishTechnoLabs assistant, here to help you with information about:</p>
       
        <p><strong>Core Expertise:</strong></p>
        <p>Krish Technolabs provides customer-centric experiences through four pillars:</p>
        <ul>
          <li>Enterprise Content Management</li>
          <li>Digital Commerce</li>
          <li>Marketing & Analytics</li>
          <li>Data & Insights</li>
        </ul>
        <p>How can I assist you today?</p>
        <div class="link-section">
          <a href="https://www.krishtechnolabs.com" target="_blank" rel="noopener noreferrer" class="link-button">Visit our website</a>
        </div>
      </div>`,
      isBot: true,
    },
  ]);
  const [inputMessage, setInputMessage] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef(null);

  // Auto-scroll to the bottom when messages update
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const toggleChat = () => {
    setIsOpen(!isOpen);
  };

  const handleInputChange = (e) => {
    setInputMessage(e.target.value);
  };

  // Function to process the API response and enhance links
  const processResponse = (responseHtml) => {
    const parser = new DOMParser();
    const doc = parser.parseFromString(responseHtml, "text/html");

    // Find all links and enhance them
    const links = doc.querySelectorAll("a");
    links.forEach((link) => {
      // Make sure all links have target="_blank" and rel attributes
      if (!link.getAttribute("target")) {
        link.setAttribute("target", "_blank");
      }
      if (!link.getAttribute("rel")) {
        link.setAttribute("rel", "noopener noreferrer");
      }
    });

    // Return the processed HTML
    return doc.body.innerHTML;
  };

  const handleSendMessage = async () => {
    if (inputMessage.trim() === "") return;

    // Add user message
    const userMessage = { text: inputMessage, isBot: false };
    setMessages((prevMessages) => [...prevMessages, userMessage]);
    setInputMessage("");
    setIsLoading(true);

    try {
      // Send message to backend
      const response = await fetch("http://localhost:5000/api/chat", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ message: inputMessage }),
      });

      const data = await response.json();

      // Process the response to enhance links
      const processedHtml = processResponse(data.response);

      // Add bot response (with processed HTML)
      setTimeout(() => {
        setMessages((prevMessages) => [
          ...prevMessages,
          { html: processedHtml, isBot: true },
        ]);
        setIsLoading(false);
      }, 500); // Small delay to make it feel more natural
    } catch (error) {
      console.error("Error sending message:", error);
      setMessages((prevMessages) => [
        ...prevMessages,
        {
          html: "<p>Sorry, I encountered an error. Please try again later.</p>",
          isBot: true,
        },
      ]);
      setIsLoading(false);
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === "Enter") {
      handleSendMessage();
    }
  };

  // Function to safely render HTML content
  const createMarkup = (htmlContent) => {
    return { __html: DOMPurify.sanitize(htmlContent) };
  };

  return (
    <div className="chatbot-container">
      {/* Chat toggle button */}
      <button className="chat-toggle" onClick={toggleChat}>
        {isOpen ? "✕" : "💬"}
      </button>

      {/* Chat window */}
      {isOpen && (
        <div className="chat-window">
          <div className="chat-header">
            <div className="chat-title">
              <h3>Krish Assistant</h3>
              <div className="company-logo-div">
                <img
                  src="./krish.svg"
                  alt="KrishTechnoLabs"
                  className="company-logo"
                />
              </div>
            </div>
          </div>
          <div className="messages-container">
            {messages.map((message, index) => (
              <div
                key={index}
                className={`message ${
                  message.isBot ? "bot-message" : "user-message"
                }`}
              >
                {message.text ? (
                  message.text
                ) : (
                  <div
                    dangerouslySetInnerHTML={createMarkup(message.html)}
                  ></div>
                )}
              </div>
            ))}
            {isLoading && (
              <div className="message bot-message loading">
                <div className="loading-dots">
                  <span></span>
                  <span></span>
                  <span></span>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>
          <div className="input-container">
            <input
              type="text"
              value={inputMessage}
              onChange={handleInputChange}
              onKeyPress={handleKeyPress}
              placeholder="Ask me about KrishTechnoLabs..."
              disabled={isLoading}
            />
            <button
              onClick={handleSendMessage}
              disabled={isLoading}
              className="send-button"
            >
              <svg
                width="24"
                height="24"
                viewBox="0 0 24 24"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  d="M22 2L11 13"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
                <path
                  d="M22 2L15 22L11 13L2 9L22 2Z"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            </button>
          </div>
          <div className="chatbot-footer">
            <span>Powered by KrishTechnoLabs AI</span>
          </div>
        </div>
      )}
    </div>
  );
};

export default ChatBot;
