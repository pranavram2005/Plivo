import React, { useState, useEffect } from "react";
import { pipeline } from "@xenova/transformers";

// Cache model instance so it loads only once
let imageToTextPipeline = null;

export default function ImageAnalysis() {
  const [image, setImage] = useState(null);
  const [description, setDescription] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [modelLoading, setModelLoading] = useState(true);

  // Load model when component mounts
  useEffect(() => {
    async function loadModel() {
      try {
        setModelLoading(true);
        imageToTextPipeline = await pipeline(
          "image-to-text",
          "Xenova/vit-gpt2-image-captioning"
        );
      } catch (err) {
        setError(`Model load error: ${err.message}`);
      } finally {
        setModelLoading(false);
      }
    }
    loadModel();
  }, []);

  const analyzeImage = async () => {
    if (!image) {
      setError("Please select an image first.");
      return;
    }
    if (!imageToTextPipeline) {
      setError("Model not loaded yet.");
      return;
    }

    setLoading(true);
    setError("");
    setDescription("");

    try {
      const output = await imageToTextPipeline(image);
      setDescription(output[0]?.generated_text || "No description found.");
    } catch (err) {
      setError(`Failed to analyze image: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-4 max-w-md mx-auto bg-white rounded-xl shadow-md space-y-4">
      <h2 className="text-xl font-bold">Image Analysis</h2>

      {modelLoading && <p className="text-gray-500">Loading model...</p>}

      <input
        type="file"
        accept="image/*"
        onChange={(e) => {
          setImage(e.target.files[0]);
          setDescription("");
          setError("");
        }}
        className="block w-full text-sm text-gray-500
                   file:mr-4 file:py-2 file:px-4
                   file:rounded-full file:border-0
                   file:text-sm file:font-semibold
                   file:bg-blue-50 file:text-blue-700
                   hover:file:bg-blue-100"
      />

      <button
        onClick={analyzeImage}
        disabled={loading || modelLoading}
        className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 disabled:bg-gray-400"
      >
        {loading ? "Analyzing..." : "Analyze"}
      </button>

      {error && <p className="text-red-500">{error}</p>}
      {description && (
        <p className="p-2 bg-gray-100 rounded">{description}</p>
      )}
    </div>
  );
}
