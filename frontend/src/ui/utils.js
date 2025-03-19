export function randomElementId() {
    return Math.random().toString(36); // in base-36;
}

export function passwordValidator(password) {
    if (! /[A-Z]+/.test(password)) {
        throw new Error('no uppercase letter');
    }
    if (! /[a-z]+/.test(password)) {
        throw new Error('no lowercase');
    }
    if (! /\d+/.test(password)) {
        throw new Error('no digit');
    }
    if (! /[\~\!\@\#\$\%\^\&\*]+/.test(password)) {
        throw new Error('no special charaters ~!@#$%^&*');
    }
    const illegal = password.match(/[^A-Za-z\d~!@#$%^&*]+/);
    if (illegal && illegal.length > 0) {
        const str = illegal.reduce((acc, item, index) => {
            if (index > 0) {
                acc += ', ';
            }
            acc += `'${item}'`;
            return acc;
        }, "");
        throw new Error(`contains unsupported character(s) ${str}`);
    }
}