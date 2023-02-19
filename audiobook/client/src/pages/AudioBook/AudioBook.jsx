import React, {useState, useEffect, useRef} from 'react';
import { useLocation, useNavigate } from "react-router-dom";
import {pdf_audio_axios_instance} from '../../service/custom-axios';
import LoadingScreen from '../../components/LoadingScreen/LoadingScreen';
import {BsZoomIn, BsZoomOut, BsHeadphones} from 'react-icons/bs';
import {AiOutlineHome} from 'react-icons/ai'

// Import the main component
import { Viewer } from '@react-pdf-viewer/core';

// Import the styles
import '@react-pdf-viewer/core/lib/styles/index.css';

import { toolbarPlugin } from '@react-pdf-viewer/toolbar';
import { pageNavigationPlugin } from '@react-pdf-viewer/page-navigation';

import './style.scss';


const AudioBook = () => {
    const navigate = useNavigate();
    const location = useLocation();
    const bookId = location.pathname.split("/").at(-1);
    const [metaData, setMetadata] = useState([])
    const [base64, setBase64] = useState({
        pdf: null,
        audio: null
    })
    const [isLoad, setIsLoad] = useState(false)
    const scrollDiv= useRef();

    useEffect(() => {
        const fetchData = async() => {
            try{
                let res = await pdf_audio_axios_instance.get(`books/${bookId}`)
                setMetadata(res.data['metadata'])
                setBase64({pdf: res.data['pdf'], audio: res.data['audio']})
                setIsLoad(true)
                scrollDiv.current.scrollIntoView({ behavior: "smooth" });
            }catch (err) {
                setIsLoad(true)
                console.log(err);
            }
        }
        fetchData()
    }, [bookId])

    // Toolbar
    const toolbarPluginInstance = toolbarPlugin();
    const { Toolbar } = toolbarPluginInstance

    // Audio
    const pageNavigationPluginInstance = pageNavigationPlugin();
    const { jumpToPage } = pageNavigationPluginInstance;

    const [audioView, setAudioView] = useState(false);
    const [currentPage, setCurrentPage] = useState(0);
    const [currentTime, setCurrentTime] = useState(0);

    // Hiển thị highlight khi chạy auido
    const timeUpdate = (e) => {
        const checkedPage = metaData.find(page => {
            return page.endTime >= e.target.currentTime
        })['pageIndex']
        if (currentPage !== checkedPage){
            console.log(e.target.currentTime)
            setCurrentPage(checkedPage)
            jumpToPage(checkedPage)
        }
    }

    // Set lại thời gian chạy khi thay đổi vị trí trang (là highlight đầu tiên của page đang hiển thị)
    const handlePageChange = (e) => {
        const metadata = metaData.find((page) => {
            return page.pageIndex === e.currentPage;
        });
        setCurrentTime(metadata.endTime-metadata.duration)
    };


    const handleAudioView = () => {
        let audioTag = document.querySelectorAll('#audiobook-audio')[0]
        if (audioView) {
            // Ngắt audio khi không bật audio view
            audioTag.pause()
        }else{
            // Bật audio khi bật audio view
            audioTag.play()
            // Set thời gian bắt đầu của audio theo vị trí trang 
            audioTag.currentTime=currentTime
        }
        setAudioView(!audioView)
    }

    if (isLoad){
        return (
            <div className={`audio-book normal-mode`} ref={scrollDiv}>
                <div className="pdf-toolbar">
                    <Toolbar>
                        {(props) => {
                            const {
                                CurrentPageInput,
                                NumberOfPages,
                                CurrentScale,
                                ZoomIn,
                                ZoomOut,
                            } = props;
                            return (
                                <>
                                    <div className='zoom-section'>
                                        <div>
                                            <ZoomOut>
                                                {(props) => (
                                                    <button onClick={props.onClick} title="Phóng to">
                                                        <BsZoomOut/>
                                                    </button>
                                                )}
                                            </ZoomOut>
                                        </div>
                                        <div>
                                            <CurrentScale/>
                                        </div>
                                        <div>
                                            <ZoomIn>
                                                {(props) => (
                                                    <button onClick={props.onClick} title="Thu nhỏ">
                                                        <BsZoomIn/>
                                                    </button>
                                                )}
                                            </ZoomIn>
                                        </div>
                                    </div>
                                    <div className='gotopage-section'>
                                        <span style={{width: '4rem'}}><CurrentPageInput/></span>
                                        <span>of</span>
                                        <NumberOfPages/>
                                    </div>
                                    <div className='ultilize-section'>
                                        <button 
                                            onClick={() => navigate(`/`)} 
                                            title="Quay về trang chủ"
                                        >
                                            <AiOutlineHome/>
                                        </button>
                                        <button 
                                            onClick={handleAudioView} 
                                            style = {{
                                                backgroundColor: audioView?'black':'white',
                                                color: audioView?'white':'black',
                                            }}
                                            title={audioView?'Tắt audio':'Bật audio'}
                                        >
                                            <BsHeadphones/>
                                        </button>
                                    </div>
                                </>
                            );
                        }}
                    </Toolbar>
                </div>
                <div style={{display: audioView?'flex':'none'}} >
                        <audio 
                            id = 'audiobook-audio'
                            controls 
                            src={`data:audio/mpeg;base64,${base64.audio}`}
                            onTimeUpdate={timeUpdate}
                        />
                </div>
                <div 
                    className='pdf-viewer' 
                    style={audioView?{height: '70vh'}:{height: '80vh'}}>
                    <Viewer 
                        fileUrl={`data:application/pdf;base64,${base64.pdf}`}
                        onPageChange={handlePageChange} 
                        plugins={[toolbarPluginInstance, pageNavigationPluginInstance]} />
                </div>
            </div>
        )
    }else{
        return(
            <LoadingScreen/>
        )
    }
}

export default AudioBook;