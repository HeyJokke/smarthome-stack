import {
  Lightbulb, WifiOff
} from "lucide-react";

export default function SmartCard({isOn, isBusy, actionError, statusError, toggleLed}) {
    return (
        <div className='smarthome-grid-div'>
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
                    <Lightbulb className='smartCardLogo' style={{width: '20px', height: '20px'}}/>
                  </div>
                  <input readOnly={true} checked={isOn && !actionError} type="checkbox"/>
                  <div className="slide-toggle"></div>
                </div>
                <div className='lowerCardDiv'>
                  <div className='lowerLeftCardDiv'>
                    <h3 className='smartCardTitle' style={{margin: '5px 0'}}>Living Room</h3>
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
                <button className='smartcard-overlay-retry-btn'>
                  <WifiOff style={{width: '40px', height: '40px'}} />
                  <p style={{margin: 'auto', fontWeight: '900'}}>Connection Lost...</p>
                </button>
              </div>
              }
            </div>
          </div>
    )
}
