import React, {useState, useEffect} from "react"
import {AiFillEdit} from 'react-icons/ai'
import {BsHeadphones} from 'react-icons/bs'
import LoadingScreen from "../../components/LoadingScreen/LoadingScreen";
import {pdf_audio_axios_instance} from '../../service/custom-axios';
import "./style.scss";

const Index = () => {
    const [books, setBooks] = useState([])
    const [isLoad, setIsLoad] = useState(false);
    useEffect(() => {
        const fetchData = async() => {
            try{
                const res = await pdf_audio_axios_instance.get(`/books`)
                setBooks(res.data)
            }
            catch(err){
                console.log(err);
            }
        }
        fetchData()
        setIsLoad(true)
    }, [])
    if (isLoad){
        return (
            <div className="index">
                <div className="search-bar">
                    Search bar
                </div>
                <div className="book-table">
                    <table>
                        <thead>
                            <tr>
                                <th style={{width:"40%"}}>Tiêu đề</th>
                                <th style={{width:"15%"}}>Tác giả</th>
                                <th style={{width:"5%"}}>Năm sáng tác</th>
                                <th style={{width:"15%"}}>&nbsp;</th>
                            </tr>
                        </thead>
                        <tbody>
                            {books.map((book) => {
                                return(
                                <tr key={book._id.$oid}>
                                    <td>{book.title}</td>
                                    <td>{book.author}</td>
                                    <td>{book.year}</td>
                                    <td>
                                        <div className="table-button">
                                            <button>
                                                <AiFillEdit/>
                                            </button>
                                            <button>
                                                <BsHeadphones/>
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                                )
                            })}
                        </tbody>
                    </table>
                </div>
            </div>
        )
    }else{
        return <LoadingScreen />
    }
    
}

export default Index