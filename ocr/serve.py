import numpy as np
from flask import Flask, request
import json
import os
import easyocr
from transformer_model import TransformerModel
from ultis import no_accent_vietnamese
from pdf2image import convert_from_path
from PIL import Image
import base64

app = Flask(__name__)

def resize(quality, image):
	if quality == "low":
		new_image = image.resize((400, 600))
	if quality == "medium":
		new_image = image.resize((800, 1200))
	if quality == "high":
		new_image = image
	return new_image

@app.route("/image_to_text", methods=["POST"])
def _image_to_text():
	data = {"success": False}
	if request.method == "POST":
		#convert base64 to image
		# form = request.get_json()
		encoded_string = request.form.get('image', '')
		# encoded_string = form['image']
		with open("image.jpg", "wb") as image_file:
			image_file.write(base64.b64decode(encoded_string))
		image = Image.open("image.jpg")
		
		#select quality image
		quality = request.form.get('quality', '')
		# quality = form['quality']
		new_image = resize(quality, image)
		new_image.save('new_image' +'.jpg')
		result = reader.readtext('new_image.jpg', paragraph="False")
		text = ''
		for i in result:
			text = text + i[1]
		# text_ = text.split('.')
		# text_1 = ''
		# for i in text_:
		# 	text_1 = text + transformer.predict(no_accent_vietnamese(i))	
		# data["text_1"] = text_1
		data["text"] = text
		data["success"] = True
		os.remove("image.jpg")
		os.remove("new_image.jpg")
	return json.dumps(data, ensure_ascii=False)

@app.route("/images_to_text", methods=["POST"])
def _images_to_text():
	data = {"success": False}
	if request.method == "POST":
		images = request.form.get('image', '').split(',')
		for image in images:
			image = Image.open(image)
			new_image = image.resize((1200, 1600))
			new_image.save('new_image' +'.jpg')
			result = reader.readtext('new_image.jpg', paragraph="False")
			text = ''
			for i in result:
				text = text + i[1]
			# text_ = text.split('.')
			# text_1 = ''
			# for i in text_:
			# 	text_1 = text + transformer.predict(no_accent_vietnamese(i))	
			# data["text_1"] = text_1
		data["text"] = text
		data["success"] = True
	return json.dumps(data, ensure_ascii=False)

@app.route("/link_image_to_text", methods=["POST"])
def _link_image_to_text():
	data = {"success": False}
	if request.method == "POST":
		image = request.form['link']
		result = reader.readtext(image, paragraph="False")
		text = ''
		for i in result:
			text = text + i[1]
		# text_ = text.split('.')
		# text_1 = ''
		# for i in text_:
		# 	text_1 = text + transformer.predict(no_accent_vietnamese(i))	
		# data["text_1"] = text_1
		data["text"] = text
		data["success"] = True
	return json.dumps(data, ensure_ascii=False)

@app.route("/pdf_to_text", methods=["POST"])
def _pdf_to_text():
	data = {"success": False}
	if request.method == "POST":
		text = ''
		pdf = request.form.get('pdf', '')
		images = convert_from_path(pdf, 500, poppler_path=r"poppler-22.12.0\Library\bin")
 
		for i in range(len(images)):
			images[i].save('page'+ str(i) +'.jpg', 'JPEG')
			image = Image.open('page'+ str(i) +'.jpg')
			image = image.resize((800, 1100))
			image.save('page'+ str(i) +'.jpg')
			result = reader.readtext('page'+ str(i) +'.jpg', paragraph="False")
			for j in result:
				text = text + j[1]
			del(result)

		data["text"] = text
		data["success"] = True
	return json.dumps(data, ensure_ascii=False)

@app.route("/test", methods=["POST"])
def _test():
	if request.method == "POST":
		return request.form.get('link', '')

if __name__ == "__main__":
	reader = easyocr.Reader(['vi'])
	# transformer = TransformerModel(source_vectorization='source_vectorization_layer.pkl',
	# target_vectorization='target_vectorization_layer.pkl',
	# model_path='restore_diacritic.keras')
	print("App run!")
	app.run(port=5001,debug=True,host = '0.0.0.0')