import './App.css'
import { useEsp32Led } from './hooks/useEsp32Led'
import SmartCard from './components/smartCard';

function App() {
  const livingRoom = useEsp32Led({baseUrl: '/esp32'})

  return (
    <>
      <h1>SmartHome</h1>
      <div className='smarthome-grid-div'>
        <SmartCard
          title={'Living Room'}
          icon={'led'}
          {...livingRoom}
        />
        <SmartCard
          title={'Sove Room'}
          icon={'led'}
        />
        <SmartCard
          title={'Toilet Room'}
          icon={'led'}
        />
        <SmartCard
          title={'Kitchen Room'}
          icon={'led'}
        />
      </div>
    </>
  )
}

export default App
