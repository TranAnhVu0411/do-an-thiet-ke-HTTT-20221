import React from "react"
import { useNavigate } from "react-router-dom";
import Logo from "../../image/logo.png";
import "./style.scss";

const Header = () => {
    const navigate = useNavigate()
    return (
        <div className="header">
            <div className='logo' onClick = {() => navigate('/')} style={{cursor: "pointer"}}>
                <img src={Logo} alt='' />
                <h1>Sách Nói Online</h1>
            </div>
        </div>
    )
}

export default Header