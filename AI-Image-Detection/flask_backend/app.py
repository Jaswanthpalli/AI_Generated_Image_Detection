from flask import Flask, request, jsonify  # type: ignore
from tensorflow.keras.models import load_model  # type: ignore
from tensorflow.keras.applications.resnet50 import preprocess_input  # type: ignore
import numpy as np  # type: ignore
import io
from PIL import Image  # type: ignore
from flask_cors import CORS  # type: ignore

app = Flask(__name__)
CORS(app)

# Load the AI vs Real model
model = load_model('resnet_ai_vs_real_model_5.keras')

# Image size expected by the model (assuming 224x224, adjust if different)
img_height, img_width = 224, 224

@app.route("/predict", methods=["POST"])
def predict():
    try:
        if 'file' not in request.files:
            return jsonify({'error': 'No file part'}), 400

        file = request.files['file']

        if file.filename == '':
            return jsonify({'error': 'No selected file'}), 400

        img = Image.open(io.BytesIO(file.read())).convert("RGB")
        img = img.resize((img_width, img_height))

        img_array = np.array(img)
        img_array = preprocess_input(img_array)
        img_array = np.expand_dims(img_array, axis=0)

        prediction = model.predict(img_array)[0][0]
        label = 'Real' if prediction >= 0.5 else 'AI'
        confidence_score = float(prediction if prediction >= 0.5 else 1 - prediction)

        return jsonify({
            "predicted_class": label,
            "confidence_score": round(confidence_score, 2)  # confidence between 0 and 1
        })

    except Exception as e:
        print("Error during prediction:", e)
        return jsonify({'error': 'Prediction failed'}), 500

if __name__ == "__main__":
    app.run(host="0.0.0.0", port=3001, debug=False)
