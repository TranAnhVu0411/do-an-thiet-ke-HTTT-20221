import base64, time, numpy as np
from onnx_jets import OnnxJETS, split_seq
from get_phonemes import text2seq
from flask import Flask, request
app = Flask(__name__)

model = OnnxJETS("model_weight/jets.ort", "model_weight/config.yaml")

@app.route('/predict', methods=['GET'])
def predict():
    stime = time.time()
    text = request.args['text']
    speed = request.args.get('speed', 1.0)
    seq = text2seq(text)
    if len(seq) < 500:
        model.text2wav(seq, './temp.mp3', speed)
    else:
        cc_wav = np.array([])
        for i in split_seq(seq):
            wav, dur = model(i, speed).values()
            dur *= model.config['hop_length']
            cc_wav = np.concatenate([cc_wav, wav[dur[0]:-dur[-1]]])
        model.arr2wav(cc_wav, './temp.mp3')

    with open('./temp.mp3', "rb") as f:
        audio_bytes = f.read()
    body = {'audio_bytes': base64.b64encode(audio_bytes).decode("utf-8"),
            'total_time': time.time()-stime}
    return body

if __name__ == "__main__":
	app.run(debug=True,port=5005)