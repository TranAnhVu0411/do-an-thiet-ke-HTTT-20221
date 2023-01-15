import React, {useEffect, useState, useContext, useRef} from "react";
import {useLocation, useNavigate, Link} from 'react-router-dom';
import {main_axios_instance, pdf_axios_instance} from '../../service/custom-axios';
import "./style.scss";
import {getBackgroundColor, getBorderColor} from '../../util/category-color'; 
import LoadingScreen from "../../components/LoadingScreen/LoadingScreen";
import {v4 as uuidv4} from "uuid";
import { AuthContext } from "../../context/AuthContextProvider";
import { getRole } from "../../context/role";

import CommentWrite from "./Comment/CommentWrite/CommentWrite";
import CommentList from "./Comment/CommentList/CommentList";
import RatingWrite from "./Rating/RatingWrite/RatingWrite"
import RatingStat from "./Rating/RatingStat/RatingStat";
import ListChapter from "./ListChapter/ListChapter";

import Select from 'react-select';

const cat2url = {
    'Kinh doanh': 'kinh_doanh',
    'Kỹ năng sống': 'ky_nang_song',
    'Tài chính': 'tai_chinh',
    'Marketing': 'marketing',
    'Tôn giáo': 'ton_giao',
    'Tâm lý': 'tam_ly',
    'Hạnh phúc': 'hanh_phuc',
    'Sống khoẻ': 'song_khoe',
    'Thiếu nhi': 'thieu_nhi',
    'Tiểu thuyết': 'tieu_thuyet'
};

