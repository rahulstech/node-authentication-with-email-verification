const { DataTypes, Model } = require('sequelize')

class User extends Model {

    toJSON() {
        return {
            ...this.dataValues,
            verified: this.verified === 1, 
        }
    }
}

module.exports = ( sequelize ) => {

    User.init({
        email: {
            type: DataTypes.STRING(320),
            allowNull: false,
            unique: true,
        }, 

        password: {
            type: DataTypes.STRING(64),
        },

        displayName: {
            type: DataTypes.STRING(30),
            allowNull: false,
        },

        refreshToken: {
            type: DataTypes.TEXT,
        }, 

        verified: {
            type: DataTypes.BOOLEAN,
            allowNull: false,
            defaultValue: false,
        }
        
    }, {
        sequelize,
        timestamps: false
    })

    return User
}