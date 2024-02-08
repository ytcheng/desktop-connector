import React from "react"
import { createRoot } from 'react-dom/client';

// import ReactDOM from "react-dom"
import App from "src/entry"
import "src/styles.css"
const container = document.getElementById('root')!;
const root = createRoot(container); // createRoot(container!) if you use TypeScript

root.render(
    <App />
);
