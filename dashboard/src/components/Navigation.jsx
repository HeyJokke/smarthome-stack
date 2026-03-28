import { SofaIcon, ToiletIcon, DoorOpenIcon, BedIcon, PlusIcon } from "lucide-react"

export default function Navigation() {
    return (
        <div className="navigation-wrapper">
            <button className={`nav-btn`}>
                <SofaIcon className="nav-btn-logo"/>
            </button>
            <button className={`nav-btn`}>
                <DoorOpenIcon className="nav-btn-logo" />
            </button>
            <button className={`nav-btn`}>
                <BedIcon className="nav-btn-logo" />
            </button>
            <button className={`nav-btn`}>
                <PlusIcon className="nav-btn-logo" />
            </button>
        </div>
    )
}