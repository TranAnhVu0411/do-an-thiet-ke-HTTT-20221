import React, {useState, useEffect} from 'react';
import {useLocation} from 'react-router-dom';
import {main_axios_instance} from '../../service/custom-axios';
import noUser from '../../image/noUser.png';
import {AiFillEdit, AiFillDelete, AiOutlineComment, AiOutlineStar, AiOutlineHeart} from 'react-icons/ai';
import { Tab, Tabs, TabList, TabPanel } from 'react-tabs';
import 'react-tabs/style/react-tabs.css';
import './style.scss';
import CommentList from './CommentList/CommentList';

const UserInfo = () => {
    const [user, setUser] = useState({
        username: "",
        email: "",
        violatedCount: 0
    });
    const [avatar, setAvatar] = useState({
        file: null,
        url: null
    })
    const [comments, setComments] = useState([])
    const [ratings, setRatings] = useState([])
    const location = useLocation();
    const userId = location.pathname.split("/").at(-1);
    useEffect(() =>{
        const fetchData = async() =>{
            const res = await main_axios_instance.get(`/user/${userId}`);
            let data = res.data
            console.log(data)
            setUser({
                username: data.user.username,
                email: data.user.email,
                violatedCount: data.user.violatedCount
            })
            fetch(data.avatar).then(async response => {
                const contentType = response.headers.get('content-type')
                const blob = await response.blob()
                const file = new File([blob], 'temp.png', { contentType })
                // access file here
                setAvatar({
                    file: file,
                    url: data.user.avatar
                })
            })
            setComments(data.comments)
            setRatings(data.ratings)
        }
        fetchData()
    }, [userId])
    return(
        <div className='user-info'>
            <div className='user-info-detail'>
                <div className="user-image-info">
                    <input type="file" name="image" id="image" accept="image/png, image/jpg, image/jpeg" style={{display: "none"}}/>
                    <img alt="preview" src={avatar.url} />
                    <label htmlFor="image">
                        <AiFillEdit />
                    </label>
                    <button>
                        <AiFillDelete />
                    </button>
                </div>
                <div className='user-text-info'>
                    <div className='user-text'>
                        <label>Username: </label>
                        <span>{user.username}</span>
                    </div>
                    <div className='user-text'>
                        <label>Email: </label>
                        <span>{user.email}</span>
                    </div>
                    <div className='user-text'>
                        <label>Số lần vi phạm: </label>
                        <span>{user.violatedCount}</span>
                    </div>
                </div>
            </div>
            
            <div className='user-info-other'>
                <Tabs>
                    <TabList>
                        <Tab>
                            <div className='tab-header'>
                                <AiOutlineComment/>
                                <span>Comment</span>
                            </div>
                        </Tab>
                        <Tab>
                            <div className='tab-header'>
                                <AiOutlineStar/>
                                <span>Rating</span>
                            </div>
                        </Tab>
                        <Tab>
                            <div className='tab-header'>
                                <AiOutlineHeart/>
                                <span>Yêu thích</span>
                            </div>
                        </Tab>
                    </TabList>
                    <TabPanel>
                        <CommentList comments={comments}/>
                    </TabPanel>
                    <TabPanel>
                        Rating
                    </TabPanel>
                    <TabPanel>
                        Favourite
                    </TabPanel>
                </Tabs>
            </div>
        </div>
    )
}

export default UserInfo;