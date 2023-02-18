from .book import BooksApi, BooksStatusApi, BooksParamsApi
from .page import PagesApi, PagesParamsApi
from .file import FilesApi, FilesParamsApi

def initialize_routes(api):
    api.add_resource(BooksApi, '/api/books')
    api.add_resource(BooksStatusApi, '/api/books/status/<id>')
    api.add_resource(BooksParamsApi, '/api/books/<id>')
    api.add_resource(PagesApi, '/api/pages')
    api.add_resource(PagesParamsApi, '/api/pages/<id>')
    api.add_resource(FilesApi, '/api/files')
    api.add_resource(FilesParamsApi, '/api/files/<id>')