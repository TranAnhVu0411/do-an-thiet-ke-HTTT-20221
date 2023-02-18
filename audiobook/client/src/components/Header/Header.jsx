import React from "react"
import Logo from "../../image/logo.png";
import "./style.scss";

const Header = () => {
    return (
        <div className="header">
            <div className='logo'>
                <img src={Logo} alt='' />
                <h1>Sách Nói Online</h1>
            </div>
        </div>
    )
}

export default Header