const BookInfo = () => {
    const chapterRef = useRef()

    // Thông tin dành cho User/Guest
    const [book, setBook] = useState({}); // Thông tin sách
    const [comments, setComments] = useState([]) // List comment
    const [userRating, setUserRating] = useState([]) // Nếu rating tồn tại => update, ngược lại => create
    const [bookRating, setBookRating] = useState(null); // Thông số rating của sách
    const [chapters, setChapters] = useState([]) // List chapters

    // Thông tin dành cho admin
    const [bookPdfStatus, setBookPdfStatus] = useState(false); // Biến kiểm tra pdf sách đã tồn tại chưa
    const [pdf, setPdf] = useState({
        file: null,
        url: null
    })
    const [reports, setReport] = useState([])


    const [isLoad, setIsLoad] = useState(false);
    
    const location = useLocation();
    const bookId = location.pathname.split("/").at(-1);
    const navigate = useNavigate();

    // Kiểm tra người dùng là user hay admin
    const { currentUser } = useContext(AuthContext);
    useEffect(() => {
        const fetchData = async () => {
          try {
            // Lấy thông tin sách
            const bookRes = await main_axios_instance.get(`/book/${bookId}`);
            setBook(bookRes.data);

            // Lấy thông tin comment
            const commentRes = await main_axios_instance.get(`/comment/book/${bookId}`)
            setComments(commentRes.data)

            // Lấy thông tin rating người dùng
            if (getRole(currentUser)!=='guest'){
                const userRatingRes = await main_axios_instance.get(`/rating/book/${bookId}/user/${currentUser.info._id}`)
                setUserRating(userRatingRes.data)
            }else{
                setUserRating([])
            }

            // Lấy thông tin rating sách
            const bookRatingRes = await main_axios_instance.get(`/rating/book/${bookId}`)
            setBookRating(bookRatingRes.data)

            // Lấy thông tin chương
            const chaptersRes = await pdf_axios_instance.get(`/books/${bookId}`)
            setChapters(chaptersRes.data['chapters'])
            if(getRole(currentUser)==='admin'){
                // Lấy thông tin PDF sách
                setBookPdfStatus(chaptersRes.data['bookPdfStatus']);
                if (chaptersRes.data['bookPdfStatus']){
                    let urlForm = new FormData();
                    urlForm.append('upload-type', 'GET');
                    urlForm.append('type', 'book');
                    urlForm.append('id', bookId)
                    urlForm.append('data-type', 'pdf')
                    let urlRes = await pdf_axios_instance.post('/urls', urlForm)
                    setPdf({file: null, url: urlRes.data['url']})
                }else{
                    setPdf({file: null, url: null})
                }
                const reportRes = await main_axios_instance.get(`/report/book/${bookId}`)
                setReport(reportRes.data)
            }else{
                setBookPdfStatus(false)
                setPdf({file: null, url: null})
                setReport([])
            }
            setIsLoad(true);
          } catch (err) {
            console.log(err);
          }
        };
        fetchData();
    }, [bookId, currentUser]);

    // Xử lý rating (Khi tạo rating mới hoặc update rating)
    const [changeRating, setChangeRating] = useState(false) // Tham số trigger useEffect
    useEffect(() => {
        const fetchUserRatingData = async () => {
            try {
                const userRatingRes = await main_axios_instance.get(`/rating/book/${bookId}/user/${currentUser.info._id}`)
                setUserRating(userRatingRes.data)
            } catch (err) {
              console.log(err);
            }
          };
          const fetchBookRatingData = async () => {
            try{
                const bookRatingRes = await main_axios_instance.get(`/rating/book/${bookId}`)
                setBookRating(bookRatingRes.data)
            }catch (err) {
                console.log(err);
            }
          }
          if (getRole(currentUser)!=='guest'){
            fetchUserRatingData();
          }
          fetchBookRatingData();
          setChangeRating(false)
    }, [changeRating, currentUser, bookId])
    const handleRatingChange = () => {
        setChangeRating(true)
    }

    // Xử lý comment (Khi thêm comment mới hoặc update comment)
    // Cập nhật lại danh sách comment nếu comment thay đổi (Thêm/Edit)
    const [changeComment, setChangeComment] = useState(false) // Tham số trigger useEffect
    // Comment filtering
    const filterOptions = [  
        { value: 0, label: 'Toàn bộ comment' },
        { value: 1, label: 'Comment bị báo cáo' },
        { value: 2, label: 'Comment chưa bị báo cáo' },
        { value: 3, label: 'Comment ẩn' },
    ];

    const [commentFilter, setCommentFilter] = useState(filterOptions[0])
    useEffect(() => {
        const fetchCommentData = async () => {
            try {
                setCommentFilter(filterOptions[0])
                const commentRes = await main_axios_instance.get(`/comment/book/${bookId}`)
                setComments(commentRes.data)
            } catch (err) {
                console.log(err);
            }
        };
        fetchCommentData();
        setChangeComment(false);
    }, [changeComment, bookId])
    
    const handleFilter = filter => {
        setCommentFilter(filter);
    }

    const handleCommentChange = () => {
        setChangeComment(true)
    }

    // Xử lý pdf (Khi update pdf)
    const [changePdf, setChangePdf] = useState(false) // Tham số trigger useEffect
    useEffect(() => {
        const fetchPdfData = async () => {
            try {
                let urlForm = new FormData();
                urlForm.append('upload-type', 'GET');
                urlForm.append('type', 'book');
                urlForm.append('id', bookId)
                urlForm.append('data-type', 'pdf')
                let urlRes = await pdf_axios_instance.post('/urls', urlForm)
                setPdf({file: null, url: urlRes.data['url']})
                setBookPdfStatus(true)
            } catch (err) {
              console.log(err);
            }
          };
          fetchPdfData();
          setChangePdf(false);
    }, [changePdf, bookId])

    const handlePdfChange = () => {
        setChangePdf(true)
    }

    if (isLoad){
        return(
            <div className="book-info">
                <div className="book-info-header">
                    <img src={book.image} alt="book-cover"/>
                    <div className="book-info">
                        <h1>{book.title}</h1>
                        <div className="multiple-info">
                            <span>Tác giả:</span>
                            <div className="info-list">
                                {
                                    book.authors.map((author) => {
                                        return <div key={uuidv4()} className='info-item' style={{backgroundColor: '#ECECEC', border: "1px solid #D4D4D4"}} >{author}</div>
                                    })
                                }
                            </div>
                        </div>
                        <div className="multiple-info">
                            <span>Thể loại:</span>
                            <div className="info-list">
                                {book.categories.map((category) => {
                                    return(
                                    <Link 
                                        key={uuidv4()} 
                                        className='info-link' 
                                        to={(getRole(currentUser) !== "admin")?`/book/category/${cat2url[category]}`:`/booklist?cat=${cat2url[category]}`}
                                    >
                                        <div 
                                            className='info-item' 
                                            style={{backgroundColor: getBackgroundColor(category), border: "1px solid " + getBorderColor(category)}}
                                        >
                                            {category}
                                        </div>
                                    </Link>)
                                })}
                            </div>
                        </div>
                        <div className="bookinfo-button">
                            <button onClick={() => chapterRef.current.scrollIntoView({ behavior: 'smooth' })}>
                                <span>Danh sách chương</span>
                            </button>
                            {(getRole(currentUser) === "admin") ?
                                (<button onClick = {() => navigate(`/book/info/${book._id}/update`)}>
                                    <span>Chỉnh sửa thông tin sách</span>
                                </button>
                                ) : (<></>
                                )
                            }
                        </div>
                    </div>
                </div>
                <div className="description">
                    <h2>Mô tả</h2>
                    <hr></hr>
                    <p
                        dangerouslySetInnerHTML={{
                            __html: book.description,
                        }}
                    ></p>  
                </div>
                <div className="chapter" ref={chapterRef}>
                    <h2>Danh sách chương</h2>
                    <ListChapter 
                        chapters={chapters} 
                        bookId={bookId} 
                        bookPdfStatus={bookPdfStatus} 
                        pdf={pdf}
                        handlePdfChange={handlePdfChange} 
                        setIsLoad={setIsLoad}/>
                </div>
                <div className="rating">
                    <div className="rating-write-section">
                        <h2>Đánh giá </h2>
                        {getRole(currentUser) === 'admin' ? (<></>):(
                            <RatingWrite book={book} userRating={userRating} handleRatingChange={handleRatingChange}/>
                        )} 
                    </div>
                    <div className="rating-statistic-section">
                        <RatingStat bookRating={bookRating}/>
                    </div>
                </div>
                <div className="comment">
                    <h2>Bình luận</h2>
                    {getRole(currentUser) === 'admin' ? (
                        <Select
                            className="filter-options"
                            classNamePrefix="select"
                            name="color"
                            options={filterOptions}
                            value={commentFilter}
                            onChange = {handleFilter}
                        />
                    ):(
                        <>
                            <CommentWrite book={book} handleCommentChange={handleCommentChange} />
                            <div className="seperator-comment-section"></div>
                        </>
                    )}
                    <CommentList comments={comments} commentFilter={commentFilter} handleCommentChange={handleCommentChange} reports={reports} />
                </div>
            </div>
        )   
    }else{
        return <LoadingScreen />
    }
}

export default BookInfo;