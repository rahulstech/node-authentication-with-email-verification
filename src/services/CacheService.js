const { createClient } = require('redis')

const { REDIS_HOST, REDIS_PORT } = process.env

const client = createClient({
    url: `redis://${REDIS_HOST}:${REDIS_PORT}`,
})

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
    
    return await client.set(key, value, options)
}

async function get(key) {
    return await client.get(key)
}

async function saveHash( key, data, expiry = 0) {
    const changes = await client.hSet(key, data)
    if (changes !== Object.keys(data).length) {
        return false
    }
    if (expiry > 0) {
        await client.expire(key, expiry)
    }
    return true
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

async function getHash(key) {
    const data = await client.hGetAll(key)
    if (!data) {
        return null
    }
    return data
}

async function remove(key) {
    await client.del(key)
}

module.exports = { 
    cacheClient: client, save, saveHash, remove,  getHash, get, setHash,
}