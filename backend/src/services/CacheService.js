const { createClient } = require('redis')

const client = createClient({
    url: process.env.REDIS_URL,
})

/**
 * 
 * @param {string} key redis key
 * @param {string | number} value redis value
 * @param {integer} expiry number of seconds to expire 
 * @param {boolean | null} ifNotExists 
 * @returns 
 */
async function save(key, value, expiry = 0, ifNotExists = null) {
    const options = {}
    if (expiry > 0) {
        options.EX = expiry // EX means expiration in seconds; this is same as expire key command
    }
    if (ifNotExists === true) {
        // if key already not exits 
        options.NX = true // NX means if not exists then set, if exists then no effect
    }
    else if (ifNotExists === false) {
        options.XX = true // XX means if exists then set, if does not exist then no effect
    }
    
    return 'OK' === await client.set(key, value, options)
}

async function get(key) {
    return await client.get(key)
}

async function saveHash( key, data, expiry = 0) {
    await client.hSet(key, data)
    if (expiry > 0) {
        await client.expire(key, expiry)
    }
}

async function setHash(key, filed, value, ifExists = false) {
    if (ifExists) {
        // ifexists = true means set the value if and only if the field exists
        const exists = await client.hExists(key, filed)
        if (!exists) {
            return false
        }
    }

    const data = {}
    data[filed] = value

    return 1 === await client.hSet(key, data)
}

async function getHash(key, fields = []) {

    // check if key exists
    if (!(await hasKey(key))) {
        return null;
    }

    // if fields are provided the get values for those otherwise get values for all fields
    if (fields && fields.length > 0) {
        // hmGet returns an array of values in the same order fields are given
        // if any field does not exist then null is returned in that place
        // if key does not exists then an array of nulls are returned;
        const values = await client.hmGet(key, fields);
        const data = {} = values.reduce((acc, val, index) => {
            if (val === null) {
                return acc;
            }
            const field = fields[index];
            acc[field] = val;
            return acc;
        },{});
        if (Object.keys(data) == 0) {
            return null;
        }
        return data;
    }
    else {
        const data = await client.hGetAll(key);
        return data;
    }
}

async function remove(key) {
    return 1 === await client.del(key)
}

async function hasKey(key) {
    const keys = await client.keys(key);
    return keys.length !== 0;
}

module.exports = { 
    cacheClient: client, save, saveHash, remove,  getHash, get, setHash,
}