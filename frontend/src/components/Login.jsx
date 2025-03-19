import { useRef } from 'react';
import { Link, Navigate, useSearchParams } from 'react-router-dom';
import { useAppContext } from '../app/AppContext.jsx';
import { useEffect } from 'react';
import { EmailInput, PasswordInput, PasswordRules } from '../ui/inputfields.jsx';
import { passwordValidator } from '../ui/utils.js';

export function Login() {
    const { userState, login } = useAppContext();
    const refEmail = useRef();
    const refPassword = useRef();
    const refLoginForm = useRef();

    function handleSubmitLogin(event) {
        event.preventDefault();
        if (!event.target.checkValidity()) {
            event.target.classList.add('was-validated');
            return;
        }

        const email = refEmail.current.getEmailText();
        const password = refPassword.current.getPasswordText();
        login({ email, password });
    }

    useEffect(() => {
        refLoginForm.current.classList.remove('was-validated');
    }, [userState.errors]);

    if ( null !== userState.user ){
        return <Navigate to="/profile" replace={true} />
    }
    else {
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
                                    <EmailInput ref={refEmail} formLabel="Emal" required={true} invalidFeedback={userState.errors?.email } />
    
                                    { /* Password */ }
                                    <PasswordInput ref={refPassword} required={true} formLabel="Password" invalidFeedback={userState.errors?.password} />
    
                                    <div className="d-flex justify-content-end">
                                        <Link to="/forgetpassword" className="btn btn-link">Forget Password</Link>
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
        );
    }
}

export function ForgetPassword() {
    const { userState, loadingState, sendPasswordResetLink } = useAppContext();
    const refEmail = useRef();

    function handleSubmit(e) {
        e.preventDefault();

        if (!e.target.checkValidity()) {
            e.target.classList.add('was-validated');
            refEmail.current.applyDefaultValidation();
            return;
        }

        const email = refEmail.current.getEmailText();
        sendPasswordResetLink(email);
    }

    if (null !== userState.user) {
        return <Navigate to="/profile" replace={true} />
    }
    if (loadingState.completed && !loadingState.failed) {
        return <Navigate to="/" replace={true} />
    }
    return (
        <div className="row m-4 justify-content-center align-items-center">
            <div className="col-sm-8">
                <div className="card shadow">
                    <div className="card-body">
                        <form onSubmit={handleSubmit} noValidate={true}>
                            <fieldset disabled={userState.loading}>
                                <EmailInput ref={refEmail} required={true} formLabel="Email" invalidFeedback={loadingState.errors?.email}
                                    formText="enter your login email. if the email is associate to any account, a link will be send to this email. you can then goto the link and change the password." />
                                
                                <button className="w-100 btn btn-primary">Send Password Reset Link</button>
                            </fieldset>
                        </form>
                        <p className="d-flex w-100 justify-content-center mt-3">
                            Remember password? <Link to="/login" className="ms-2">Login</Link>
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
}

export function ResetPassword() {

    const { userState, loadingState, resetPassword } = useAppContext();
    const [searchParams] = useSearchParams();
    const refPassword = useRef();

    function handleSubmit(e) {
        e.preventDefault();
        if (!e.target.checkValidity()) {
            e.target.classList.add('was-validated');
            refPassword.current.applyDefaultValidation();
            return;
        }
        if (!refPassword.current.validate(passwordValidator)) {
            e.target.classList.remove('was-validated');
            return;
        }

        const token = searchParams.get('Reset-Token');
        const newPassword = refPassword.current.getPasswordText();
        resetPassword(token,newPassword);
    }

    if (null !== userState.user) {
        return <Navigate to="/profile" replace={true} />
    }
    else if (loadingState.completed && !loadingState.failed) {
        return <Navigate to="/login" replace={true} />
    }
    return (
        <div className="row m-4 justify-content-center align-items-center">
            <div className="col-sm-8">
                <div className="card shadow p-3">
                    <div className="card-body">
                        <form onSubmit={handleSubmit} noValidate={true}>
                            <fieldset disabled={userState.loading}>
                                <PasswordInput ref={refPassword} required={true} formLabel="New Password" invalidFeedback={loadingState.errors?.password}
                                 formText={<PasswordRules />} showCounter={true} maxCharacters={32} />
                                
                                <button className="w-100 btn btn-primary">Change Password</button>
                            </fieldset>
                        </form>
                    </div>
                </div>
            </div>
        </div>
    );
}