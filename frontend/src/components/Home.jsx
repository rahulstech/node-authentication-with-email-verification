import { useAppContext } from "../app/AppContext"
import { Link, Navigate } from "react-router-dom";

export default function Home() {

    const { userState } = useAppContext();
    
    if (null !== userState.user) {
        return <Navigate to="/profile" replace={true} />
    }
    return (
        <nav className="navbar bg-primary-subtle">
            <div className="container-fluid px-0 d-fx justify-content-end">
                <Link to="/login" className="btn btn-text mx-2" >Login</Link>
                <Link to="/signup" className="btn btn-primary mx-2" >Signup</Link>
            </div>
        </nav>
    )
}