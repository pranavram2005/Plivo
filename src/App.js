import logo from './logo.svg';
import './App.css';
import Audio from './components/Audio';
import ImageAnalysis from './components/ImageAnalysis';
import Summarizer from './components/Summarizer';

function App() {
  return (
    <div className="App">
      <Audio/>
      <ImageAnalysis/>
      <Summarizer/>
    </div>
  );
}

export default App;
