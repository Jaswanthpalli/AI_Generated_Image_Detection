import React, { useState } from "react";
import axios from "axios";
import '../assets/scss/styles.scss';
import { jwtDecode } from "jwt-decode";
import ai from '../assets/img/ai.png';

const Predictor = () => {
  const [image, setImage] = useState(null);
  const [previewUrl, setPreviewUrl] = useState(null);
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    setImage(file);
    setPreviewUrl(URL.createObjectURL(file));
    setResult(null);
    setError("");
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!image) return;
     const token = localStorage.getItem('token'); 
    const decoded = jwtDecode(token);
    const userId = decoded.id;

    setLoading(true);
    const formData = new FormData();
    formData.append("image", image);
    formData.append("user_id", userId); 
    try {
      const response = await axios.post("http://localhost:3001/predict", formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });

      setResult(response.data);
    } catch (err) {
      setError(err.response?.data?.message || "Prediction failed.");
      console.error("Error during prediction:", err);
    } finally {
      setLoading(false);
    }
  };
            
  return (
    <section className="about prediction-section" id="about">
      <div className="about__container grid">
        <img src={ai} alt="About" className="about__img" />

        <div className="about__data prediction__form">
          <h2 className="section__title">Upload an Image</h2>
          <form onSubmit={handleSubmit} className="form">
            <input
              type="file"
              accept="image/*"
              name="image"
              onChange={handleImageChange}
              className="form__input"
              required
            />
            <button type="submit" className="button">Predict</button>
          </form>

          {previewUrl && (
  <div className="image-preview">
    <h4 className="image-preview__title">Preview:</h4>
    <img src={previewUrl} alt="preview" className="image-preview__img" />
  </div>
)}

{loading && <p className="status__loading">Predicting...</p>}
{error && <p className="status__error">{error}</p>}

{result && result.success && (
  <div className="result">
    <h3 className="result__title">Prediction Result</h3>
    <p ><strong>Prediction:</strong > <span className="result__res">{result.predicted_class}</span></p>
    <p><strong>Confidence:</strong> <span className="result__res">{(result.confidence_score * 100).toFixed(2)}%</span></p>
  </div>
)}

        </div>
      </div>
    </section>
  );
};

export default Predictor;
