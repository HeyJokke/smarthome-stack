import {
  Lightbulb, WifiOff, CircleQuestionMark
} from "lucide-react";

const iconsObj = {
  'led': Lightbulb,
  'default': CircleQuestionMark
}

export default function SmartCard({title = 'No name', icon, isBusy, actionError, toggleLed, state}) {  
  const IconComponent = iconsObj[icon] ?? iconsObj.default

  return (
    <div className='smartcard-wrapper'>

      <button 
        className={`
          smartCard 
          ${(isBusy && !actionError) ? 'busy' : null} 
          ${(state.led && !isBusy  && !actionError) ? 'on' : null} 
          ${actionError ? 'error' : null}
        `}
        onClick={toggleLed}
        disabled={isBusy || !state.live}
      >
        
        <div className='upperCardDiv'>
          <div className={`smartCardLogoDiv ${(state.led && !isBusy  && !actionError) ? 'on' : null}`}>
            <IconComponent className='smartCardLogo' style={{width: '20px', height: '20px'}}/>
          </div>
          <input readOnly={true} checked={state.led && !actionError} type="checkbox"/>
          <div className="slide-toggle"></div>
        </div>

        <div className='lowerCardDiv'>
          <div className='lowerLeftCardDiv'>
            <h3 style={{margin: '5px 0'}}>{title}</h3>
            <div style={{display: 'flex', justifyContent: 'space-between'}}>
              <p className={`
                ${(isBusy && !actionError) ? 'busy' : null} 
                ${(state.led && !isBusy  && !actionError) ? 'on' : null} 
                ${actionError || !state.live ? 'error' : null}
              `} 
              style={{margin: '5px 0'}}>
              {
                actionError || !state.live ? 'Error' : 
                isBusy ? 'Busy' : 
                state.led ? 'On' : 
                state.led === false ? 'Off' : 
                state.led === null ? 'Connecting...' : null
              }
              </p>
            </div>
          </div>
        </div>

        {!state.live && 
        <div className='smartcard-overlay'>
          <WifiOff style={{width: '40px', height: '40px'}} />
        </div>
        }
      </button>
    </div>
  )
}
