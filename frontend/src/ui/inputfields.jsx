import { forwardRef, useEffect, useImperativeHandle, useRef, useState } from "react";
import { randomElementId } from "./utils";

function Feedback({ invalidFeedback, validFeedback }) {
    if (invalidFeedback ) {
        return <div className="invalid-feedback">{invalidFeedback}</div>
    }
    else if (validFeedback) {
        return <div className="valid-feedback">{validFeedback}</div>
    }
    else {
        return <></>
    }
}

export function PasswordRules() {
    return (
        <>
            <p className="fw-medium">password must</p>
            <ol>
                <li>be minimum 8 and maximum 32 charaters long</li>
                <li>contain atleast one uppercase character (A-Z)</li>
                <li>contain atleast one lowercase character (a-z)</li>
                <li>contain atleast one digit (0-9)</li>
                <li>contain least one special charater</li>
            </ol>
        </>
    );
}

export const PasswordInput = forwardRef(({ required = false, formLabel, formText,
    validFeedback, invalidFeedback,
    showCounter = false, maxCharacters, 
 }, ref) => {

    const [inputId] = useState(randomElementId());

    const [showPassword, setShowPassword] = useState(false);

    const [inputValue, setInputValue] = useState('');

    const refInput = useRef();

    const [invalidFeedbackState, setInvalidFeedbackState] = useState();

    const nMaxCharacters = maxCharacters ? Number(maxCharacters) : -1;

    useEffect(()=>{
        setInvalidFeedbackState(invalidFeedback);
    },[invalidFeedback])

    useImperativeHandle(ref, () => ({
        getPasswordText() {
            return refInput.current?.value;
        },

        validate(cb) {
            try {
                cb(inputValue);
                setInvalidFeedbackState(null);
                return true;
            }
            catch(error) {
                setInvalidFeedbackState(error.message);
                return false;
            }
        },

        applyDefaultValidation() {
            setInvalidFeedbackState(refInput.current.validationMessage);
        }
    }));

    return (
        <div className="row gx-sm-3 gy-2 align-items-start mb-3">
            {
                formLabel && 
                <div className="col-sm-3">
                    <label htmlFor={inputId} className="form-label">{formLabel}</label>
                </div>
            }
            
            <div className="col-sm-9">
                <div className="input-group ">
                    <input ref={refInput} id={inputId} type={ showPassword ? "text" : "password" } required={required}
                        onChange={(e) => setInputValue(e.target.value)} maxLength={nMaxCharacters > 0 ? nMaxCharacters : undefined}
                        className={`form-control form-control-lg ${validFeedback ? 'is-valid' : ''} ${invalidFeedbackState ? 'is-invalid' : ''}`} />
                    
                    <button onClick={() => setShowPassword(prevState => !prevState)} className="btn btn-outline-secondary" data-bs-toggle="button">
                        { showPassword ? <i className="bi bi-eye-slash-fill"></i> : <i className="bi bi-eye-fill"></i> }
                    </button>
                    
                    <Feedback invalidFeedback={invalidFeedbackState} validFeedback={validFeedback} />
                </div>
                {
                    (formText || showCounter ) &&
                    <div className="row">
                        {formText && <div className="col form-text mt-2">{formText}</div>}
                        <div className="col-auto ">
                            { showCounter && <p className="m-2 fw-medium w-100 text-end text-body-secondary">
                                { inputValue.length }{ nMaxCharacters > 0 && `/${nMaxCharacters}` }</p> }
                        </div>
                    </div>
                }
            </div>
        </div>
    )
})

export const EmailInput = forwardRef(({ required = false, formLabel, formText, validFeedback, invalidFeedback}, ref) => {

    const [inputId] = useState(randomElementId());

    const refInput = useRef();

    const [invalidFeedbackState, setInvalidFeedbackState] = useState();

    useEffect(()=>{
        setInvalidFeedbackState(invalidFeedback);
    },[invalidFeedback])

    useImperativeHandle(ref, () => ({
        getEmailText() {
            return refInput.current?.value;
        },

        applyDefaultValidation() {
            setInvalidFeedbackState(refInput.validationMessage);
        }
    }));

    return (
        <div className="row gx-sm-3 gy-2 align-items-start mb-3">
            {
                formLabel && 
                <div className="col-sm-3">
                    <label htmlFor={inputId} className="form-label">{formLabel}</label>
                </div>
            }
            
            <div className="col-sm-9">
                <input ref={refInput} id={inputId} type="email" required={required}
                            className={`form-control form-control-lg ${validFeedback ? 'is-valid' : ''} ${invalidFeedbackState ? 'is-invalid' : ''}`} />

                <Feedback invalidFeedback={invalidFeedbackState} validFeedback={validFeedback} />

                {formText && <div className="form-text mt-2">{formText}</div>}
            </div>
        </div>
    )
})
