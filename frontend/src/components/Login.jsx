import { useRef } from 'react';
import { Link } from 'react-router-dom';
import { useAppContext } from '../app/AppContext.jsx';
import { useEffect } from 'react';

export default function Login() {
    const { userState, login } = useAppContext();
    const refEmail = useRef();
    const refPassword = useRef();
    const refLoginForm = useRef();

    function handleSubmitLogin(event) {
        event.preventDefault();

        if (!event.target.checkValidity()) {
            event.target.classList.add('was-validated');
            refEmail.current.classList.remove('is-invalid');
            refPassword.current.classList.remove('is-invalid');
            return;
        }

        const email = refEmail.current.value;
        const password = refPassword.current.value;

        login({ email, password });
    }

    useEffect(() => {
        refLoginForm.current.classList.remove('was-validated');

        if (!userState.errors) {
            refEmail.current.classList.remove('is-invalid');
            refEmail.current.classList.remove('is-invalid');
            return;
        }

        if (userState.errors.email) refEmail.current.classList.add('is-invalid');
        if (userState.errors.password) refPassword.current.classList.add('is-invalid');

    }, [userState.errors]);

    if (!userState.loading) {
        console.log('user: ', userState.user);
    }

    return (
        <div className="container-fluid vh-100 d-flex align-items-center justify-content-center">
            <div className="row">
                <div className="col-auto">
                    <div className="card shadow">

                        { userState.loading &&
                            <div className="progress w-75 mx-auto" style={{ height: '5px' }}>
                                <div className="progress-bar progress-bar-striped progress-bar-animated w-100"></div>
                            </div> 
                        }

                        <div className="card-body">
                            <div className="card-title mb-4">
                                <h4 className="text-center">Login</h4>
                            </div>
                            <form onSubmit={handleSubmitLogin} ref={refLoginForm} noValidate={true}>
                                { /* Email */ }
                                <div className="row mb-3 align-items-center">
                                    <div className="col-sm-3">
                                        <label id="labelEmail" className="form-label">Email</label>
                                    </div>
                                    <div className="col-sm">
                                        <input ref={refEmail} aria-labelledby="labelEmail" type="email" className="form-control form-control-lg" required />
                                        { userState.errors?.email && <div className="invalid-feedback">{userState.errors.email}</div> } 
                                    </div>
                                </div>

                                { /* Password */ }
                                <div className="row mb-3 align-items-center">
                                    <div className="col-sm-3">
                                        <label id="labelPassword" className="form-label ">Password</label>
                                    </div>
                                    <div className="col-sm">
                                        <input ref={refPassword} aria-labelledby="inputPassword" type="password" className="form-control form-control-lg" required/>
                                        { userState.errors?.password && <div className="invalid-feedback">{userState.errors.password}</div> } 
                                    </div>
                                </div>

                                <div className="d-flex justify-content-end">
                                    <Link to="#" className="btn btn-link">Forget Password</Link>
                                </div>
                                
                                <button type="submit" className="btn btn-primary w-100 mt-3">Login</button>

                                <div className="mt-2 d-flex align-items-center justify-content-center">
                                    <span className="text-body-secondary">Don't have account?</span>
                                    <Link to="/signup" className="btn btn-link">Sign Up</Link>
                                </div>
                            </form>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}