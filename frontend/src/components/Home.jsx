import { useEffect } from "react";
import { useAppContext } from "../app/AppContext"
import { Link, useNavigate } from "react-router-dom";

export default function Home() {

    const { userState } = useAppContext();
    const navigate = useNavigate();

    useEffect(() => {
        // if logged in navigate to /profile route
        if (null !== userState.user) {
            navigate('/profile');
        }
    }, [userState.user]);
    
    return (
        <nav className="navbar bg-primary-subtle">
            <div className="container-fluid px-0 d-fx justify-content-end">
                <Link to="/login" className="btn btn-text mx-2" >Login</Link>
                <Link to="/signup" className="btn btn-primary mx-2" >Signup</Link>
            </div>
        </nav>
    )
}