import theme from '.././images/theme.png';
import padlock from '.././images/padlock.png'
import { useState } from 'react';
export function Settings(){
    const [settings_state, set_settings_state] = useState(1);
    const toggleTab = (index)=>{
        set_settings_state(index);
    }
    return(
    <>
        <div className="main_settings">
            <div className={settings_state === 1 ? "settings_item_active" : "settings_item" } onClick={()=> toggleTab(1)}>
                Theme
                <img src={theme} alt="" />
            </div>
            <div className={settings_state === 2 ? "settings_item_active" : "settings_item" } onClick={()=> toggleTab(2)}>
                Privacy
                <img src={padlock} alt=""/>
            </div>
            <div className={settings_state === 3 ? "settings_item_active" : "settings_item" } onClick={()=> toggleTab(3)}>
                Some
            </div>
        </div>
        <div class="settings_usage">
            {settings_state === 1 && ''}
        </div>
    </>
    );
}