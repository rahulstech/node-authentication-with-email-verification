import { Link, Navigate } from 'react-router-dom';
import { useAppContext } from '../app/AppContext';
import { useEffect, useRef } from 'react';
import { PasswordInput } from '../ui/inputfields';

export default function Singup() {

    const { userState, signup } = useAppContext();

    const refSignupForm = useRef();
    const refEmail = useRef();
    const refPassword = useRef();
    const refDisplayName = useRef();

    

    function handleSubmitSignup(event) {
        event.preventDefault();

        if (!event.target.checkValidity()) {
            refEmail.current.classList.remove('is-invalid');
            refEmail.current.classList.remove('is-valid');
            refPassword.current.classList.remove('is-invalid');
            refPassword.current.classList.remove('is-valid');
            refDisplayName.current.classList.remove('is-invalid');
            refDisplayName.current.classList.remove('is-valid');
            event.target.classList.add('was-validated');
            return;
        }

        const email = refEmail.current.value;
        const password = refPassword.current.value;
        const displayName = refDisplayName.current.value;

        signup({ email, password, displayName });
    }

    useEffect(() => {
        refSignupForm.current.classList.remove('was-validated');
    }, [userState.error]);

    if (null !== userState.user) {
        return <Navigate to="/profile" replace={true} />
    }
    else {
        return (
            <div className="container-fluid vh-100 d-flex justify-content-center align-items-center">
            <div className="row">
                <div className="col-auto">
                    <div className="card shadow">
                        { 
                            userState.loading &&
                            <div className="progress w-75 mx-auto" style={{ height: '5px' }}>
                                <div className="progress-bar progress-bar-striped progress-bar-animated w-100"></div>
                            </div>
                        }
                        <div className="card-body">
                            <div className="card-title mb-4">
                                <h4 className="text-center">Sign Up</h4>
                            </div>
                            <form ref={refSignupForm} onSubmit={handleSubmitSignup}>
                                <fieldset disabled={userState.loading}>
                                    { /* username */}
                                    <div className="row align-items-center mb-3">
                                        <div className="col-sm-3">
                                            <label id="labelEmail" className="form-label me-3">Email</label>
                                        </div>
                                        <div className="col-sm">
                                            <input ref={refEmail} aria-labelledby="labelEmail" type="email" 
                                            className={`form-control form-control-lg ${userState.errors?.email && 'is-invalid'}`} required/>
                                            {
                                                userState.errors?.email &&
                                                <div className="invalid-feedback">{ userState.errors?.email }</div>
                                            }
                                        </div>
                                    </div>
                
                                    { /* password */}
                                    <PasswordInput showCounter={true} maxCharacters={32} formLabel="Password" invalidFeedback={userState.errors?.password} />
                
                                    { /* display name */}
                                    <div className="row mb-3 gx-3">
                                        <div className="col-sm-3">
                                            <label id="labelDisplayName" className="form-label">Display Name</label>
                                        </div>
                                        <div className="col-sm">
                                            <input ref={refDisplayName} aria-labelledby="labelDisplayName" type="text" 
                                            className={`form-control form-control-lg ${userState.errors?.displayName && 'is-invalid'}`} required />
                                            {
                                                userState.errors?.displayName &&
                                                <div className="invalid-feedback">{userState.errors?.displayName}</div>
                                            }
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
        );
    }
}