const Facilitator = require("../../services/database/postgres/models/facilitator-users.js");
const TalentUsers = require("../../services/database/postgres/models/talent-users.js");

const FacilitatorModel = {
    async getUser (userEmail) {
        const user = await Facilitator.findOne({
            raw: true,
            where: {
                email: userEmail
            }
        });

        return user;
    },

    async addTrainee (traineeData) {
        const { firstName, lastName, facilitatorId } = traineeData;

        if (!firstName || !lastName) {
            throw new Error("Trainee firstName and lastName are required.");
        }
        if (!facilitatorId) {
            throw new Error("Facilitator ID is required.");
        }

        const [facilitator, trainee] = await Promise.all([
            Facilitator.findOne({
                where: {
                    id: facilitatorId
                }
            }),
            TalentUsers.findOne({
                where: {
                    firstName: firstName,
                    lastName: lastName
                }
            })
        ]);
        if (!facilitator) {
            throw new Error("Facilitator not found.");
        }
        if (!trainee) {
            throw new Error("Trainee not found.");
        }

        trainee.set({
            facilitatorId: facilitatorId
        });
        await trainee.save();

        return {
            message: "Trainee added successfully.",
            trainee: trainee
        };
    }
};

module.exports = FacilitatorModel;