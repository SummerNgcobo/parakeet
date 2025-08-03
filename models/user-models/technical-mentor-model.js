const TechnicalMentor = require("../../services/database/postgres/models/technical-mentor-users.js");
const TalentUsers = require("../../services/database/postgres/models/talent-users.js");

const TechnicalMentorModel = {
    async getUser (userEmail) {
        const user = await TechnicalMentor.findOne({
            raw: true,
            where: {
                email: userEmail
            }
        });

        return user;
    },

    async addMentee (menteeData) {
        const { firstName, lastName, mentorId } = menteeData;

        if (!firstName || !lastName) {
            throw new Error("Trainee firstName and lastName are required.");
        }
        if (!mentorId) {
            throw new Error("Mentor ID is required.");
        }

        const [mentor, trainee] = await Promise.all([
            TechnicalMentor.findByPk(mentorId),
            TalentUsers.findOne({
                where: {
                    firstName: firstName,
                    lastName: lastName
                }
            })
        ]);
        if (!mentor) {
            throw new Error("Mentor not found.");
        }
        if (!trainee) {
            throw new Error("Trainee not found.");
        }

        trainee.set({
            technicalMentorId: mentorId
        });
        await trainee.save();

        return {
            message: "Trainee added successfully.",
            trainee: trainee
        };
    }
};

module.exports = TechnicalMentorModel;
