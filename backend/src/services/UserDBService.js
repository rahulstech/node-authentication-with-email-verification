const { User } = require('../models/index');

async function insertUser(userData) {
    const newUser = await User.create(userData);
    return newUser.toJSON();
}

async function findUser(matchAll, fields = []) {
    const user = await User.findOne({
        raw: true,
        attributes: fields && fields.length > 0 ? fields : undefined,
        where: {
            ...matchAll
        },
    });
    if (!user) {
        return null;
    }
    return user;
}

async function findUserById(id, fields = []) {
    const user = await findUser({ id }, fields);
    return user;
}

async function findUserByEmail(email, fields = []) {
    const user = await findUser({ email }, fields);
    return user;
}

async function updateUser(id, newValues) {
    await User.update(newValues, { where: { id } });
}

module.exports = {
    findUserById, findUserByEmail, updateUser, insertUser, 
}