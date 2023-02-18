from flask import request
from flask_restful import Resource
from database.models import Pages
import os
from celery import group, chain
from tasks.tasks import *

# routes api/pages
class PagesApi(Resource):
    def post(self):
        body = request.json
        pages = []
        for idx, i in enumerate(body['images']):
            page = Pages(book=body['bookId'], index=idx)
            result = page.save()
            pages.append({"page": result, "image": i, "quality": body["quality"]})

        for i in pages:
            if not os.path.exists(i["page"].get_page_folder_path()):
                os.makedirs(i["page"].get_page_folder_path())

        work_flow = chain(
                        chain(
                            chain(
                                create_ocr_page.si(
                                    page_id = str(page["page"].id),
                                    page_path = page["page"].get_page_folder_path(),
                                    base64image = page["image"],
                                    quality = page["quality"]
                                ),
                                create_audio_page.s()
                            ) for page in pages
                        ),
                        get_pdf_audio_path.si(
                            id = body['bookId']
                        ),
                        group([
                            concat_audio.s(),
                            concat_pdf.s()  
                        ])
        ).apply_async()
            
        return {'work_flow_id': work_flow.id}, 200

# routes api/pages/id
class PagesParamsApi(Resource):
    def put(self, id):
        body = request.form.to_dict()
        page = Pages.objects.get(id=id)
        page.update(**body)
        return 'update successful', 200