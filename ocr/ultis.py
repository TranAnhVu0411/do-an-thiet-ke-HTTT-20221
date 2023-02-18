import re
import easyocr
import requests
def no_accent_vietnamese(s):
    s = re.sub(r'[àáạảãâầấậẩẫăằắặẳẵ]', 'a', s)
    s = re.sub(r'[ÀÁẠẢÃĂẰẮẶẲẴÂẦẤẬẨẪ]', 'A', s)
    s = re.sub(r'[èéẹẻẽêềếệểễ]', 'e', s)
    s = re.sub(r'[ÈÉẸẺẼÊỀẾỆỂỄ]', 'E', s)
    s = re.sub(r'[òóọỏõôồốộổỗơờớợởỡ]', 'o', s)
    s = re.sub(r'[ÒÓỌỎÕÔỒỐỘỔỖƠỜỚỢỞỠ]', 'O', s)
    s = re.sub(r'[ìíịỉĩ]', 'i', s)
    s = re.sub(r'[ÌÍỊỈĨ]', 'I', s)
    s = re.sub(r'[ùúụủũưừứựửữ]', 'u', s)
    s = re.sub(r'[ƯỪỨỰỬỮÙÚỤỦŨ]', 'U', s)
    s = re.sub(r'[ỳýỵỷỹ]', 'y', s)
    s = re.sub(r'[ỲÝỴỶỸ]', 'Y', s)
    s = re.sub(r'[Đ]', 'D', s)
    s = re.sub(r'[đ]', 'd', s)
    s = re.sub(r'["]', '', s)
    s = re.sub(r"[']", '', s)
    return s
pic_url = 'https://drive.google.com/file/d/1a-6X5dmFtkRcBny6PtWx4JjUN1bOLBCu/view?usp=share_link'
import requests
with open('FB_IMG_1490534565948.jpg', 'wb') as f:
    f.write(requests.get(pic_url).content)


# img_data = requests.get('https://github.com/hiennguyennq/Toxic-comment-classification/blob/main/Untitled03.png').content
# with open('image_name.jpg', 'wb') as handler:
#     handler.write(img_data)
# reader = easyocr.Reader(['vi'])
# result = reader.readtext(img_data, paragraph="False")
# print(result)

from pdf2image import convert_from_path
 
from PIL import Image

# # Store Pdf with convert_from_path function
# image = Image.open('page'+ str(0) +'.jpg')
# image = image.resize((600, 800))
# image.save('page'+ str('x') +'.jpg')