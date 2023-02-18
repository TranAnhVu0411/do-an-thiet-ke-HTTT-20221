from enum import Enum
import datetime
import os
from .db import db

class Status(str, Enum):
    NEW = "new"
    PROCESSING = "processing"
    READY = "ready"
    ERROR = "error"

class Pages(db.Document):
    book = db.ReferenceField("Books", required=True)
    index = db.IntField(required=True)
    text = db.StringField()
    audioLength = db.FloatField()
    ocrStatus = db.EnumField(Status, default=Status.NEW)
    audioStatus = db.EnumField(Status, default=Status.NEW)
    createdAt = db.DateTimeField(required=True)
    updatedAt = db.DateTimeField(required=True)

    def get_page_folder_path(self):
        return f"server/{self.book.id}/{self.id}"

    def save(self, *args, **kwargs):
        if not self.createdAt:
            self.createdAt = datetime.datetime.now()
        self.updatedAt = datetime.datetime.now()
        return super(Pages, self).save(*args, **kwargs)

class Books(db.Document):
    title = db.StringField(required=True)
    author = db.StringField(required=True)
    year = db.IntField(required=True)
    createdAt = db.DateTimeField(required=True)
    updatedAt = db.DateTimeField(required=True)
    def save(self, *args, **kwargs):
        if not self.createdAt:
            self.createdAt = datetime.datetime.now()
        self.updatedAt = datetime.datetime.now()
        return super(Books, self).save(*args, **kwargs)
    def get_book_folder_path(self):
        return f"server/{self.id}"