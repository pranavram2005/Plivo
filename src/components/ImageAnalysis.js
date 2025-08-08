import React, { useState, useRef } from "react";
import { Upload, Image, Eye, Loader2, CheckCircle, AlertCircle, Download, Sparkles, Camera } from "lucide-react";

export default function ImageAnalysis() {
  const [image, setImage] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const [description, setDescription] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [isComplete, setIsComplete] = useState(false);
  const fileInputRef = useRef(null);

  // ⚠️ Replace with your real Hugging Face token
  const HF_API_KEY = "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";

  const handleImageUpload = (event) => {
    const file = event.target.files[0];
    if (file && file.type.startsWith('image/')) {
      setImage(file);
      setDescription("");
      setError("");
      setIsComplete(false);
      
      // Create preview URL
      const previewUrl = URL.createObjectURL(file);
      setImagePreview(previewUrl);
    }
  };

  const analyzeImage = async () => {
    if (!image) {
      setError("Please select an image first.");
      return;
    }
    setLoading(true);
    setError("");
    setDescription("");

    try {
      // Convert file to raw bytes
      const arrayBuffer = await image.arrayBuffer();

      const res = await fetch(
        "https://api-inference.huggingface.co/models/nlpconnect/vit-gpt2-image-captioning",
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${HF_API_KEY}`,
            "Content-Type": image.type,
          },
          body: arrayBuffer,
        }
      );

      if (!res.ok) {
        const errText = await res.text();
        throw new Error(`Server error: ${res.status} ${errText}`);
      }

      const data = await res.json();
      setDescription(data[0]?.generated_text || "No description found.");
      setIsComplete(true);
    } catch (err) {
      setError(`Failed to analyze image: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  const exportResults = () => {
    const results = {
      fileName: image?.name,
      description,
      fileSize: image?.size,
      fileType: image?.type,
      processedAt: new Date().toISOString()
    };

    const blob = new Blob([JSON.stringify(results, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${image?.name || 'image'}_analysis.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const resetAnalysis = () => {
    setImage(null);
    setImagePreview(null);
    setDescription("");
    setError("");
    setIsComplete(false);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-purple-50 p-6">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-2">AI Playground</h1>
          <p className="text-gray-600 text-lg">Image Analysis & Description</p>
          <div className="flex items-center justify-center gap-2 mt-4 text-sm text-gray-500">
            <Camera className="w-4 h-4" />
            <span>Upload • Analyze • Describe • Export</span>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Upload Section */}
          <div className="space-y-6">
            <div className="bg-white rounded-xl shadow-lg p-6 border border-gray-100">
              <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
                <Upload className="w-5 h-5 text-purple-600" />
                Upload Image
              </h2>
              
              <div 
                className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center hover:border-purple-400 hover:bg-purple-50 transition-colors cursor-pointer"
                onClick={() => fileInputRef.current?.click()}
              >
                <Image className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-600 mb-2">
                  {image ? image.name : 'Click to upload or drag image file'}
                </p>
                <p className="text-sm text-gray-400">
                  Supports JPG, PNG, GIF, WebP (Max 10MB)
                </p>
              </div>
              
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={handleImageUpload}
                className="hidden"
              />

              {/* Image Preview */}
              {imagePreview && (
                <div className="mt-6">
                  <div className="relative">
                    <img
                      src={imagePreview}
                      alt="Preview"
                      className="w-full h-64 object-cover rounded-lg shadow-md"
                    />
                    <div className="absolute top-2 right-2 bg-black bg-opacity-50 text-white text-xs px-2 py-1 rounded">
                      {(image.size / 1024 / 1024).toFixed(2)} MB
                    </div>
                  </div>
                  <div className="mt-3 text-sm text-gray-600">
                    <p className="font-medium truncate">{image.name}</p>
                    <p>{image.type} • {new Date(image.lastModified).toLocaleDateString()}</p>
                  </div>
                </div>
              )}

              {/* Action Buttons */}
              <div className="flex gap-3 mt-6">
                <button
                  onClick={analyzeImage}
                  disabled={!image || loading}
                  className="flex-1 bg-gradient-to-r from-purple-600 to-pink-600 text-white py-3 px-4 rounded-lg font-medium hover:from-purple-700 hover:to-pink-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all flex items-center justify-center gap-2"
                >
                  {loading ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      Analyzing...
                    </>
                  ) : (
                    <>
                      <Eye className="w-4 h-4" />
                      Analyze Image
                    </>
                  )}
                </button>

                {image && (
                  <button
                    onClick={resetAnalysis}
                    className="px-4 py-3 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg font-medium transition-colors"
                  >
                    Reset
                  </button>
                )}
              </div>
            </div>

            {/* Processing Status */}
            {loading && (
              <div className="bg-white rounded-xl shadow-lg p-6 border border-gray-100">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center">
                    <Loader2 className="w-6 h-6 text-purple-600 animate-spin" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900">Processing Image</h3>
                    <p className="text-gray-600 text-sm">AI is analyzing your image...</p>
                    <div className="w-48 h-2 bg-gray-200 rounded-full mt-2 overflow-hidden">
                      <div className="h-full bg-purple-600 rounded-full animate-pulse" style={{width: '70%'}} />
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Results Section */}
          <div className="bg-white rounded-xl shadow-lg p-6 border border-gray-100">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-semibold flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-pink-600" />
                Analysis Results
              </h2>
              {isComplete && (
                <button
                  onClick={exportResults}
                  className="flex items-center gap-2 px-3 py-1.5 bg-gray-100 hover:bg-gray-200 rounded-lg text-sm font-medium transition-colors"
                >
                  <Download className="w-4 h-4" />
                  Export
                </button>
              )}
            </div>

            {!image && !loading && !isComplete && (
              <div className="text-center py-12 text-gray-500">
                <Image className="w-12 h-12 mx-auto mb-4 text-gray-300" />
                <p>Upload an image to begin analysis</p>
                <p className="text-sm mt-1">Get AI-powered descriptions and insights</p>
              </div>
            )}

            {error && (
              <div className="bg-red-50 border border-red-200 rounded-lg p-4 flex items-start gap-3">
                <AlertCircle className="w-5 h-5 text-red-600 mt-0.5" />
                <div>
                  <div className="font-medium text-red-900">Analysis Failed</div>
                  <div className="text-sm text-red-700 mt-1">{error}</div>
                </div>
              </div>
            )}

            {isComplete && description && (
              <div className="space-y-4">
                {/* Success Banner */}
                <div className="bg-green-50 border border-green-200 rounded-lg p-4 flex items-center gap-3">
                  <CheckCircle className="w-5 h-5 text-green-600" />
                  <div>
                    <div className="font-medium text-green-900">Analysis Complete</div>
                    <div className="text-sm text-green-700">
                      Generated detailed image description
                    </div>
                  </div>
                </div>

                {/* Description Card */}
                <div className="bg-gradient-to-br from-purple-50 to-pink-50 rounded-lg p-6 border border-purple-100">
                  <h3 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
                    <Eye className="w-4 h-4 text-purple-600" />
                    AI Description
                  </h3>
                  <div className="bg-white rounded-lg p-4 shadow-sm">
                    <p className="text-gray-800 leading-relaxed text-lg">
                      {description}
                    </p>
                  </div>
                </div>

                {/* Analysis Details */}
                <div className="grid grid-cols-2 gap-4">
                  <div className="bg-gray-50 rounded-lg p-4">
                    <div className="text-sm font-medium text-gray-600 mb-1">File Size</div>
                    <div className="text-lg font-semibold text-gray-900">
                      {(image.size / 1024 / 1024).toFixed(2)} MB
                    </div>
                  </div>
                  <div className="bg-gray-50 rounded-lg p-4">
                    <div className="text-sm font-medium text-gray-600 mb-1">Format</div>
                    <div className="text-lg font-semibold text-gray-900 uppercase">
                      {image.type.split('/')[1]}
                    </div>
                  </div>
                </div>

                {/* Model Information */}
                <div className="bg-blue-50 rounded-lg p-4 border border-blue-100">
                  <h4 className="font-medium text-blue-900 mb-2">Model Information</h4>
                  <p className="text-sm text-blue-700">
                    <strong>Model:</strong> nlpconnect/vit-gpt2-image-captioning<br />
                    <strong>Provider:</strong> Hugging Face<br />
                    <strong>Type:</strong> Vision Transformer + GPT-2 for image captioning
                  </p>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}