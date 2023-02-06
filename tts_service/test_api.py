import requests, json, base64

url = "http://localhost:5005/predict"
params = {
    'text': """LỜI MỞ ĐẦU () Tuỳ cũng như Tần; thống nhất được Trung Quõc mà không giữ ngôi được bao lâu \
    (581-621); Đường (618-907) cũng như Hán hưởng cảnh tương đối thịnh trị suốt ba thế kỉ, nhờ vậy văn học phát triển cực kì \
    rực rỡ. Hết Đường, đến Ngũ Đại (907-960), loạn lạc nửa thế kỉ; rồi đến Tống (960-1299) tạm yên được trên ba trăm năm nữa \
    Đường va Tỗng là những thời đại mà văn hóa Trung Quỗc phát huy dến cực điểm. Phật học thinh ở đời Đường, lí học ở đời \
    Tỗng; Đường là hoàng kim thời đại của thơ, Tống là hoàng kim thời đại cúa từ: Về sử học và triết học, Đường không có \
    tác phẩm nào lớn; phải tới Tống mới có những bộ sử: Tân Đường thư, Tân Ngũ Đại sử của Âu Dương Tu, Tư trị thông giám của \
    Tư Mã Quang; và những tác phẩm về triết học dung hoà Lão, Khõng, Phật của Chu Đôn Di; Trương Hoành Cử, Trình Minh Đạo, \
    Trình Y Xuyên, Chu Hi. Nhưng xét riêng về những tiểu phẩm bằng tản văn thì Đường Tống thịnh ngang nhau và đều lưu lại \
    nhiều viên ngọc rất quí. Phong trào duy mĩ đến Lục Triều là cực thịnh. Chính lúc nó cực thịnh, đã có một số người vạch \
    ra những sở đoản của nó như Tô Xước triều Nguỵ;""",
    'speed': 1.0 # tốc độ đọc, từ 0.1-1.9 speed càng lớn đọc càng nhanh
    }
resp = requests.get(url=url, params=params)
out = json.loads(resp.content.decode())
print("status_code: ", resp.status_code, "\nTotal_time: ", out['total_time'])
audio_bytes = base64.b64decode(out['audio_bytes'].encode('utf-8'))
with open('./temp2.wav', "wb") as f:
    f.write(audio_bytes)