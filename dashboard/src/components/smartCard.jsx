import {
  Lightbulb, WifiOff, CircleQuestionMark
} from "lucide-react";

const iconsObj = {
  'led': Lightbulb,
  'default': CircleQuestionMark
}

export default function SmartCard({title = 'No name', icon, isOn, isBusy, actionError, statusError, toggleLed}) {  
  const IconComponent = iconsObj[icon] ?? iconsObj.default
  
  return (
    <div className='smartcard-wrapper'>

      <button 
        className={`
          smartCard 
          ${(isBusy && !actionError) ? 'busy' : null} 
          ${(isOn && !isBusy  && !actionError) ? 'on' : null} 
          ${actionError ? 'error' : null}
        `}
        onClick={toggleLed}
        disabled={isBusy || statusError}
      >
        
        <div className='upperCardDiv'>
          <div className={`smartCardLogoDiv ${(isOn && !isBusy  && !actionError) ? 'on' : null}`}>
            <IconComponent className='smartCardLogo' style={{width: '20px', height: '20px'}}/>
          </div>
          <input readOnly={true} checked={isOn && !actionError} type="checkbox"/>
          <div className="slide-toggle"></div>
        </div>

        <div className='lowerCardDiv'>
          <div className='lowerLeftCardDiv'>
            <h3 className='smartCardTitle' style={{margin: '5px 0'}}>{title}</h3>
            <p className={`
              ${(isBusy && !actionError) ? 'busy' : null} 
              ${(isOn && !isBusy  && !actionError) ? 'on' : null} 
              ${actionError || statusError ? 'error' : null}
            `} 
            style={{margin: '5px 0'}}>{actionError || statusError ? 'Error' : isBusy ? 'Busy' : isOn ? 'On' : 'Off'}</p>
          </div>
        </div>
      </button>

      {statusError && 
      <div className='smartcard-overlay'>
        <WifiOff style={{width: '40px', height: '40px'}} />
        <p style={{height: 'fit-content', margin: '0', fontWeight: '900'}}>Connection Lost...</p>
      </div>
      }
    </div>
  )
}
