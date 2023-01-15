import React from 'react';
import './style.scss';
import moment from "moment";

const RatingList = (props) => {
    return (
        <div className='comment-list'>
            {props.comments.length===0?
            (<>
                <span>Không có comment</span>
            </>):
            (<>
                {props.comments.map(comment => (
                    <>
                        <div className='comment-item'>
                            <div className='book-image'>
                                <img src={comment.book.image}/>
                            </div>
                            <div className='comment-info'>
                                <h4>{comment.book.title}</h4>
                                <label>{moment(comment.updatedAt).format("DD/MM/YY HH:mm")}</label>
                                <p
                                    dangerouslySetInnerHTML={{
                                        __html: comment.comment,
                                    }}
                                ></p>
                            </div>
                        </div>
                    </>
                ))}
            </>)
            }
        </div>
    )
}

export default RatingList;