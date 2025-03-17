import { Link, Outlet, useNavigate, useSearchParams } from "react-router-dom";
import { useAppContext } from "../app/AppContext";
import { useEffect } from "react";

export default function Profile() {
    const { userState, logout } = useAppContext();
    const navigate = useNavigate();

    useEffect(() => {
        if (null === userState.user) {
            navigate('/login');
        }
    }, [userState.user]);

    function handleClickLogout() {
        logout();
    }

    return (
        <div className="container-fluid px-0">
            <nav className="navbar bg-primary-subtle">
                <div className="container-fluid d-flex align-items-center justify-content-between">
                    <h4><Link className="navbar-brand" to="/profile">{userState.user?.displayName}</Link></h4>
                    <button onClick={handleClickLogout} className="btn btn-text">Logout</button>
                </div>
            </nav>

            <Outlet />

        </div>
    )
}

export function UserProfile() {
    const { userState } = useAppContext();

    return (
        <div className="container-fluid d-flex justify-content-center">
                <div className="card m-4 p-0">
                    <div className="card-body">
                        <div className="mb-2 px-2 py-2">
                            <p className="mb-2 fs-4">
                                {userState.user?.email}
                                {
                                    userState.user?.verified ? 
                                        <i className="bi bi-patch-check-fill text-info m-2"></i>
                                    : 
                                        <span className="m-2 fs-6 text-danger">(Not verified)</span>
                                }
                                
                            </p>
                            <p className="fs-6 fw-medium"><span className="text-body-secondary">Email</span></p>
                        </div>

                        
                    </div>
                </div>
            </div>
    )
}

export function Verifier(){

    const { userState } = useAppContext();
    const [ searchParams ] = useSearchParams();

    useEffect(() => {

        

    }, [searchParams]);

    return (
        <div className="container-fluid d-flex justify-content-center">
            
            <div className="alert alert-danger">

            </div>
        </div>
    )
}