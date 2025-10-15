import { useEffect, useState } from 'react'
import './App.css'

function App() {
  const [apiMessage, setApiMessage] = useState<string>('')

  useEffect(() => {
    fetch('/api/health')
      .then(r => r.json())
      .then(d => setApiMessage(d.message))
      .catch(() => setApiMessage('API not reachable'))
  }, [])

  return (
    <>
      <h1>PERN Starter</h1>
      <p>Server says: {apiMessage}</p>
      <div className="powered-badge">Powered by <span className="celtrix">Celtrix</span></div>
    </>
  )
}

export default App


