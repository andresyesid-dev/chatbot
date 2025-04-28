import './ChatBot.scss';
import BackgroundLights from '../../general-components/BackgroundLights';
import Chat from './components/Chat';
import RightMenu from './components/RightMenu';
import { useState } from 'react';

function ChatBot() {
    const [chatId, setChatId] = useState<string | null>(null);

    const updateChatId = (newChatId: string | null): void => {
        setChatId(newChatId);
    };

    return (
        <>
        <div className="chatbot-content">
            <section className="left-section">
            <Chat onChat={chatId} setOnChat={updateChatId} />
            </section>
            <section className="right-section">
            <RightMenu onChat={chatId} setOnChat={updateChatId} />
            </section>
        </div>
        <BackgroundLights />
        </>
    );
}

export default ChatBot;
