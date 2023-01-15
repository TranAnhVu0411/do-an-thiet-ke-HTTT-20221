import React, {useState, useEffect} from "react";
import {main_axios_instance} from '../../service/custom-axios';
import {BiBook, BiBookReader} from "react-icons/bi"
import "./style.scss"

const DashBoard = () => {
    const [totalBook, setTotalBook] = useState(0)
    const [totalUser, setTotalUser] = useState(1)
    useEffect(() => {
        const fetchData = async () => {
            const bookres = await main_axios_instance.get("/book/total/");
            const userres = await main_axios_instance.get("/user/total/");
            setTotalBook(bookres.data.total);
            setTotalUser(userres.data.total);
        }
        fetchData();
    }, []);

    return (
        <div className="dashboard">
            <div className="total">
                <div className="total-element">
                    <BiBook className="icon"/>
                    <h1>Tổng số sách hiện có: {totalBook}</h1>
                </div>
                <div className="total-element">
                    <BiBookReader className="icon"/>
                    <h1>Tổng số tài khoản đăng ký: {totalUser}</h1>
                </div>
            </div>
            <div className="report">
                
            </div>
        </div>
    )
}

export default DashBoard;