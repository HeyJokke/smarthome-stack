import React from 'react'
import './App.css'

function App() {
  const [isOn, setIsOn] = React.useState(false)
  const [isBusy, setIsBusy] = React.useState(false)
  const [error, setError] = React.useState(null)
  
  const ESP32_BASE = '/esp32'
  
  async function toggleLed() {
    try {
      setIsBusy(true)
      setError(null)
      
      const next = !isOn
      const path = next ? '/led/on' : '/led/off'
      
      const res = await fetch(`${ESP32_BASE}${path}`)
      
      if (!res.ok) throw new Error(`HTTP error: ${res.status}`)
        
        setIsOn(next)
      } catch(err) {
        setError(err?.message ?? 'An unknown error occured')
        console.error(error)
      } finally {
        setIsBusy(false)
      }
    }

    React.useEffect(() => {
      async function getLedStatus() {
        try {
          setIsBusy(true)
          setError(null)

          const res = await fetch(`${ESP32_BASE}/status`)
          if (!res.ok) throw new Error(`HTTP error: ${res.status}`)

          const data = await res.json()
  
          if (data.LED === 'ON') {
            setIsOn(true)
          }
          if (data.LED === 'OFF') {
            setIsOn(false)
          }
        } catch(err) {
          setError(err?.message ?? 'An unknown error occured')
          console.error(error)
        } finally {
          setIsBusy(false)
        }
      }
      
      getLedStatus()
    }, [])
    

  return (
    <>
      <h1>SmartHome</h1>
      <button 
        className={`
          smartCard 
          ${(isBusy && !error) ? 'busy' : null} 
          ${(isOn && !isBusy  && !error) ? 'on' : null} 
          ${error ? 'error' : null}
        `}
        onClick={toggleLed}
        disabled={isBusy}
      >
        <h3>Living Room</h3>
      </button>
    </>
  )
}

export default App
