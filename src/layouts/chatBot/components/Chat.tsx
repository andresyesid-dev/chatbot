import './styles/Chat.scss';
import React, { useState, useEffect, useRef } from 'react';
import { getDatabase, ref, onValue, push, set } from 'firebase/database';
import {
  formatDate,
  generateOpenaiResponse,
} from '../../../utils/globalFunctions';
import { generateChatbotResponse } from '../../../utils/chatbotResponse';

interface ChatProps {
  onChat: string | null;
  setOnChat: (chatId: string | null) => void;
}

interface MessageType {
  sender: string;
  message: string;
  date: string;
  typeIA: string;
}

interface MessageProps {
  sender: string;
  text: string;
  typeIA: string;
}

function Chat({ onChat, setOnChat }: ChatProps) {
    const [messages, setMessages] = useState<MessageType[]>([]);
    const [date, setDate] = useState<string>('');
    const [typeIA, setTypeChat] = useState<string>('chatbot');
    const [inputText, setInputText] = useState<string>('');
    const db = getDatabase();
    
    // Creamos un ref para el contenedor de la conversación.
    const chatConversationRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        if (onChat) {
        onValue(ref(db, '/chats/' + onChat), (snapshot) => {
            const data: MessageType[] = snapshot.val();
            setMessages(data || []);
            setDate(formatDate(data?.[0]?.date || ''));
        });
        }
    }, [db, onChat]);

    // Cada vez que los mensajes cambien se subirá el scroll
    useEffect(() => {
        if (chatConversationRef.current) {
        // Para un efecto suave se puede usar:
        chatConversationRef.current.scrollTo({ top: chatConversationRef.current.scrollHeight, behavior: 'smooth' });
        }
    }, [messages]);

    const handleInputChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        setInputText(event.target.value);
    };

    const handleKeyPress = (event: React.KeyboardEvent<HTMLInputElement>) => {
        if (event.key === 'Enter') {
        saveInputText();
        }
    };

    const saveInputText = () => {
        if (inputText) {
            if (onChat) {
                pushNewMessage();
            } else {
                pushNewChat();
            }
            setInputText(''); // Reinicia el input
        }
    };

    const pushNewChat = async () => {
        const fechaActual = new Date().toISOString();
        const newChat: MessageType[] = [
            {
                sender: 'user',
                message: inputText,
                date: fechaActual,
                typeIA: typeIA,
            },
        ];

        const newChatRef = push(ref(db, '/chats'));
        const newChatId = newChatRef.key;

        await set(newChatRef, newChat);
        setOnChat(newChatId);

        try {
            let response = '';
            if (typeIA === 'chatbot') {
                response = await generateChatbotResponse(inputText);
            } else {
                response = await generateOpenaiResponse(inputText);
            }
            const fechaActualBot = new Date().toISOString();
            const newBotMessage: MessageType = {
                sender: 'bot',
                message: response || '',
                date: fechaActualBot,
                typeIA: typeIA,
            };

            const updatedMessages = [...newChat, newBotMessage];
            await set(ref(db, '/chats/' + newChatId), updatedMessages);
        } catch (error) {
            console.error(
                'Error al generar la respuesta del bot:',
                (error as Error)?.message || error
            );
        }
    };

    const pushNewMessage = async () => {
        const fechaActual = new Date().toISOString();
        const newMessage: MessageType = {
        sender: 'user',
        message: inputText,
        date: fechaActual,
        typeIA: typeIA,
        };

        const updatedMessages = [...messages, newMessage];
        await set(ref(db, '/chats/' + onChat), updatedMessages);

        try {
        let response = '';
        if (typeIA === 'chatbot') {
            response = await generateChatbotResponse(inputText);
        } else {
            response = await generateOpenaiResponse(inputText);
        }
        const fechaActualBot = new Date().toISOString();
        const newBotMessage: MessageType = {
            sender: 'bot',
            message: response || '',
            date: fechaActualBot,
            typeIA: typeIA,
        };

        const updatedMessagesBot = [...updatedMessages, newBotMessage];
        await set(ref(db, '/chats/' + onChat), updatedMessagesBot);
        } catch (error) {
        console.error(
            'Error al generar la respuesta del bot:',
            (error as Error)?.message || error
        );
    }
};

  return (
        <section className="chat-content">
            {!onChat && (
                <div className="chat-welcome">
                    <div className="title">
                        <h1>Hello!</h1>
                        <img src="/chatbot_icon.png" alt="Chatbot Icon" />
                    </div>
                    <h2>How can I help you?</h2>
                    <div className="chat_options">
                        <button
                        onClick={() => setTypeChat('chatbot')}
                        className={`${typeIA === 'chatbot' ? 'selected' : ''}`}
                        >
                        ChatBot
                        </button>
                        <button
                        onClick={() => setTypeChat('openai')}
                        className={`${typeIA === 'openai' ? 'selected' : ''}`}
                        >
                        Openai
                        </button>
                    </div>
                </div>
            )}

            {onChat && (
                // Se agrega el ref aquí para poder manipular el scroll
                <div className="chat-conversation" ref={chatConversationRef}>
                    <div>
                        <h4>{date}</h4>
                    </div>
                    {messages.map((msg, index) => (
                        <Message
                        key={index}
                        sender={msg.sender}
                        text={msg.message}
                        typeIA={msg.typeIA}
                        />
                    ))}
                    <div className="space_chat"></div>
                </div>
            )}

            <div className="chat-box">
                <input
                type="text"
                placeholder="Send a message to ChatBot"
                value={inputText}
                onChange={handleInputChange}
                onKeyPress={handleKeyPress}
                />
                <div className="send-icon">
                    <img src="/send-white.png" alt="Send" />
                    <img src="/send-color.png" alt="Send" onClick={saveInputText} />
                </div>
            </div>
        </section>
    );
}

function Message({ sender, text, typeIA }: MessageProps) {
    return (
        <div className={sender === 'user' ? 'text_user' : 'text_bot'}>
            {sender === 'bot' && (
                <img src={`/${typeIA}_icon.png`} alt={`${typeIA} Icon`} />
            )}
            <p>{text}</p>
        </div>
    );
}

export default Chat;
