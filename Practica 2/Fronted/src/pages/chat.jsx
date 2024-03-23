import React, { useState, useRef, useEffect } from 'react';
import './css/chat.css'; // Estilos CSS para el chat popup
import axios from 'axios'; // Importar axios para hacer la solicitud HTTP

const Chat = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [messageInput, setMessageInput] = useState('');
  const [messages, setMessages] = useState([]);
  const messagesEndRef = useRef(null); // Referencia al final del contenedor de mensajes

  const toggleChat = () => {
    setIsOpen(!isOpen);
  };

  const handleInputChange = (event) => {
    setMessageInput(event.target.value);
  };

  const handleKeyDown = (event) => {
    if (event.key === 'Enter') {
      event.preventDefault(); // Prevenir el comportamiento por defecto del Enter (nueva línea)
      sendMessage();
    }
  };

  const sendMessage = () => {
    if (messageInput.trim() !== '') {
      // Añadir el nuevo mensaje del usuario al estado de mensajes
      const userMessage = { text: messageInput, sender: 'user sent' };
      setMessages([...messages, userMessage]);
      setMessageInput(''); // Limpiar el mensaje de entrada
  
      // Realizar la solicitud HTTP con axios
      axios.post('http://localhost:8081/interactua_bot', { texto: messageInput, id_conv: '' })
        .then((response) => {
          console.log(JSON.stringify(response.data));
          // Puedes manejar la respuesta aquí si es necesario
          // Aquí es donde puedes añadir el mensaje del bot al estado de mensajes
          response.data.forEach((item) => {
            const botMessage = { text: item['content'], sender: 'bot received' };
             // Agregar el mensaje del bot al estado de mensajes
             setMessages(prevMessages => [...prevMessages, botMessage]);
          });
          
        })
        .catch((error) => {
          console.log(error);
        });
    }
  };
  

  // Función para hacer scroll automático hacia abajo
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  // Hacer scroll automático cada vez que se actualiza la lista de mensajes
  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  return (
    <div className="chat-container">
      <button className={`chat-btn ${isOpen ? 'hidden' : ''}`} onClick={toggleChat}>
        <img src="/src/assets/bot.png" alt="Chat" className="bot-image"/> {/* Utiliza la imagen en lugar del texto */}
      </button>
      <div className={`chat-popup ${isOpen ? 'open' : ''}`}>
        <div className="chat-header">
          <button className="minimize-btn" onClick={toggleChat}>
            -
          </button>
          <div className="titulo-chat">Chatbot Funadex</div>
        </div>
        <div className="chat-content">
          <div className="messages">
            {messages.map((message, index) => (
              <div key={index} className={`message ${message.sender}`}>
                {message.text}
              </div>
            ))}
            <div ref={messagesEndRef} /> {/* Referencia al final del contenedor de mensajes */}
          </div>
        </div>
        <div className="chat-footer">
          <input
            type="text"
            placeholder="Escribe un mensaje..."
            value={messageInput}
            onChange={handleInputChange}
            onKeyDown={handleKeyDown} // Manejador de evento para la tecla Enter
            className="message-input"
          />
          <button className="send-btn" onClick={sendMessage}>
            Enviar
          </button>
        </div>
      </div>
    </div>
  );
};

export default Chat;
