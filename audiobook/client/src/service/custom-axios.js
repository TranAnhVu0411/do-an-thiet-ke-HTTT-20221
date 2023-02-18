import axios from 'axios'

export const pdf_audio_axios_instance = axios.create({
    baseURL:  process.env.REACT_APP_PDF_BASE_URL || 'http://localhost:3502/api'
});