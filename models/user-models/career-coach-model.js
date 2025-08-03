const CareerCoach = require("../../services/database/postgres/models/career-coach-users.js");
const TalentUsers = require("../../services/database/postgres/models/talent-users.js");

const careerCoachModel = {
    async getUser (userEmail) {
        const user = await CareerCoach.findOne({
            raw: true,
            where: {
                email: userEmail
            }
        });

        return user;
    },

    async addCoachee (coacheeData) {
        const { firstName, lastName, coachId } = coacheeData;

        if (!firstName || !lastName) {
            throw new Error("Trainee firstName and lastName are required.");
        }
        if (!coachId) {
            throw new Error("Coach ID is required.");
        }

        const [coach, trainee] = await Promise.all([
            CareerCoach.findByPk(coachId),
            TalentUsers.findOne({
                where: {
                    firstName: firstName,
                    lastName: lastName
                }
            })
        ]);
        if (!coach) {
            throw new Error("Coach not found.");
        }
        if (!trainee) {
            throw new Error("Trainee not found.");
        }

        trainee.set({
            careerCoachId: coachId
        });
        await trainee.save();

        return {
            message: "Trainee added successfully.",
            trainee: trainee
        };
    }
};

module.exports = careerCoachModel;