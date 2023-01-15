import React, {useState, useEffect} from "react";
import {main_axios_instance, pdf_axios_instance} from '../../service/custom-axios';
import {useLocation} from "react-router-dom";
import {v4 as uuidv4} from "uuid";
import LoadingScreen from "../../components/LoadingScreen/LoadingScreen";
import { FaRegEdit, FaTrash, FaList } from "react-icons/fa";
import { toast } from "react-toastify";
import 'react-toastify/dist/ReactToastify.css';
import './style.scss';
import ReactDragListView from "react-drag-listview";
import axios from "axios";

const PdfWrite = () => {
    const location = useLocation();
    const [book, setBook] = useState({});
    const [isLoad, setIsLoad] = useState(false);
    const [isUpload, setIsUpload] = useState(true);
    const [numChapter, setNumChapter] = useState(0);
    const bookId = location.pathname.split("/")[3];
    
    const [chapterForm, setChapterForm] = useState({
        id: "",
        name: "",
        from: "",
        to: "",
    })
    // mode hiện tại (Chỉnh sửa, thêm) và id của dòng đang chỉnh sửa
    const [mode, setMode] = useState({state: 'submit', id: ""})
    const [chapterList, setChapterList] = useState([])

    useEffect(() => {
        const fetchData = async () => {
          try {
            const res = await main_axios_instance.get(`/book/${bookId}`);
            setBook(res.data);
            const chaptersRes = await pdf_axios_instance.get(`/books/${bookId}`);
            setNumChapter(chaptersRes.data['chapters'].length);
            setIsLoad(true);
          } catch (err) {
            console.log(err);
          }
        };
        fetchData();
    }, [bookId]);

    const handleChapterForm = e => {
        setChapterForm(prev => ({...prev, [e.target.name]: e.target.value}))
    }

    // Reset các trường trong form
    const resetChapterForm = () => {
        setChapterForm({
            id: "",
            index: "",
            name: "",
            from: "",
            to: "",
        })
    }

    // Hiển thị dữ liệu edit trên form
    const handleShowEdit = (id) => {
        let editChapter = {}
        for (let i =0; i<chapterList.length; i++){
            if (chapterList[i].id===id){
                editChapter = chapterList[i]
                break;
            }
        }
        setChapterForm(prev => ({...prev,
            id: editChapter.id,
            index: editChapter.index,
            name: editChapter.name,
            from: editChapter.from,
            to: editChapter.to,
        }))
        setMode({state: 'edit', id: id})
    }

    // Huỷ edit
    const handleDestroyEdit = () => {
        resetChapterForm()
        setMode({state: 'submit', id: ""})
    }

    // Xoá chapter trên table
    const handleDeleteItem = (id) => {
        if (mode.state!=='edit'){
            setChapterList([
                ...chapterList.filter(chapter => {
                  return chapter.id !== id;
                }),
            ])
        }
    }

    // Submit chapter và hiển thị trên table
    const handleSubmitItem = (e) => {
        if (mode.state === "submit"){
            let newChapter = {
                id: uuidv4(),
                index: chapterForm.index,
                name: chapterForm.name,
                from: chapterForm.from,
                to: chapterForm.to
            };
            setChapterList(previousChapterList => [...previousChapterList, newChapter])
        }else{
            setChapterList(chapterList.map(chapter => {
                if (chapter.id === chapterForm.id){
                    chapter.index = chapterForm.index
                    chapter.name = chapterForm.name
                    chapter.from = chapterForm.from
                    chapter.to = chapterForm.to
                    return chapter
                }
                return chapter
            }))
        }
        resetChapterForm();
        setMode({state: 'submit', id: ""})
    }

    // Hỗ trợ thay đổi thứ tự chapter
    const reorder = (list, startIndex, endIndex) => {
        const result = Array.from(list);
        const [removed] = result.splice(startIndex, 1);
        result.splice(endIndex, 0, removed);
        return result;
    };

    const onDragEnd = (fromIndex, toIndex) => {
        /* IGNORES DRAG IF OUTSIDE DESIGNATED AREA */
        if (toIndex < 0) return;
    
        const list = reorder(chapterList, fromIndex, toIndex);
        return setChapterList(list);
    };

    // Submit toàn bộ
    const handleSubmit = async(e) => {
        setIsUpload(false)
        e.preventDefault();
        
        try{
            // Tạo mới chapter
            let chapterRequestsList = []
            for (let i = 0; i <chapterList.length; i++) {
                let chapterForm = new FormData();
                chapterForm.append("index", numChapter+i+1)
                chapterForm.append("name", chapterList[i].name)
                chapterForm.append("bookId", bookId)
                chapterForm.append("from", chapterList[i].from)
                chapterForm.append("to", chapterList[i].to)
                chapterRequestsList.push(pdf_axios_instance.post('/chapters', chapterForm))
            }
            let chapterResponsesList = await axios.all(chapterRequestsList)
            console.log(chapterResponsesList)

            let chapterMetadataList = []
            for (let i = 0; i < chapterResponsesList.length; i++) {
                chapterMetadataList.push(chapterResponsesList[i].data)
            }
            let preprocessForm = new FormData();
            preprocessForm.append('chapterList', JSON.stringify(chapterMetadataList))
            preprocessForm.append('bookId', bookId)
            const preprocessRes = await pdf_axios_instance.post('/preprocess/book', preprocessForm)
            console.log(preprocessRes)

            setIsUpload(true);
            toast.success("Upload pdf thành công, đang xử lý", {position: toast.POSITION.TOP_CENTER});
        }catch(err){
            setIsUpload(true);
            console.log(err)
            toast.error("Xuất hiện lỗi phát sinh khi upload chương", {position: toast.POSITION.TOP_CENTER});
        };
    }
    
    if (isLoad && isUpload){
        return (
            <div className="pdf-write">
                <div className="chapter-form">
                    <div className="pdf-write-header">
                        <h1>Thêm chương truyện theo PDF sách</h1>
                        <span>Tiêu đề sách: {book.title}</span>
                        <hr></hr>
                    </div>
                    <div className="text-input">
                        <label>Tiêu đề chương</label>
                        <input type="text" name="name" value={chapterForm.name} onChange={handleChapterForm} placeholder="Nhập tên chương"/>
                    </div>
                    <div className="text-input">
                        <label>Bắt đầu từ trang</label>
                        <input type="number" name="from" value={chapterForm.from} min={1} onChange={handleChapterForm} placeholder="Nhập trang bắt đầu"/>
                    </div>
                    <div className="text-input">
                        <label>Kết thúc đến trang</label>
                        <input type="number" name="to" value={chapterForm.to} min={1} onChange={handleChapterForm} placeholder="Nhập trang kết thúc"/>
                    </div>
                    <div className='item-submit'>
                        <button className="item-submit-button" onClick={() => handleSubmitItem()}> 
                            <span>{mode.state==='submit' ? "Thêm vào bảng":"Cập nhật"}</span>
                        </button>
                        {mode.state==='submit' ? (
                            <></>
                        ):(
                            <button className="destroy-edit-button" onClick={() => handleDestroyEdit()}> 
                                <span>Huỷ</span>
                            </button>
                        )}
                    </div>
                </div>    
                <ReactDragListView
                    lineClassName="dragLine"
                    handleSelector='button.chapter-dragger'
                    nodeSelector={`${mode.state==='edit' ? "null" : "tr"}`}
                    onDragEnd={(fromIndex, toIndex) =>
                        onDragEnd(fromIndex, toIndex)
                    }
                >
                    <div className="chapter-table">
                        <table>
                            <thead>
                                <tr>
                                    <th style={{width:"5%"}}>&nbsp;</th>
                                    <th style={{width:"55%"}}>Tên chương</th>
                                    <th style={{width:"15%"}}>Trang bắt đầu</th>
                                    <th style={{width:"15%"}}>Trang kết thúc</th>
                                    <th style={{width:"10%"}}>&nbsp;</th>
                                </tr>
                            </thead>
                            <tbody>
                                {chapterList.map(chapter => {
                                return(
                                <tr 
                                    key={chapter.id} 
                                    className={`${(mode.state==='edit' && mode.id===chapter.id) ? "updating" : ""}`}    
                                >
                                        <td>
                                            <button className="chapter-dragger" style={{cursor:`${mode.state==='edit'?"not-allowed":"all-scroll"}`}}>
                                                <FaList/>
                                            </button>
                                        </td>
                                        <td>{chapter.name}</td>
                                        <td>{chapter.from}</td>
                                        <td>{chapter.to}</td>
                                        <td>
                                            <div className="chapter-item-button">
                                                <button onClick={() => handleShowEdit(chapter.id)}>
                                                    <FaRegEdit/>
                                                </button>
                                                <button onClick={() => handleDeleteItem(chapter.id)} style={{cursor:`${mode.state==='edit'?"not-allowed":"pointer"}`}}>
                                                    <FaTrash/>
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                )
                                })}
                            </tbody>
                        </table>
                        <div className="pdf-write-submit">
                            <button onClick={handleSubmit}>
                                Lưu thay đổi
                            </button>
                        </div>
                    </div> 
                </ReactDragListView>
            </div>
        )
    }else{
        return <LoadingScreen />
    }
}

export default PdfWrite;