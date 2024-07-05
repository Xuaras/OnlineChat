// Часть отвечающая  за сам чат (написано очень каряво)
import React, { useState, useEffect } from 'react';
import axios from 'axios';
import Cookies from 'js-cookie';
import online_img from './../images/shape.png';
import send_message from './../images/mail.png';
import { mergeMessages } from './../mergedMessages.js';
import '../static/css/Chat.css';

export function ChatArea() {
    const [userData, setUserData] = useState({});
    const [friendData, setFriendData] = useState({});
    const [myMessages, setMyMessages] = useState([]);
    const [friendMessages, setFriendMessages] = useState([]);
    const [messageInput, setMessageInput] = useState('');

    useEffect(() => {
        axios.get('http://localhost:8000/api/v1/Current/', { withCredentials: true })
            .then(response => {
                setUserData(response.data);
            })
            .catch(error => {
                console.error('Error fetching current user:', error);
            });
    }, []);

    useEffect(() => {
        if (userData.id && Cookies.get('friend_chat_id')) {
            fetchMyMessages();
        }
    }, [userData.id]);

    useEffect(() => {
        if (Cookies.get('friend_chat_id') && userData.id) {
            fetchFriendMessages();
        }
    }, [Cookies.get('friend_chat_id'), userData.id]);

    useEffect(() => {
        if (Cookies.get('friend_chat_id')) {
            fetchFriendData();
        }
    }, [Cookies.get('friend_chat_id')]);

    useEffect(() => {
        const interval = setInterval(() => {
            if (Cookies.get('friend_chat_id')) {
                fetchFriendData();
                fetchMyMessages();
                fetchFriendMessages();
            }
        }, 500); // Сделал через полинг, потому что на websockets пока мозгов не хватило

        return () => clearInterval(interval);
    }, []);

    const fetchFriendData = () => {
        
        axios.get(`http://localhost:8000/api/v1/Users/${Cookies.get('friend_chat_id')}/`, { withCredentials: true })
            .then(response => {
                setFriendData(response.data);
            })
            .catch(error => {
                console.error('Error fetching friend data:', error);
            });
    };

    const fetchMyMessages = () => {
        if(Object.keys(friendData).length > 0){
        axios.get(`http://127.0.0.1:8000/api/v1/Messages/${userData.id}/${Cookies.get('friend_chat_id')}/`)
            .then(response => {
                setMyMessages(response.data);
            })
            .catch(error => {
                console.error('Error fetching my messages:', error);
            });}
    };

    const fetchFriendMessages = () => {
        if(Object.keys(friendData).length > 0){
        axios.get(`http://127.0.0.1:8000/api/v1/Messages/${Cookies.get('friend_chat_id')}/${userData.id}/`)
            .then(response => {
                setFriendMessages(response.data);
            })
            .catch(error => {
                console.error('Error fetching friend messages:', error);
            });}
    };


    const sendMessage = () => {
        const messageContent = messageInput.trim();
        if (messageContent === '') {
            alert('Please enter a message.');
            return;
        }

        const newMessage = {
            sender: userData.id,
            receiver: Cookies.get('friend_chat_id'),
            content: messageContent,
            time_of_message: new Date().toISOString(),
        };

        axios.post(`http://127.0.0.1:8000/api/v1/Message/`, newMessage)
            .then(response => {
                fetchFriendData();
                fetchMyMessages();
                fetchFriendMessages();
                setMessageInput('');
            })
            .catch(error => {
                console.error('Error sending message:', error);
            });
    };
    {console.log(friendData);}
    if (Object.keys(friendData).length === 0) {
        return (
            <>
                <div className='without_friend'>
                    У вас пока нету друзей
                </div>
            </>
        );
    } else {
        return (
            <>
                <div className="nick_name_area">
                    <img src={friendData.avatar} alt="" className='friend_avatar'/>
                    <span>{friendData.username}</span>
                    <span className="online">online</span>
                    <img src={online_img} alt="" className="online_circle"/>
                </div>
                <div className="chat_message_area">
                    {mergeMessages(myMessages, friendMessages)
                        .sort((msg1, msg2) => new Date(msg1.time_of_message) - new Date(msg2.time_of_message))
                        .map((msg, index) => {
                            const isOwnMessage = msg.sender === userData.id;
                            return (
                                <div key={msg.id} className={`message ${isOwnMessage ? 'own_message' : 'friend_message'}`}>
                                    <img src={isOwnMessage ? `http://127.0.0.1:8000${userData.avatar}` : friendData.avatar} alt={isOwnMessage ? "My Avatar" : "Friend's Avatar"} className="message_avatar"/>
                                    <p className={`message_text ${isOwnMessage ? '' : 'friend_message_text'}`}>{msg.content}</p>
                                </div>
                            );
                        })}
                </div>
                <input
                    type="text"
                    name="input_message"
                    id="input_message"
                    placeholder="Your message"
                    className='input_message'
                    value={messageInput}
                    onChange={(e) => setMessageInput(e.target.value)}
                />
                <button className="send_message_bt" type="submit" onClick={sendMessage}><img src={send_message} alt="Send"/></button>
            </>
        );
    }
}
