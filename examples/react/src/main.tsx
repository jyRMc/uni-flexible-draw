import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App'
import '../../../lib/styles/index.css'

const globalStyle = document.createElement('style')
globalStyle.textContent = `
html, body, #app {
  margin: 0;
  padding: 0;
  width: 100%;
  height: 100%;
  overflow: hidden;
}
`
document.head.appendChild(globalStyle)

ReactDOM.createRoot(document.getElementById('app')!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
)
