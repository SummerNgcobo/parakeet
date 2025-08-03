const bcrypt = require("bcrypt");
const User = require('../user.js');

const userModelHelper = {
    encryptPassword(password) {
        return bcrypt.hashSync(password, 10);
    },
    updatePassword(user) {
        const self = this;
        const currentPassword = user.dataValues.password;
        const oldPassword = user._previousDataValues.password;
        if (currentPassword != oldPassword) {
            user.password = self.encryptPassword(user.password);
            console.log("Updated user password!");
        }
    },
    async syncUserToCentral(sourceUser, sourceTable, role) {
        try {
            const existingUser = await User.findOne({
                where: {
                    sourceTable,
                    sourceUserId: sourceUser.id
                }
            });

            const userData = {
                firstName: sourceUser.firstName,
                lastName: sourceUser.lastName,
                email: sourceUser.email,
                password: sourceUser.password,
                role,
                profileCompleted: true,
                sourceTable,
                sourceUserId: sourceUser.id
            };

            if (existingUser) {
                await existingUser.update(userData);
            } else {
                await User.create(userData);
            }
        } catch (error) {
            console.error('Failed to sync user to central users table:', error);
        }
    }
};

module.exports = userModelHelper;