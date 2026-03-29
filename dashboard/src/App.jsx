import './App.css'
import { useEsp32Led } from './hooks/useEsp32Led'
import SmartCard from './components/smartCard';
import SmartGraph from './components/smartGraph';
import Navigation from './components/Navigation';

function App() {
  const livingRoom = useEsp32Led({device: 'livingroom'})

  return (
    <>
      <h1>SmartHome</h1>
      <div className='smarthome-grid-div'>
        <Navigation />

        <SmartGraph/>

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
