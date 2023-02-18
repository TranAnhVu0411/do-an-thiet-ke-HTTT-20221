from flask import request, make_response, jsonify
from flask_restful import Resource
from database.models import Books, Pages, Status
import os
import base64

def check_status(pages, attribute):
    if any(page[attribute] == Status.ERROR for page in pages):
        return "error"
    elif all(page[attribute] == Status.READY for page in pages):
        return "ready"
    elif any(page[attribute] == Status.PROCESSING for page in pages):
        return "processing"
    else:
        return "new"

# routes api/books
class BooksApi(Resource):
    def post(self):
        body = request.json
        book = Books(title=body['title'], author=body['author'], year=body['year'])   
        book.save()
        if not os.path.exists(book.get_book_folder_path()):
            os.makedirs(book.get_book_folder_path())
        return {'bookId': str(book.id)}, 200
    def get(self):
        per_page = 5
        page = int(request.args.get('page', '1'))
        total = Books.objects().count()
        books = Books.objects().skip((per_page*page)-per_page).limit(per_page)
        return make_response(jsonify({"books": books, "pageCount": int(total / per_page)+1}), 200)
    
# routes api/books/id
class BooksParamsApi(Resource):
    def get(self, id):
        book = Books.objects.get(id=id)
        pages = Pages.objects(book=id).order_by('index')
        page_list = []
        time_between_page = 0.048 # Thời gian giữa 2 câu
        total_time = 0
        for i in pages:
            total_time += i['audioLength']
            page_item = {}
            page_item['pageIndex'] = i['index']
            page_item['endTime'] = total_time
            page_item['duration'] = i['audioLength']
            total_time += time_between_page
            page_list.append(page_item)
        path = book.get_book_folder_path()
        with open(os.path.join(path, "{}.{}".format(str(book.id), 'pdf')), "rb") as file:
            pdf_encoded_string = base64.b64encode(file.read()).decode('utf-8')
        with open(os.path.join(path, "{}.{}".format(str(book.id), 'mp3')), "rb") as file:
            audio_encoded_string = base64.b64encode(file.read()).decode('utf-8')
        return {'pdf': pdf_encoded_string, 'audio': audio_encoded_string, 'metadata': page_list}, 200 
    def put(self, id):
        body = request.form.to_dict()
        book = Books.objects.get(id=id)
        book.update(**body)
        return 'update successful', 200

# routes api/books/status/:id
class BooksStatusApi(Resource):
    def get(self, id):
        book_path = Books.objects.get(id=id).get_book_folder_path()
        pages = Pages.objects(book=id).order_by('index')
        id = [str(page.id) for page in pages]
        ocr_status = check_status(pages, 'ocrStatus')
        audio_status = check_status(pages, 'audioStatus')
        return make_response(jsonify({'book_path': book_path, 'page_ids': id, 'ocrStatus': ocr_status, 'audioStatus': audio_status}), 200)