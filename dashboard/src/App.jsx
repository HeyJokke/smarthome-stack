import './App.css'
import { useEsp32Led } from './hooks/useEsp32Led'
import SmartCard from './components/smartCard';

function App() {
  const livingRoom = useEsp32Led({baseUrl: '/esp32'})

  return (
    <>
      <h1>SmartHome</h1>
      <SmartCard
        title={'Living Room'}
        icon={'led'}
        {...livingRoom}
      />
    </>
  )
}

export default App
