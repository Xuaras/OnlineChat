import './App.css';
import './static/css/Settings.css';
import './static/css/Profile.css';
import './static/css/Chat.css';
import './static/css/Login.css';
import Cookies from 'js-cookie';
import user_img from './images/user.png';
import chats_img from './images/comment.png';
import setting_img from './images/settings.png';
import logout_img from './images/logout.png';
import { Chats } from './components/Chats';
import { ChatArea } from './components/ChatArea';
import { Settings } from './components/SettingsArea';
import { useState, useEffect } from 'react';
import axios from 'axios';
import { Profile } from './components/ProfileArea';

function App() {
    const [state, setState] = useState(1);
    const [user,setUser] = useState([]);
    const [form, setForm] = useState(1);
    const [message,setMessage] = useState(false);
    const [messageStatus,setMessageStatus] = useState(false);
    const [messageContent, setMessageContent] = useState('');
    const toggleTab = (index) => {
        setState(index);
    };

    const toggleForm = (index) => {
        setForm(index);
    };
    
    const toggleMessage = (status) =>{
        setMessage(status);
    }

    const handleLogin = (e) => {
        e.preventDefault();
        const username = e.target.username.value;
        const password = e.target.password.value;
        axios.post('http://localhost:8000/api/v1/users/login/', { username, password }, { withCredentials: true })
            .then(response => {
                const token = response.data.token;
                Cookies.set('token', token, { expires: 1 });
                Cookies.set('user_avatar','http://127.0.0.1:8000'+response.data.user.avatar);
                Cookies.set('user_id',response.data.user.id);
                setUser(response.data.user);  // Сохраняем токен в Cookies на 7 дней
            })
            .catch(error => {
                console.error(error);
                setMessage(true);
                setMessageContent('Проверьте логин или пароль');
            });
    };

    const handleRegister = (e) => {
        e.preventDefault();
        const username = e.target.username.value;
        const email = e.target.email.value;
        const password = e.target.password.value;
        axios.post('http://localhost:8000/api/v1/users/register/', { username, email, password }, { withCredentials: true })
            .then(response => {
                const feedback = {'status':'Success registration'};
                setMessage(true);
                setMessageContent('Вы зарегистрировались, войдите в аккаунт');
                setMessageStatus(true);
            })
            .catch(error => {
                console.error(error);
                setMessageContent('Такой пользователь уже существует');
                setMessageStatus(false);
                setMessage(true);
            });
    };

    const handleLogout = () => {
        axios.post('http://localhost:8000/api/v1/users/logout/', {}, {
            headers: {
                Authorization: `Token ${Cookies.get('token')}`
            }
        })
        .then(response => {
            Cookies.remove('token');
            Cookies.remove('user_id');
            Cookies.remove('user_avatar'); // Удаляем токен из Cookies
            setUser(null); // Очищаем состояние пользователя
        })
        .catch(error => {
            console.error('Logout error:', error);
        });
    };

    if (Cookies.get('token')==null){
        return (
            <>
            <div className={message === false ? 'info_message' : 'info_message_active'}>
                <span>{messageContent}</span>
                {messageStatus?( <svg width="40" height="40" viewBox="0 0 40 40" xmlns="http://www.w3.org/2000/svg">
                    <path d="M14 30l-7-7 2-2 5 5 15-15 2 2-17 17z" fill="green"/>
                </svg>):<svg width="40" height="40" viewBox="0 0 40 40" xmlns="http://www.w3.org/2000/svg">
                    <path d="M10 10L30 30M30 10L10 30" stroke="red" stroke-width="4"/>
                </svg>}
            </div>
            <div className="container">
                <div className="block">
                    <section className="block_item">
                        <h2>У вас есть аккаунт?</h2>
                        <button className="sign-in" onClick={() => toggleForm(1)}>Login</button>
                    </section>
                    <section className="block_item">
                        <h2>У вас нет аккаунта?</h2>
                        <button className="sign-up" onClick={() => toggleForm(2)}>Register</button>
                    </section>
                </div>
                <div className={form === 1 ? 'form_box' : 'form_box_active'}>
                    {form === 1 ? (
                        <form className='form form_signin' onSubmit={handleLogin}>
                            <h3 className='form_title'>Вход</h3>
                            <p>
                                <input type="text" name="username" className='form_input' placeholder='username'/>
                            </p>
                            <p>
                                <input type="password" name="password" className='form_input' placeholder='password'/>
                            </p>
                            <p>
                                <button type="submit">Вход</button>
                            </p>
                        </form>
                    ) : (
                        <form className='form form_signup' onSubmit={handleRegister}>
                            <h3 className='form_title'>Регистрация</h3>
                            <p>
                                <input type="text" name="username" className='form_input' placeholder='username'/>
                            </p>
                            <p>
                                <input type="password" name="password" className='form_input' placeholder='password'/>
                            </p>
                            <p>
                                <input type="email" name="email" className='form_input' placeholder='email'/>
                            </p>
                            <p>
                                <button type="submit">Зарегистрироваться</button>
                            </p>
                        </form>
                    )}
                </div>
            </div>
            </>
        );
    }
        return (
            <div className="application">
                    {console.log(user)}
                <div className="nav">
                    <div className={state === 1 ? "nav_item_active" : "nav_item"} onClick={() => toggleTab(1)}>
                        <img src={user_img} alt=""/>
                        <span>Profile</span>
                    </div>
                    <div className={state === 2 ? "nav_item_active" : "nav_item"} onClick={() => toggleTab(2)}>
                        <img src={chats_img} alt=""/>
                        <span>Chats</span>
                    </div>
                    <div className={state === 3 ? "nav_item_active" : "nav_item"} onClick={() => toggleTab(3)}>
                        <img src={setting_img} alt=""/>
                        <span>Settings</span>
                    </div>
                    <div className="nav_item" onClick={handleLogout}>
                        <img src={logout_img} alt=""/>
                        <span>Log out</span>
                    </div>
                </div>
                <div className="main_content">
                    <div className="chat_wrapper">
                        <div className="main_area">
                        {state === 1 && <Profile/>}
                        {state === 2 && <ChatArea/>}
                        </div>
                    </div>
                    <div className="another_menu">
                        <div className="chat_list">
                            <input type="text" placeholder="search"/>
                            <div className="chats">
                                <Chats/>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        );
    }
export default App;
