import './App.css'
import { useEsp32State } from './hooks/useEsp32State'
import SmartCard from './components/smartCard';
import SmartGraph from './components/smartGraph';

function App() {
  const livingRoom = useEsp32State({device: 'livingroom'})

  return (
    <>
      <div className='smarthome-grid-div'>
        <SmartGraph device={livingRoom}/>
        <SmartGraph device={livingRoom}/>
        <SmartCard
          title={'Living Room'}
          icon={'led'}
          {...livingRoom}
        />

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
