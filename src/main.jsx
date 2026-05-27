import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.jsx'
import './index.css'

// Professional Theme Initialization (Prevents flickering/resets)
const initTheme = () => {
  const savedTheme = localStorage.getItem('app-theme');
  if (savedTheme === 'Dark Mode') {
    document.body.classList.add('dark-mode');
  } else if (savedTheme === 'Light Mode') {
    document.body.classList.remove('dark-mode');
  } else {
    const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    if (prefersDark) document.body.classList.add('dark-mode');
  }
};
initTheme();

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
)
