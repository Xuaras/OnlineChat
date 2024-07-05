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
    const toggleTab = (index) => {
        setState(index);
    };

    const [form, setForm] = useState(1);
    const toggleForm = (index) => {
        setForm(index);
    };

    const handleLogin = (e) => {
        e.preventDefault();
        const username = e.target.username.value;
        const password = e.target.password.value;
        axios.post('http://localhost:8000/api/v1/Login/', { username, password }, { withCredentials: true })
            .then(response => {
                setUser(response.data);
            })
            .catch(error => {
                console.error(error);
                alert('Ошибка при входе');
            });
    };

    const handleRegister = (e) => {
        e.preventDefault();
        const username = e.target.username.value;
        const email = e.target.email.value;
        const password = e.target.password.value;
        axios.post('http://localhost:8000/api/v1/Register/', { username, email, password }, { withCredentials: true })
            .then(response => {
                setUser(response.data);
            })
            .catch(error => {
                console.error(error);
                alert('Ошибка при регистрации');
            });
    };

    const handleLogout = () => {
        axios.post('http://localhost:8000/api/v1/Logout/', {}, { withCredentials: true })
            .then(response => {
                setUser(null);
                Cookies.remove('friend_chat_id');
            })
            .catch(error => {
                console.error(error);
            });
    };

    const [user, setUser] = useState(null);
    useEffect(() => {
        axios.get('http://localhost:8000/api/v1/Current/', { withCredentials: true })
            .then(response => {
                if (response.data && !response.data.error) {
                    setUser(response.data);
                } else {
                    console.error('User is not authenticated:', response.data.error);
                    setUser(null);
                }
            })
            .catch(error => {
                console.error('Error fetching current user:', error);
                setUser(null); // Set user to null if there's an error
            });
    }, []);
    if (!user){
        return (
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
        );
    }
        return (
            <div className="application">
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
                            {state === 3 && <Settings/>}
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
