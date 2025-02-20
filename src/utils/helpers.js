const bcrypt = require('bcrypt');

async function hashPassword(plainPassword) {
    const hashPassword = await bcrypt.hash(plainPassword, Number(process.env.BCRYPT_ROUNDS) || 10)
    return hashPassword
}

async function verifyPassword(plain, hash) {
    return await bcrypt.compare(plain, hash);
}

function pickOnly(src, props, dest = {}) {
    dest = !dest ? {} : dest;
    if (!src || !Array.isArray(props) || props.length === 0) {
        return dest;
    }
    Object.entries(src).forEach(([k,v]) => {
        if (props.includes(k)) {
            dest[k] = v;
        }
    })
    return dest;
}

module.exports = {
    hashPassword, verifyPassword, pickOnly,
}