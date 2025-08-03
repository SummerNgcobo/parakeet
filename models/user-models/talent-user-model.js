const TalentUsers = require("../../services/database/postgres/models/talent-users.js");
const CareerCoachUsers = require("../../services/database/postgres/models/career-coach-users.js");
const FacilitatorUsers = require("../../services/database/postgres/models/facilitator-users.js");
const TechnicalMentorUsers = require("../../services/database/postgres/models/technical-mentor-users.js");

const TalentUserModel = {
    async getUser (userEmail) {
        const user = await TalentUsers.findOne({
            raw: true,
            where: {
                email: userEmail
            },
            attributes: { exclude: ["createdAt", "updatedAt", "deletedAt"] },
            include: [
                {
                    model: CareerCoachUsers,
                    attributes: {
                        exclude: ["password", "createdAt", "updatedAt", "deletedAt"]
                    }
                },
                {
                    model: FacilitatorUsers,
                    attributes: {
                        exclude: ["password", "createdAt", "updatedAt", "deletedAt"]
                    }
                },
                {
                    model: TechnicalMentorUsers,
                    attributes: {
                        exclude: ["password", "createdAt", "updatedAt", "deletedAt"]
                    }
                }
            ]
        });

        return user;
    }
};

module.exports = TalentUserModel;