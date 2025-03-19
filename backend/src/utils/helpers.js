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

function getGMTSecondsDifferenceFromNow(gmtEnd) {
    const gmtNow = Math.floor(Date.now() / 1000);
    return Math.abs(gmtNow - gmtEnd);
}

function formatSeconds(seconds) {
    const hours = Math.floor(seconds/3600);
    const mins = Math.floor(seconds/60);
    const secs = Math.floor(seconds%60);

    let time = "";
    if (hours > 0) {
        time += `${hours} hours`;
    }
    if (mins > 0) {
        time += ` ${mins} minutes`;
    }
    if (secs > 0) {
        time += ` ${secs} seconds`;
    }
    return time;
}

module.exports = {
    hashPassword, verifyPassword, pickOnly, formatSeconds, getGMTSecondsDifferenceFromNow,
}