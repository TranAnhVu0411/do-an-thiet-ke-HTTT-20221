from app import celery_pdf_process
import requests
from database.models import *
import json
from io import BytesIO
from pydub import AudioSegment
import fitz
from base64 import b64decode, b64encode
from .utils.audio_utils import *

# MAIN_APP_HOST = 'http://192.168.43.165:3502'
# OCR_APP_HOST = 'http://192.168.43.25:5001'
# AUDIO_APP_HOST = 'http://192.168.43.20:5005'

MAIN_APP_HOST = 'http://localhost:3502'
OCR_APP_HOST = 'http://localhost:5001'
AUDIO_APP_HOST = 'http://localhost:5005'

@celery_pdf_process.task()
def create_ocr_page(page_id, page_path, base64image, quality):
    try:
        print("start ocr")
        ocr_response = requests.post(
            f"{OCR_APP_HOST}/image_to_text", 
            data = {
                "quality": quality,
                "image": base64image
        })
        text = ocr_response.json()["text"]

        upload_pdf_response = requests.post(
            f"{MAIN_APP_HOST}/api/files", 
            data = {
                "path": page_path,
                "id": page_id,
                "file-format": "pdf",
                "base64": base64image,
                "type": "page"
        })
        
        update_response = requests.put(
            f"{MAIN_APP_HOST}/api/pages/{page_id}", 
            data = {
                "text": text,
                "ocrStatus": Status.READY, 
            })
        return {'text': text, 'page_id': page_id, 'page_path': page_path}
    except Exception as e:
        requests.put(f"{MAIN_APP_HOST}/api/pages/{page_id}", data = {"ocrStatus": Status.ERROR})

@celery_pdf_process.task()
def create_audio_page(result):
    print('start audio')
    page_id = result['page_id']
    page_path = result['page_path']
    text = result['text']
    try:
        print('call api')
        audio_response = requests.get(
            f"{AUDIO_APP_HOST}/predict", 
            data = {
                "text": text,
        })
        print('done', audio_response)
        base64audio = audio_response.json()["audio_bytes"]
        
        audio_segment = AudioSegment.from_file(BytesIO(b64decode(base64audio)), format="mp3")
        audio_length = audio_segment.duration_seconds

        upload_audio_response = requests.post(
            f"{MAIN_APP_HOST}/api/files", 
            data = {
                "path": page_path,
                "id": page_id,
                "file-format": "mp3",
                "base64": base64audio,
                "type": 'page'
        })
        
        update_response = requests.put(
            f"{MAIN_APP_HOST}/api/pages/{page_id}", 
            data = {
                "audioStatus": Status.READY, 
                "audioLength": float(audio_length)
            })
        return update_response.status_code
    except Exception as e:
        print(e)
        requests.put(f"{MAIN_APP_HOST}/api/pages/{page_id}", data = {"audioStatus": Status.ERROR})

# Kiểm tra trạng thái của chapters
# Nếu toàn bộ các page trong chapters đều sẵn sàng => tạo pdf/audio cho chapter
# Nếu không => chưa tạo
@celery_pdf_process.task()
def get_pdf_audio_path(id):
    try:
        print('check status')
        get_response = requests.get(f"{MAIN_APP_HOST}/api/books/status/{id}")
        state = get_response.json()

        if (state['ocrStatus']=='ready' and state['audioStatus']=='ready'):
            return json.dumps({
                'book_id': id,
                'book_path': state['book_path'],
                'page_ids': state['page_ids'],
            })
        else:
            return 'incomplete'
    except Exception as e:
        print('get obj key task', e)

@celery_pdf_process.task()
def concat_audio(preprocess_metadata):
    print('merge audio')
    if preprocess_metadata!= 'incomplete':
        try:
            page_ids = json.loads(preprocess_metadata)['page_ids']
            book_id = json.loads(preprocess_metadata)['book_id']
            book_path = json.loads(preprocess_metadata)['book_path']
            
            audio_segment_list = []
            for id in page_ids:
                file_response = requests.get(
                    f"{MAIN_APP_HOST}/api/files/{id}", 
                    data = {
                        "type": "page",
                        "file-format": "mp3",
                })
                base64audio_page = file_response.json()["base64"]
                audio_segment_list.append(AudioSegment.from_file(BytesIO(b64decode(base64audio_page)), format="mp3"))
            audio = merge_audio_segments(audio_segment_list)
            raw_audio = BytesIO()
            audio.export(raw_audio, format="mp3")
            base64audio_book = b64encode(raw_audio.getvalue()).decode()
            upload_audio_response = requests.post(
                f"{MAIN_APP_HOST}/api/files", 
                data = {
                    "path": book_path,
                    "id": book_id,
                    "file-format": "mp3",
                    "base64": base64audio_book,
                    "type": "book"
            })
            return upload_audio_response.status_code
        except Exception as e:
            print('chapter audio task', e)
    else: 
        return 'incomplete'

@celery_pdf_process.task()
def concat_pdf(preprocess_metadata):
    print('merge pdf')
    if preprocess_metadata!= 'incomplete':
        try:
            page_ids = json.loads(preprocess_metadata)['page_ids']
            book_id = json.loads(preprocess_metadata)['book_id']
            book_path = json.loads(preprocess_metadata)['book_path']

            chapter_doc = fitz.open()
            for id in page_ids:
                file_response = requests.get(
                    f"{MAIN_APP_HOST}/api/files/{id}", 
                    data = {
                        "type": "page",
                        "file-format": "pdf",
                })
                base64_doc_bytes = file_response.json()['base64'].encode('ascii')
                doc_bytes = b64decode(base64_doc_bytes)
                doc = fitz.open(stream=doc_bytes, filetype="pdf")
                chapter_doc.insert_pdf(doc)
            pdf_data = chapter_doc.tobytes()
            raw_pdf = BytesIO(pdf_data)
            base64pdf_book = b64encode(raw_pdf.getvalue()).decode()
            upload_pdf_response = requests.post(
                f"{MAIN_APP_HOST}/api/files", 
                data = {
                    "path": book_path,
                    "id": book_id,
                    "file-format": "pdf",
                    "base64": base64pdf_book,
                    "type": "book"
            })
            return upload_pdf_response.status_code
        except Exception as e:
            print('chapter pdf task', e)
    else: 
        return 'incomplete'