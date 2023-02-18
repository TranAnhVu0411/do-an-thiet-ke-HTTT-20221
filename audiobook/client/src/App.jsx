import {
  Routes,
  Route,
  BrowserRouter as Router,
} from 'react-router-dom';
import Footer from './components/Footer/Footer';
import Header from './components/Header/Header';
import Index from './pages/Index/Index';
import Error from './pages/Error/Error'
import "./style.scss";
import { ToastContainer } from "react-toastify";
import AudioBook from './pages/AudioBook/AudioBook';
import { Worker } from '@react-pdf-viewer/core';

function App() {
  return (
    <Router>
      <div className="app">
        <div className='container'>
          <Header/>
          <Worker workerUrl="https://unpkg.com/pdfjs-dist@3.2.146/build/pdf.worker.min.js"/>
          <ToastContainer />
            <Routes>
              <Route path="/" element={<Index />} />
              <Route path="/:id" element={<AudioBook />} />
              <Route path="*" element={<Error />}/>
            </Routes>
          <Footer/>
        </div>
      </div>
    </Router>
  );
}

export default App;
