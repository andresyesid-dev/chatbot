import './styles/RightMenu.scss';
import React, { useState, useEffect } from 'react';
import { getDatabase, ref, onValue, remove } from 'firebase/database';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faPlus, faTrash } from '@fortawesome/free-solid-svg-icons';
import { formatDate } from '../../../utils/globalFunctions';
import AlertDialog from '../../../general-components/AlertDialog';

interface RightMenuProps {
    onChat: string | null;
    setOnChat: (chatId: string | null) => void;
}

// Datos para cada chat en la lista
export interface ChatData {
    id: string;
    startConvers: string;
}

// Agrupación de chats por día
interface ChatsOrderDay {
    [key: string]: ChatData[];
}

interface ChatListProps {
    chatId: string;
    chatText: string;
    isSelected: boolean;
    onClick: () => void;
    handleButtonDelete: (event: React.MouseEvent, chatId: string) => void;
}

interface ChatItem {
    date: string;
    message: string;
}

function RightMenu({ onChat, setOnChat }: RightMenuProps) {
    const [chatsOrderDay, setChatsOrderDay] = useState<ChatsOrderDay>({});
    const [alertDelete, setAlertDelete] = useState<string | false>(false);
    const db = getDatabase();

    useEffect(() => {
        const chatsRef = ref(db, '/chats');
        onValue(chatsRef, (snapshot) => {
        const chats = snapshot.val();
        const newOrderDay: ChatsOrderDay = {};
        const tempArray: { date: string; data: ChatData }[] = [];

        Object.entries(chats as { [key: string]: ChatItem[] }).forEach(([key, value]) => {
            // Verificamos que value es un arreglo y tiene al menos un elemento
            if (Array.isArray(value) && value.length > 0) {
                const chatItem = value[0];
                const date = formatDate(chatItem.date);
                let startConvers = chatItem.message.trim();
            if (startConvers.length > 29) {
                startConvers = `${startConvers.slice(0, 29)}...`;
            }
            tempArray.push({ date, data: { id: key, startConvers } });
            }
        });

        // Invertir el arreglo temporal para mostrar chats más recientes primero
        tempArray.reverse().forEach(({ date, data }) => {
            if (!newOrderDay[date]) {
            newOrderDay[date] = [];
            }
            newOrderDay[date].push(data);
        });

        setChatsOrderDay(newOrderDay);
        });
    }, [db, onChat]);

    const handleButtonDelete = (event: React.MouseEvent, chatId: string) => {
        event.stopPropagation();
        setAlertDelete(chatId);
    };

    const handleAlertDelete = async (choosing: boolean) => {
        if (choosing && alertDelete) {
        setOnChat(null);
        await remove(ref(db, '/chats/' + alertDelete));
        }
        setAlertDelete(false);
    };

    return (
        <section className="right-menu-content">
        <section>
            <h2>Chats</h2>
            <div className="new-chat" onClick={() => setOnChat(null)}>
            <span>
                <FontAwesomeIcon icon={faPlus} />
            </span>
            New chat
            </div>
        </section>
        <div className="list-chats-content">
            {Object.entries(chatsOrderDay).map(([day, values]) => (
            <div key={day}>
                <p className="day">{day}</p>
                {values.map((chat) => (
                <ChatList
                    key={chat.id}
                    chatId={chat.id}
                    chatText={chat.startConvers}
                    isSelected={onChat === chat.id}
                    handleButtonDelete={handleButtonDelete}
                    onClick={() => setOnChat(chat.id)}
                />
                ))}
            </div>
            ))}
        </div>
        {alertDelete && (
            <AlertDialog
            title="¿Quieres eliminar este chat?"
            description="Se eliminará permanentemente de tu lista de historial de chats."
            response={handleAlertDelete}
            />
        )}
        </section>
    );
}

function ChatList({
    chatId,
    chatText,
    isSelected,
    onClick,
    handleButtonDelete,
}: ChatListProps) {
    return (
        <section
            className={`chat-list-text ${isSelected ? 'selected' : ''}`}
            onClick={onClick}
            >
            <p>
                {chatText}
                <span onClick={(event) => handleButtonDelete(event, chatId)}>
                <FontAwesomeIcon icon={faTrash} />
                </span>
            </p>
        </section>
    );
}

export default RightMenu;
