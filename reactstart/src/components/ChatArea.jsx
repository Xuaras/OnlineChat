import React, { useState, useEffect } from 'react';
import axios from 'axios';
import Cookies from 'js-cookie';
import online_img from './../images/shape.png';
import send_message from './../images/mail.png';
import '../static/css/Chat.css';

export function ChatArea() {
    const [chattingWith, setChatting] = useState(null);
    const [socket, setSocket] = useState(null);
    const [receiver, setReceiver] = useState(null);
    const [messages, setMessages] = useState([]);
    const [newMessage, setNewMessage] = useState('');

    useEffect(() => {
        axios.get(`http://127.0.0.1:8000/api/v1/chats/your_chat/?your_id=${Cookies.get('user_id')}`)
            .then(response => {
                setChatting(response.data);
                console.log('Chatting with:', response.data);
            }).catch(error => {
                console.log(error);
            });
    }, []);

    useEffect(() => {
        if (chattingWith) {
            axios.get(`http://localhost:8000/api/v1/users/${chattingWith.chatting_with}/`, { withCredentials: true })
                .then(response => {
                    setReceiver(response.data);
                    console.log('Receiver:', response.data);
                })
                .catch(error => {
                    console.error(error);
                });
        }
    }, [chattingWith]);

    useEffect(() => {
        if (chattingWith) {
            setMessages([]); // Очистка состояния сообщений при новом подключении
            const ws = new WebSocket('ws://localhost:8000/ws/some/');
    
            ws.onopen = function () {
                console.log('WebSocket connection opened');
                const senderId = Cookies.get('user_id');
                const receiverId = chattingWith.chatting_with;
                const initMessage = { sender_id: senderId, receiver_id: receiverId };
                console.log('Sending initial message:', initMessage);
                ws.send(JSON.stringify(initMessage));
            };
    
            ws.onmessage = function (event) {
                setMessages([]);
                const data = JSON.parse(event.data);
                console.log('Received message:', data);
                setMessages(prevMessages => [...prevMessages, ...data]);
            };
    
            ws.onclose = function (event) {
                console.log('WebSocket connection closed:', event);
            };
    
            ws.onerror = function (error) {
                console.error('WebSocket error:', error);
            };
    
            setSocket(ws);
    
            return () => ws.close();
        }
    }, [chattingWith]);

    const sendMessage = () => {
        if (socket && newMessage.trim() !== '') {
            const senderId = Cookies.get('user_id');
            const receiverId = chattingWith.chatting_with;
            const messageData = {
                sender_id: senderId,
                receiver_id: receiverId,
                content: newMessage
            };

            // Отправка сообщения через WebSocket
            console.log('Sending message:', messageData);
            socket.send(JSON.stringify(messageData));
            setNewMessage('');
        }
    };

    if (!receiver) {
        return null; // Или заглушка, пока данные не загрузятся
    }

    return (
        <>
            <div className="nick_name_area">
                <img src={receiver.avatar} alt="" className='friend_avatar' />
                <span>{receiver.username}</span>
                <span className="online">online</span>
                <img src={online_img} alt="" className="online_circle" />
            </div>

            <div className="chat_message_area">
                {messages.map((message, index) => (
                    <div key={index} className={message.sender_id === parseInt(Cookies.get('user_id')) ? 'message' : 'friend_message'}>
                        <img src={message.sender_id === parseInt(Cookies.get('user_id')) ? Cookies.get('user_avatar') : receiver.avatar} alt="Avatar" />
                        <p className={message.sender_id === parseInt(Cookies.get('user_id')) ? 'message_text' : 'friend_message_text'}>
                            {message.content}
                        </p>
                    </div>
                ))}
            </div>
            <div className="message_input_area">
                <input
                    type="text"
                    className='input_message'
                    value={newMessage}
                    onChange={(e) => setNewMessage(e.target.value)}
                />
                <button className="send_message_bt" type="button" onClick={sendMessage}>
                    <img src={send_message} alt="Send" />
                </button>
            </div>
        </>
    );
}
