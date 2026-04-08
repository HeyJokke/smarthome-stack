import './App.css'
import { useEsp32State } from './hooks/useEsp32State'
import SmartCard from './components/smartCard';
import SmartGraph from './components/smartGraph';
import Navigation from './components/Navigation';

function App() {
  const livingRoom = useEsp32State({device: 'livingroom'})

  return (
    <>
      <div className='smarthome-grid-div'>
        <Navigation />

        <SmartGraph telemetryData={livingRoom.telemetryData}/>

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
