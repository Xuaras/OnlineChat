import axios from "axios";
import { useState, useEffect } from "react";
import Cookies from 'js-cookie';

export function Chats() {
    const [userData, setUserData] = useState(null);
    const [users, setUsers] = useState([]); // Состояние для данных пользователя
    const [friends, setFriends] = useState([]); // Состояние для списка друзей
    const [chat, setChat] = useState(null); // Состояние для выбранного чата, изначально null
    
    // Загрузка данных пользователя при монтировании компонента
    useEffect(() => {
        axios.get('http://localhost:8000/api/v1/Current/', { withCredentials: true })
            .then(response => {
                setUserData(response.data);
            })
            .catch(error => {
                console.error(error);
            });
    }, []);

    // Загрузка списка друзей пользователя и установка начального чата
    useEffect(() => {
        if (userData) {
            axios.get(`http://localhost:8000/api/v1/Friends/${userData.id}/`, { withCredentials: true })
                .then(response => {
                    const friendsData = response.data;
                    setFriends(friendsData);
    
                    if (friendsData.length === 0) {
                        setChat(null); // Сбрасываем выбранный чат, так как нет друзей
                        axios.get('http://127.0.0.1:8000/api/v1/Users/', {
                            params: {
                                exclude_ids: userData.id
                            },
                            withCredentials: true
                        })
                        .then(response => {
                            setUsers(response.data);
                        })
                        .catch(error => {
                            console.error(error);
                        });
                    } else {
                        const excludeIds = [...friendsData.map(friend => friend.friend_id), userData.id].join(',');
                        axios.get('http://127.0.0.1:8000/api/v1/Users/', {
                            params: {
                                exclude_ids: excludeIds
                            },
                            withCredentials: true
                        })
                        .then(response => {
                            setUsers(response.data);
                        })
                        .catch(error => {
                            console.error(error);
                        });
                    }
                })
                .catch(error => {
                    console.error('Ошибка при получении данных о друзьях:', error);
                });
        }
    }, [userData, setUsers, setFriends, setChat]);
     // Зависимость от userData, чтобы загрузить данные друзей после получения данных пользователя
     const addtoFriend = (userId) => {
        axios.post('http://localhost:8000/api/v1/Friend/', { user1: userData.id, user2: userId, status: 'added' }, { withCredentials: true })
            .then(response => {
                console.log('Друг успешно добавлен:', response.data);
                // Можно обновить список друзей или выполнить другие действия после успешного добавления
            })
            .catch(error => {
                console.error('Ошибка при добавлении друга:', error);
            });
    };
    // Функция для выбора чата с другом
    const toggleChat = (friendId) => {
        setChat(friendId); // Установка выбранного чата
        Cookies.set('friend_chat_id', friendId); // Сохранение выбранного чата в cookies
    };

    if (friends !== null) {
        return (
            <>
                <div className="friend_list">
                    {friends.map(item => (
                        <div
                            className={chat === item.friend_id ? 'chat_active' : 'chat'} // Добавляем класс 'chat_active' для активного чата
                            key={item.friend_id}
                            onClick={() => toggleChat(item.friend_id)} // Вызов toggleChat при клике на элемент списка
                        >
                            <img src={`http://127.0.0.1:8000${item.friend_avatar}`} alt="Аватар друга" />
                            <span className="chat_name">{item.friend_name}</span>
                        </div>
                    ))}
                </div>
                <div className="user_list">
                    <h3>Potential friend</h3>
                    {users.map(item=>(
                        <div className="potential_friend">
                            <img src={item.avatar} alt="" />
                            <span>{item.username}</span>
                            <button onClick={()=>addtoFriend(item.id)}>Add</button>
                        </div>
                    ))}
                </div>
            </>
        );
    } else {
        return (
            <>
                <div className="user_list">
                    <h3>Potensial friend</h3>
                    {users.map(item=>(
                        <div className="potensial_friend">
                            <img src={item.avatar} alt="" />
                            <span>{item.username}</span>
                            <button onClick={()=>addtoFriend(item.id)}>Add</button>
                        </div>
                    ))}
                </div>
            </>
        );
    }
}
