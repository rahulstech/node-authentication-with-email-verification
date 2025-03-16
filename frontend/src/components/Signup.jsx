import { Link } from 'react-router-dom';
import { useAppContext } from '../app/AppContext';
import { useRef } from 'react';

export default function Singup() {

    const { user, signup } = useAppContext();

    const refEmail = useRef();
    const refPassword = useRef();
    const refDisplayName = useRef();

    function handleSubmitSignup(event) {
        event.preventDefault();

        const email = refEmail.current.value;
        const password = refPassword.current.value;
        const displayName = refDisplayName.current.value;

        signup({ email, password, displayName });
    }

    let progressBar = "";
    if (user.loading) {
        progressBar = (
            <div className="progress w-75 mx-auto" style={{ height: '5px' }}>
                <div className="progress-bar progress-bar-striped progress-bar-animated w-100"></div>
            </div>
        );
    }

    return (
        <div className="container-fluid vh-100 d-flex justify-content-center align-items-center">
        <div className="row">
            <div className="col-auto">
                <div className="card shadow">
                    { progressBar }
                    <div className="card-body">
                        <div className="card-title mb-4">
                            <h4 className="text-center">Sign Up</h4>
                        </div>
                        <form onSubmit={handleSubmitSignup}>
                            <fieldset disabled={user.loading}>
                                { /* username */}
                                <div className="row align-items-center mb-3">
                                    <div className="col-sm-3">
                                        <label id="labelEmail" className="form-label me-3">Email</label>
                                    </div>
                                    <div className="col-sm">
                                        <input ref={refEmail} aria-labelledby="labelEmail" type="email" className="form-control form-control-lg" required/>
                                    </div>
                                </div>
            
                                { /* password */}
                                <div className="row align-items-center mb-3">
                                    <div className="col-sm-3">
                                        <label id="labelPassword" className="form-label">Password</label>
                                    </div>
                                    <div className="col-sm">
                                        <input ref={refPassword} aria-labelledby="lablePassword" type="password" className="form-control form-control-lg" required />
                                    </div>
                                </div>
            
                                { /* display name */}
                                <div className="row mb-3 gx-3">
                                    <div className="col-sm-3">
                                        <label id="labelDisplayName" className="form-label">Display Name</label>
                                    </div>
                                    <div className="col-sm">
                                        <input ref={refDisplayName} aria-labelledby="labelDisplayName" type="text" className="form-control form-control-lg" required />
                                    </div>
                                </div>
            
                                <button type="submit" className="mt-4 btn btn-primary w-100" >Create Account</button>
            
                                <div className="mt-2 d-flex justify-content-center align-items-center">
                                    <span className="text-body-secondary">Already have an account?</span>
                                    <Link to="/login" className="btn btn-link">Login</Link>
                                </div>
                            </fieldset>
                            
                        </form>
                    </div>
                </div>
            </div>
        </div>
        </div>
    )
}