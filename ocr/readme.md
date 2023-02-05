pip install easyocr
pip install flask
pip install pdf2image

Run file serve.py

http://127.0.0.1:5000/image_to_text: API chuyển ảnh thành text
input {"image":"base64 của ảnh", "quality": "chất lượng chuyển đổi*"}
output {"text": "text của ảnh", "sucess": "true nếu thành công, false nếu thất bại"}

*: người dùng có thể chọn chất lượng text khi convert (càng cao thì càng lâu)
Anh có thể đưa thêm một câu trên giao diện người dùng: "Chọn chất lượng của text bạn 
muốn chuyển đổi, lưu ý nếu chọn chất lượng cao thì thời gian chuyển đổi sẽ lâu. Hãy 
cân nhắc lựa chọn của bạn."
