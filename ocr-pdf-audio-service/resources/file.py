from flask import request
from flask_restful import Resource
from database.models import Pages
import os
import fitz
import base64

# routes api/files
class FilesApi(Resource):
    def post(self):
        body = request.form.to_dict()
        if body['type']=='page':
            if body['file-format']=='pdf':
                # Convert base64 image to fitz document
                base64image = body['base64'].encode('ascii')
                base64image_decode = base64.b64decode(base64image)
                img = fitz.open(stream=base64image_decode, filetype="png")
                pdfbytes = img.convert_to_pdf()
                img.close()
                imgPDF = fitz.open("pdf", pdfbytes)
                # Resize image and save
                resize_doc = fitz.open()  # new empty PDF
                page = resize_doc.new_page()  # new page in A4 format
                page.show_pdf_page(page.rect, imgPDF, 0)
                resize_doc.save(os.path.join(body['path'], "{}.{}".format(body['id'], body['file-format'])))
            elif body['file-format'] == 'mp3':
                file = open(os.path.join(body['path'], "{}.{}".format(body['id'], body['file-format'])), "wb")
                decode_string = base64.b64decode(body['base64'])
                file.write(decode_string)
        elif body['type']=='book':
            file = open(os.path.join(body['path'], "{}.{}".format(body['id'], body['file-format'])), "wb")
            decode_string = base64.b64decode(body['base64'])
            file.write(decode_string)   
            
        return 'ok', 200
    

class FilesParamsApi(Resource):
    def get(self, id):
        if request.form.get('type')=='page':
            page = Pages.objects.get(id=id)
            path = page.get_page_folder_path()
            with open(os.path.join(path, "{}.{}".format(str(page.id), request.form.get('file-format'))), "rb") as file:
                encoded_string = base64.b64encode(file.read()).decode('utf-8')
                return {'base64': encoded_string}, 200
    