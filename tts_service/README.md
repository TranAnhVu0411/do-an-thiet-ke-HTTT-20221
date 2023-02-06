## API chuyển text thành audio
Requirements: Python 3.9.x (nên tạo conda env) \
Cài đặt ffmpeg cho Windows: https://www.geeksforgeeks.org/how-to-install-ffmpeg-on-windows/ \
Cài đặt ffmpeg cho Linux: sudo apt-get install ffmpeg \
pip install onnxruntime==1.13.1 requests flask pydub

## Run Flask server

```bash
cd tts_service
python tts_service.py
```

URL [http://127.0.0.1:5005/predict?text=xin%20chào]

Call API mẫu: 
```bash
python test_api.py
```