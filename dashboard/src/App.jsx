import './App.css'
import { useEsp32Led } from './hooks/useEsp32Led'
import SmartCard from './components/smartCard';

function App() {
  const livingRoom = useEsp32Led()

  return (
    <>
      <h1>SmartHome</h1>
      <div className='smarthome-grid-div'>
        <SmartCard
          title={'Living Room'}
          icon={'led'}
          {...livingRoom}
        />
      </div>
    </>
  )
}

export default App
