import { Link, Navigate, Outlet, useNavigate, useSearchParams } from "react-router-dom";
import { useAppContext } from "../app/AppContext";
import { useEffect, useRef } from "react";
import {EmailInput, PasswordInput, PasswordRules} from "../ui/inputfields.jsx";
import { passwordValidator } from "../ui/utils.js";

export default function Profile() {
    const { userState, logout } = useAppContext();

    if (null === userState.user) {
        return <Navigate to="/login" replace={true} />
    }
    else {
        return (
            <div className="container-fluid px-0">
                <nav className="navbar bg-primary-subtle">
                    <div className="container-fluid d-flex align-items-center justify-content-between">
                        <h4><Link className="navbar-brand" to="/profile">{userState.user?.displayName}</Link></h4>
                        <button onClick={() => logout()} className="btn btn-text">Logout</button>
                    </div>
                </nav>
    
                <Outlet />
    
            </div>
        )
    }
}

export function UserProfile() {
    const { userState } = useAppContext();

    return (
        <div className="row justify-content-center">
            <div className="col-sm-8">
                <div className="card m-4 p-0">
                    <div className="card-body px-3">
                        <div className="mb-2">
                            <div className="mb-2 fs-4 row">
                                <div className="col">
                                    { userState.user?.verified && <i className="bi bi-patch-check-fill text-info m-2"></i> }
                                    {userState.user?.email}
                                </div>
                                {
                                    userState.user?.verified &&
                                    <div className="col-auto">
                                        <Link to="/profile/update/email" className="btn btn-outline-secondary">Change</Link>
                                    </div>
                                }
                            </div>
                            <p className="fs-6 fw-medium"><span className="text-body-secondary">Email</span></p>
                        </div>

                        <div className="mb-3">
                            <div className="mb-2 row">
                                <div className="col fs-3">
                                    { userState.user?.hasPassword ? "Yes" : "No" }
                                </div>
                                {
                                    userState.user?.hasPassword &&
                                    <div className="col-auto">
                                        <Link to="/profile/update/password" className="btn btn-outline-secondary">Change</Link>
                                    </div>
                                }
                            </div>
                            <p className="fs-6 fw-medium"><span className="text-body-secondary">Password</span></p>
                        </div>
                    </div>
                </div>
            </div>   
        </div>
    )
}

function VerificationComponent({ loading, message, success }) {
    let uiContent = "";
    if (loading) {
        uiContent = (
            <div className="card m-4">
                <div className="card-body">
                    <h4 className="text-center">{message}</h4>
                    <div className="progress mt-4 mx-auto">
                        <div className="progress-bar progress-bar-striped progress-bar-animated w-100"></div>
                    </div>
                </div>
            </div>
        );
    }
    else {
        uiContent = <div className={`alert ${ success ? 'alert-success' : 'alert-danger'} m-3`}>{message}</div>
    }

    return (
        <div className="row justify-content-center">
            <div className="col-sm-8 ">{uiContent}</div>
        </div>
    );  
}

export function EmailVerification() {
    const { userState, verifyEmail } = useAppContext();
    const [ searchParams ] = useSearchParams();

    useEffect(() => {
        const token = searchParams.get('token');
        verifyEmail(token);
    }, [searchParams]);

    return <VerificationComponent loading={userState.loading} success={userState.errors === null} 
            message={ userState.loading ? "Verifying Email" : userState.errors?.description }  />
}

export function UpdatePassword() {

    const { userState, changePassword } = useAppContext();
 
    const refChangePasswordForm = useRef();
    const refCurrentPassword = useRef();
    const refNewPassword = useRef();
    const navigate = useNavigate();

    function handleSubmitChangePasswordForm(e) {
        e.preventDefault();

        if (!e.target.checkValidity()) {
            e.target.classList.add('was-validated');
            return;
        }
        
        if (!refNewPassword.current.validate(passwordValidator)) {
            return;
        }

        const currentPassword = refCurrentPassword.current.getPasswordText();
        const newPassword = refNewPassword.current.getPasswordText();

        changePassword(newPassword, currentPassword);
    }

    if (!userState.loading) {
        if (userState.errors) {
            refChangePasswordForm.current.classList.remove('was-validated');
        }
        else {
            // TODO: change the navigate logic
            navigate('/profile');
        }
    }

    return (
        <section className="card">
            <div className="card-body">
                <div className="car-title">
                    <div className="h4 mb-4 text-center">Change Password</div>
                </div>
                <form ref={refChangePasswordForm} onSubmit={handleSubmitChangePasswordForm} noValidate={true} >
                    <fieldset className="d-flex flex-column justify-content-end" disabled={userState.loading}>
                        {/* current password */}
                        <PasswordInput ref={refCurrentPassword} required={true} formLabel="Current Password" formText="enter your current password"
                            invalidFeedback={ userState.errors?.password } />
                        
                        {/* new password */}
                        <PasswordInput ref={refNewPassword} showCounter={true} maxCharacters={32} required={true} formLabel="New Password" 
                         formText={<PasswordRules/>}invalidFeedback={ userState.errors?.newPassword } />

                        <button className="btn btn-primary">Change</button>

                    </fieldset>
                </form>
            </div>
        </section>
    )
}

export function UpdateEmail() {

    const { userState } = useAppContext();

    const refChangeEmailForm = useRef();
    
    const refNewEmail = useRef();

    function handleSubmitChangeEmailForm(e) {
        e.preventDefault();
    }

    return (
        <section className="card">
            <div className="card-body">
                <div className="car-title">
                    <div className="h4 mb-4 text-center">Change Email</div>
                </div>
                <form ref={refChangeEmailForm} onSubmit={handleSubmitChangeEmailForm} noValidate={true} >
                    <fieldset className="d-flex flex-column justify-content-end">
                        {/* current password */}
                        <EmailInput ref={refNewEmail} required={true} formLabel="New Email" invalidFeedback={userState.errors?.email} />
                        
                        <button className="btn btn-primary">Change</button>

                    </fieldset>
                </form>
            </div>
        </section>
    )
}

export function UpdateProfile() {

    return (
        <div className="container-fluid p-4">
            <main className="row justify-content-center">
                <div className="col-md-8">
                    <Outlet />
                </div>
            </main>
            
        </div>
    )
}