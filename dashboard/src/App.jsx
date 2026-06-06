import './App.css'
import { useEsp32State } from './hooks/useEsp32State'
import SmartCard from './components/smartCard';
import SmartGraph from './components/smartGraph';

function App() {
  const livingRoom = useEsp32State({device: 'livingroom'})
  const office = useEsp32State({device: 'office'})
  return (
    <>
      <div className='smarthome-grid-div'>
        <SmartGraph device={livingRoom}/>
        <SmartGraph device={office}/>
        <SmartCard
          title={'Living Room'}
          icon={'led'}
          {...livingRoom}
        />

        <SmartCard
          title={'Office'}
          icon={'led'}
          {...office}
        />

        
        
      </div>
    </>
  )
}

export default App
