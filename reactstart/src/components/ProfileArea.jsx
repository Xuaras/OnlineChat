import axios from 'axios';
import { useEffect, useState } from "react";
import { useRef } from 'react';
import profile_wallpaper from '.././images/profile_wallpaper.jpg'
import profile_ico from '.././images/user.png'



export function Profile() {
    const [userData, setUserData] = useState([]);
    const fileInputRef = useRef(null); 
    useEffect(() => {
        axios.get('http://localhost:8000/api/v1/Current/', { withCredentials: true })
            .then(response => {
                setUserData(response.data);
            })
            .catch(error => {
                console.error(error);
            });
    }, []);
    const handleImageClick = () => {
        fileInputRef.current.click(); // Имитируем клик на скрытый инпут
    };
    const handleFileChange = (event) => {
        const file = event.target.files[0];
        if (file) {
            const formData = new FormData();
            formData.append('avatar', file);

            axios.put(`http://127.0.0.1:8000/api/v1/User_avatar/${userData.username}/`, formData, {
                headers: {
                    'Content-Type': 'multipart/form-data'
                }
            })
            .then(response => {
                window.location.reload(); // Обновляем изображение после успешной загрузки
            })
            .catch(error => {
                console.error('Error uploading file:', error);
            });
        }
    };

    const HoverComponent = () => {
        const [isHovered, setIsHovered] = useState(false);

        const handleMouseEnter = () => {
            setIsHovered(true);
        };

        const handleMouseLeave = () => {
            setIsHovered(false);
        };
        return (
            <>
                <input
                    ref={fileInputRef}
                    type="file"
                    style={{ display: 'none' }}
                    onChange={handleFileChange}
                />
                
                <svg width="100" height="100" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className={isHovered ? 'upload_image_active' : 'upload_image'} onMouseEnter={handleMouseEnter}
                    onMouseLeave={handleMouseLeave}
                    onClick={handleImageClick}>
                    <path d="M12 2L6 8H10V22H14V8H18L12 2Z" fill="white"/>
                </svg>  
                
                <img 
                className={isHovered ? 'profile_image_active':'profile_image'}
                src={`http://127.0.0.1:8000${userData.avatar}`} // я так и не понял почему оно работает только с указанием локал хоста
                onMouseEnter={handleMouseEnter}
                onMouseLeave={handleMouseLeave}
                onClick={handleImageClick}
                alt=""/>
            </>
        );
    };
    return (
        <div className='profile_area'>
            <div className="user_preview">
                <div className="profile_wallpaper">
                    <img src={profile_wallpaper} alt="" className='profile_wall'/>
                </div>
                <HoverComponent />
                <div className='brief_infromation'>
                    <span><b>{userData.username}</b></span>
                    <span>{userData.email}</span>
                </div>
                <div className='profile_info'>
                    <div className='profile_item'>
                            <span><b>Full name</b></span>
                            <input type="text"/>
                            <img src={profile_ico} alt="" />
                    </div>
                    <div className='profile_item'>
                        <span><b>Username</b></span>
                        <input type="text" defaultValue={userData.username}/>
                        <img src={profile_ico} alt=""/>
                    </div>
                    <div className='profile_item'>
                        <span><b>Title</b></span>
                        <input type="text" />
                        <img src={profile_ico} alt="" />
                    </div>
                </div>
            </div>
        </div>
    );
}