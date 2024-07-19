import axios from "axios";
import { useState, useEffect, useRef } from "react";
import Cookies from 'js-cookie';

export function Chats() {
    const [allUsersData, setUsers] = useState([]);
    const [currentChat, setChat] = useState(null);
    const [activeFriend, setActiveFriend] = useState(null);

    const toggleChat = (item) => {
        setChat(item.id);
        setActiveFriend(item.id);
        
        const data = {
            user: Cookies.get('user_id'),
            chatting_with: item.id,
        };
        axios.post('http://127.0.0.1:8000/api/v1/chats/', data)
        .then(response => {
            console.log(response.data);
        })
        .catch(error => {
            console.error(error);
        });
    };

    useEffect(() => {
        axios.get(`http://127.0.0.1:8000/api/v1/users/exclude_ids/?exclude_ids=${Cookies.get('user_id')}`)
        .then(response => {
            setUsers(response.data);
            console.log(response.data);

            if (response.data.length > 0) {
                const firstUser = response.data[0];
                setActiveFriend(firstUser.id);
                setChat(firstUser.id);

                const data = {
                    user: Cookies.get('user_id'),
                    chatting_with: firstUser.id,
                };
                axios.post('http://127.0.0.1:8000/api/v1/chats/', data)
                .then(response => {
                    console.log(response.data);
                })
                .catch(error => {
                    console.error(error);
                });
            }
        })
        .catch(error => {
            console.error(error);
        });
    }, []);

    return (
        <>
            <div className="user_list">
                <span>Other Users</span>
                {allUsersData.map((item) => {
                    return (
                        <div 
                            key={item.id} 
                            className={`potential_friend ${activeFriend === item.id ? 'active' : ''}`} 
                            onClick={() => toggleChat(item)}
                        >
                            <img src={item.avatar} alt="" />
                            <span>{item.username}</span>
                            {/* <button>add</button> */}
                        </div>
                    );
                })}
            </div>
        </>
    );
}
