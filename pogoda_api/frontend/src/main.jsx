// frontend/src/main.jsx
import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.jsx'
import './index.css'
// DODANO IMPORT
import { BrowserRouter } from 'react-router-dom';

ReactDOM.createRoot(document.getElementById('root')).render(
    <React.StrictMode>
        {/* OWIJAMY CAŁĄ APLIKACJĘ W ROUTER */}
        <BrowserRouter>
            <App />
        </BrowserRouter>
    </React.StrictMode>,
)