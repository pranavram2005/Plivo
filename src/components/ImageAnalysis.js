import React, { useState } from "react";

export default function ImageAnalysis() {
  const [image, setImage] = useState(null);
  const [description, setDescription] = useState("");

  const analyzeImage = async () => {
    const formData = new FormData();
    formData.append("image", image);

    const res = await fetch("http://localhost:5000/api/analyze-image", {
      method: "POST",
      body: formData,
    });
    const data = await res.json();
    setDescription(data.description);
  };

  return (
    <div>
      <h2>Image Analysis</h2>
      <input type="file" accept="image/*" onChange={(e) => setImage(e.target.files[0])} />
      <button onClick={analyzeImage}>Analyze</button>
      <p>{description}</p>
    </div>
  );
}
