import React, {useState, useEffect} from "react"
import {useNavigate} from "react-router-dom"
import {AiFillEdit} from 'react-icons/ai'
import {BsHeadphones} from 'react-icons/bs'
import LoadingScreen from "../../components/LoadingScreen/LoadingScreen";
import {pdf_audio_axios_instance} from '../../service/custom-axios';
import Edit from "./Edit/Edit";
import "./style.scss";
import Pagination from 'react-responsive-pagination';
import '../../util/stylePagination.scss';

const Index = () => {
    const navigate = useNavigate()
    const [books, setBooks] = useState([])
    const [isLoad, setIsLoad] = useState(false);
    // Phục vụ cho việc chỉnh sửa thông tin sách
    const [editView, setEditView] = useState(false);
    const [editBook, setEditBook] = useState(null)
    const [edit, setEdit] = useState(false);
    // Phục vụ cho việc phân trang
    const [pageOffset, setPageOffset] = useState(1); // Trang hiện tại của comment
    const [pageCount, setPageCount] = useState(0); // Tổng số trang

    useEffect(() => {
        const fetchData = async() => {
            try{
                const res = await pdf_audio_axios_instance.get(`/books?page=${pageOffset}`)
                setBooks(res.data['books'])
                setPageCount(res.data['pageCount'])
            }
            catch(err){
                console.log(err);
            }
        }
        fetchData()
        setIsLoad(true)
        setEdit(false)
    }, [edit, pageOffset])

    const handlePageChange = page => {
        setPageOffset(page);
    };
    
    if (isLoad){
        return (
            <div className="index">
                <div className="book-table">
                    <h2>Danh sách sách</h2>
                    <Pagination
                            total={pageCount}
                            current={pageOffset}
                            onPageChange={page => {handlePageChange(page)}}
                    />
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
                                            <button onClick = {() => {
                                                setEditBook(book)
                                                setEditView(true)
                                            }}>
                                                <AiFillEdit/>
                                            </button>
                                            <button onClick = {() => {navigate(`/${book._id.$oid}`)}}>
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
                {editView ? 
                    <Edit
                        onClose={() => setEditView(false)}
                        book={editBook}
                        handleEdit={() => setEdit(true)}
                    /> : 
                    <></>
                }
            </div>
        )
    }else{
        return <LoadingScreen />
    }
    
}

export default Index