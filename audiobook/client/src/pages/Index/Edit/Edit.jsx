import React, {useState} from 'react';
import {pdf_audio_axios_instance} from '../../../service/custom-axios';
import './style.scss'
import { toast } from "react-toastify";
import 'react-toastify/dist/ReactToastify.css';

const Edit = (props) => {
    const [inputs, setInputs] = useState({
        title: props.book.title,
        author: props.book.author,
        year: props.book.year
    })
    const handleChange = (e) => {
        setInputs((prev) => ({ ...prev, [e.target.name]: e.target.value }));
    };
    const handleSubmit = async() => {
        try{
            let form = new FormData()
            form.append('title', inputs.title)
            form.append('author', inputs.author)
            form.append('year', inputs.year)
            const res = await pdf_audio_axios_instance.put(`/books/${props.book._id.$oid}`, form)
            toast.success("Cập nhật sách thành công", {position: toast.POSITION.TOP_CENTER});
            props.onClose()
            props.handleEdit()
        }catch(err){
            console.log(err)
            toast.error("Xuất hiện lỗi phát sinh khi cập nhật sách", {position: toast.POSITION.TOP_CENTER});
        }
    }

    return(
        <div className='edit'>
            <div className='edit-form'>
                <h2>Chỉnh sửa thông tin sách</h2>
                <div className='edit-form-input'>
                    <label>Tiêu đề: </label>
                    <input type='text' name="title" value={inputs.title} onChange={handleChange}/>
                </div>
                <div className='edit-form-input'>
                    <label>Tác giả: </label>
                    <input type='text' name="author" value={inputs.author} onChange={handleChange}/>
                </div>
                <div className='edit-form-input'>
                    <label>Năm: </label>
                    <input type='number' name="year" value={inputs.year} onChange={handleChange}/>
                </div>

                <div className='edit-form-button'>
                    <button onClick={props.onClose} className='cancel'>Huỷ</button>
                    <button onClick={handleSubmit} className='save'>Lưu thay đổi</button>
                </div>
            </div>
        </div>
    )
}

export default Edit;