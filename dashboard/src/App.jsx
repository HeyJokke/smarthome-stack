import './App.css'
import { useEsp32Led } from './hooks/useEsp32Led'
import SmartCard from './components/smartCard';

function App() {
  const { isOn, isBusy, actionError, statusError, toggleLed } = useEsp32Led({baseUrl: '/esp32'})

  return (
    <>
      <h1>SmartHome</h1>
      <SmartCard
        isOn={isOn}
        isBusy={isBusy}
        actionError={actionError}
        statusError={statusError}
        toggleLed={toggleLed}
      />
    </>
  )
}

export default App
