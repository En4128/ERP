
import React, { createContext, useState, useContext, useEffect } from 'react';

const ChatContext = createContext();

export const ChatProvider = ({ children }) => {
    const [isChatOpen, setIsChatOpen] = useState(false);
    const [messages, setMessages] = useState(() => {
        const saved = localStorage.getItem('chatbot_messages');
        if (saved) {
            try {
                const parsed = JSON.parse(saved);
                // Convert string dates back to Date objects
                return parsed.map(msg => ({
                    ...msg,
                    timestamp: new Date(msg.timestamp)
                }));
            } catch (e) {
                console.error('Error parsing saved messages:', e);
            }
        }
        return [
            { text: 'Hi! I am the Campus Bot. 🤖\nHow can I help you today?', sender: 'bot', timestamp: new Date() }
        ];
    });

    useEffect(() => {
        localStorage.setItem('chatbot_messages', JSON.stringify(messages));
    }, [messages]);

    const toggleChat = () => setIsChatOpen(prev => !prev);
    const openChat = () => setIsChatOpen(true);
    const closeChat = () => setIsChatOpen(false);
    const clearMessages = () => setMessages([
        { text: 'Hi! I am the Campus Bot. 🤖\nHow can I help you today?', sender: 'bot', timestamp: new Date() }
    ]);

    return (
        <ChatContext.Provider value={{
            isChatOpen,
            toggleChat,
            openChat,
            closeChat,
            messages,
            setMessages,
            clearMessages
        }}>
            {children}
        </ChatContext.Provider>
    );
};

export const useChat = () => useContext(ChatContext);
