import React, {useState, useEffect} from 'react';
import { useLocation, useNavigate } from "react-router-dom";
import {pdf_audio_axios_instance} from '../../service/custom-axios';
import LoadingScreen from '../../components/LoadingScreen/LoadingScreen';
import {BsZoomIn, BsZoomOut, BsHeadphones, BsFullscreenExit, BsFullscreen, BsFillCaretRightFill, BsFillCaretLeftFill, BsArrowReturnLeft} from 'react-icons/bs';
import {AiOutlineHome} from 'react-icons/ai'

// Import the main component
import { Viewer } from '@react-pdf-viewer/core';

// Import the styles
import '@react-pdf-viewer/core/lib/styles/index.css';

import { toolbarPlugin } from '@react-pdf-viewer/toolbar';
import { pageNavigationPlugin } from '@react-pdf-viewer/page-navigation';

import {
    highlightPlugin,
} from '@react-pdf-viewer/highlight';

import './style.scss';


const AudioBook = () => {
    const navigate = useNavigate();
    const location = useLocation();
    const bookId = location.pathname.split("/").at(-1);
    const [metaData, setMetadata] = useState({})
    const [base64, setBase64] = useState({
        pdf: null,
        audio: null
    })
    const [isLoad, setIsLoad] = useState(false)

    useEffect(() => {
        const fetchData = async() => {
            try{
                // const metaRes = await pdf_audio_axios_instance.get(
                //     `/chapter_meta/${bookId}`
                // )
                // setMetadata(metaRes.data)

                let base64Res = await pdf_audio_axios_instance.get(`books/${bookId}`)

                setBase64({pdf: base64Res.data['pdf'], audio: base64Res.data['audio']})
                setIsLoad(true)
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

    const pageNavigationPluginInstance = pageNavigationPlugin();
    const { jumpToPage } = pageNavigationPluginInstance;

    // Render Highlight
    const renderHighlights = (props) => (
        <div className='hello'>
            {metaData['sentences'].map((sentence) => (
                <div key={sentence['sentenceId']}>
                    {sentence.highlightAreas
                        // Filter all highlights on the current page
                        .filter((area) => area.pageIndex === props.pageIndex)
                        .map((area, idx) => (
                            <div
                                className='highlight-box'
                                key={idx}
                                id={`s${sentence['sentenceId']}${idx}`}
                                style={Object.assign(
                                    props.getCssProperties(area, props.rotation)
                                )}
                            ></div>
                        ))}
                </div>
            ))}
        </div>
    );

    const highlightPluginInstance = highlightPlugin({
        renderHighlights,
    });

    // Audio
    const { jumpToHighlightArea } = highlightPluginInstance;

    const [audioView, setAudioView] = useState(false);
    const [currentSentenceId, setCurrentSentenceId] = useState(null);
    const [currentTime, setCurrentTime] = useState(0);

    // Hiển thị highlight khi chạy auido
    const timeUpdate = (e) => {
        const highlightMetadata = metaData['sentences'].find((sentence) => {
            return sentence.endTime >= e.target.currentTime;
        });
        if(currentSentenceId!==highlightMetadata['sentenceId']){
            document.querySelectorAll('.highlight-box.highlight').forEach((el) => el.classList.remove('highlight'));
            for(let i = 0; i < highlightMetadata["highlightAreas"].length; i++){
                const highlightElement = document.querySelector(`#s${highlightMetadata["sentenceId"]}${i}`)
                highlightElement.classList.add('highlight');
            }
            setCurrentSentenceId(highlightMetadata['sentenceId']);
            jumpToHighlightArea(highlightMetadata.highlightAreas[0]);
        }
    }

    // Set lại thời gian chạy khi thay đổi vị trí trang (là highlight đầu tiên của page đang hiển thị)
    const handlePageChange = (e) => {
        const highlightMetadata = metaData['sentences'].find((sentence) => {
            return sentence.pageIndex === e.currentPage;
        });
        setCurrentTime(highlightMetadata.endTime-highlightMetadata.duration)
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

    // Full Screen
    const [fullScreen, setFullScreen] = useState(true);

    if (isLoad){
        return (
            <div className={`audio-book ${fullScreen?'fullscreen-mode':'normal-mode'}`}>
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
                                            onClick={() => navigate(`/}`)} 
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
                                        <button 
                                            onClick={() => setFullScreen(!fullScreen)}
                                            title={fullScreen?'Tắt toàn màn hình':'Bật toàn màn hình'}
                                        >
                                            {fullScreen?<BsFullscreenExit/>:<BsFullscreen/>}
                                        </button>
                                        <button 
                                            onClick={() => jumpToPage(1)}
                                        >
                                            goto
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
                    />
                </div>
                <div 
                    className='pdf-viewer' 
                    style={fullScreen?
                        (audioView?{height: '80vh'}:{height: '100vh'}):
                        (audioView?{height: '70vh'}:{height: '80vh'})}>
                    <Viewer 
                        fileUrl={`data:application/pdf;base64,${base64.pdf}`}
                        // onPageChange={handlePageChange} 
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