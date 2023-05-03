import React from 'react';
import { createRoot } from 'react-dom/client';
import Hello from './components/Hello';

import "./styles/index.css";
import chessImg from './assets/chess.jpg'

function App() {
  return (
    <div>
      <img src={chessImg} alt="chess" width="500" />
      <Hello />
    </div>
  );
}

const root = createRoot(document.getElementById('root'));
root.render(<App />);