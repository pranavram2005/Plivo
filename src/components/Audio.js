import React, { useState } from 'react';
import { Upload, FileAudio, Loader2, Users, FileText, Zap } from 'lucide-react';

function AudioAnalysis() {
  const [file, setFile] = useState(null);
  const [transcript, setTranscript] = useState('');
  const [diarized, setDiarized] = useState('');
  const [summary, setSummary] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [currentStep, setCurrentStep] = useState('');

  const handleUpload = async () => {
    if (!file) return;
    
    setIsProcessing(true);
    setCurrentStep('Uploading file...');
    
    try {
      const formData = new FormData();
      formData.append("audio", file);

      // Step 1: Upload to AssemblyAI
      setCurrentStep('Uploading to AssemblyAI...');
      const uploadRes = await fetch("https://api.assemblyai.com/v2/upload", {
        method: "POST",
        headers: { "authorization": "794768230a2d4558ad75ac728fe0cc3f" },
        body: file
      });
      const uploadUrl = await uploadRes.json();

      // Step 2: Request transcription + diarization
      setCurrentStep('Starting transcription...');
      const transcriptRes = await fetch("https://api.assemblyai.com/v2/transcript", {
        method: "POST",
        headers: {
          "authorization": "794768230a2d4558ad75ac728fe0cc3f",
          "content-type": "application/json"
        },
        body: JSON.stringify({
          audio_url: uploadUrl.upload_url,
          speaker_labels: true
        })
      });
      const { id } = await transcriptRes.json();

      // Step 3: Poll until done
      setCurrentStep('Processing audio...');
      let status;
      let transcriptData;
      do {
        await new Promise(r => setTimeout(r, 3000));
        const res = await fetch(`https://api.assemblyai.com/v2/transcript/${id}`, {
          headers: { "authorization": "794768230a2d4558ad75ac728fe0cc3f" }
        });
        transcriptData = await res.json();
        status = transcriptData.status;
      } while (status !== "completed");

      // Extract transcript + diarization
      setTranscript(transcriptData.text);
      const diarizedText = transcriptData.utterances
        .map(u => `Speaker ${u.speaker}: ${u.text}`)
        .join("\n");
      setDiarized(diarizedText);

      // Step 4: Summarize with OpenAI
      setCurrentStep('Generating summary...');
      const summaryRes = await fetch("/api/summarize", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text: transcriptData.text })
      });
      const { summary } = await summaryRes.json();
      setSummary(summary);
      
      setCurrentStep('Complete!');
    } catch (error) {
      console.error('Error processing audio:', error);
      setCurrentStep('Error occurred');
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="text-center mb-12">
          <div className="flex justify-center mb-4">
            <div className="p-3 bg-indigo-600 rounded-full">
              <FileAudio className="w-8 h-8 text-white" />
            </div>
          </div>
          <h1 className="text-4xl font-bold text-gray-900 mb-4">Audio Analysis Studio</h1>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Upload your audio files to get automatic transcription, speaker identification, and AI-powered summaries
          </p>
        </div>

        {/* Upload Section */}
        <div className="bg-white rounded-2xl shadow-xl p-8 mb-8">
          <div className="text-center">
            <div className="border-2 border-dashed border-indigo-300 rounded-xl p-8 hover:border-indigo-400 transition-colors">
              <Upload className="w-12 h-12 text-indigo-400 mx-auto mb-4" />
              <div className="space-y-4">
                <input
                  type="file"
                  accept="audio/*"
                  onChange={(e) => setFile(e.target.files[0])}
                  className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-indigo-50 file:text-indigo-700 hover:file:bg-indigo-100"
                />
                {file && (
                  <div className="flex items-center justify-center space-x-2 text-sm text-gray-600">
                    <FileAudio className="w-4 h-4" />
                    <span>{file.name}</span>
                    <span className="text-gray-400">({(file.size / 1024 / 1024).toFixed(2)} MB)</span>
                  </div>
                )}
                <button
                  onClick={handleUpload}
                  disabled={!file || isProcessing}
                  className="inline-flex items-center px-6 py-3 border border-transparent text-base font-medium rounded-full shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200"
                >
                  {isProcessing ? (
                    <>
                      <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                      Analyzing...
                    </>
                  ) : (
                    <>
                      <Zap className="w-5 h-5 mr-2" />
                      Analyze Audio
                    </>
                  )}
                </button>
              </div>
            </div>
            
            {/* Progress Indicator */}
            {isProcessing && (
              <div className="mt-6 p-4 bg-indigo-50 rounded-lg">
                <div className="flex items-center justify-center space-x-2 text-indigo-700">
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span className="font-medium">{currentStep}</span>
                </div>
                <div className="mt-3 w-full bg-indigo-200 rounded-full h-2">
                  <div className="bg-indigo-600 h-2 rounded-full animate-pulse" style={{width: '60%'}}></div>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Results Grid */}
        {(transcript || diarized || summary) && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Transcript */}
            {transcript && (
              <div className="bg-white rounded-2xl shadow-lg overflow-hidden">
                <div className="bg-gradient-to-r from-green-500 to-emerald-600 px-6 py-4">
                  <div className="flex items-center space-x-2">
                    <FileText className="w-5 h-5 text-white" />
                    <h3 className="text-lg font-semibold text-white">Full Transcript</h3>
                  </div>
                </div>
                <div className="p-6">
                  <pre className="whitespace-pre-wrap text-sm text-gray-700 leading-relaxed max-h-80 overflow-y-auto bg-gray-50 p-4 rounded-lg">
                    {transcript}
                  </pre>
                </div>
              </div>
            )}

            {/* Speaker Diarization */}
            {diarized && (
              <div className="bg-white rounded-2xl shadow-lg overflow-hidden">
                <div className="bg-gradient-to-r from-purple-500 to-violet-600 px-6 py-4">
                  <div className="flex items-center space-x-2">
                    <Users className="w-5 h-5 text-white" />
                    <h3 className="text-lg font-semibold text-white">Speaker Identification</h3>
                  </div>
                </div>
                <div className="p-6">
                  <pre className="whitespace-pre-wrap text-sm text-gray-700 leading-relaxed max-h-80 overflow-y-auto bg-gray-50 p-4 rounded-lg">
                    {diarized}
                  </pre>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Summary - Full Width */}
        {summary && (
          <div className="mt-8 bg-white rounded-2xl shadow-lg overflow-hidden">
            <div className="bg-gradient-to-r from-orange-500 to-red-500 px-6 py-4">
              <div className="flex items-center space-x-2">
                <Zap className="w-5 h-5 text-white" />
                <h3 className="text-lg font-semibold text-white">AI Summary</h3>
              </div>
            </div>
            <div className="p-6">
              <div className="prose prose-gray max-w-none">
                <pre className="whitespace-pre-wrap text-sm text-gray-700 leading-relaxed bg-gray-50 p-4 rounded-lg">
                  {summary}
                </pre>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default AudioAnalysis;