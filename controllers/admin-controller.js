const { adminModel, tableTypes, tableColumns } = require("../models/admin-model.js");
const { mailer, mailerTypes } = require("../services/mailer/mailer.js");

const controller = {
    async onboard (req, res) {
        try {
            const userData = await _hubspotOperations.getUsers();

            if (userData) {
                console.log("Successfully retrieved data from hubspot");

                const successfullyImportedUsers = await adminModel.importUsers(userData.results);

                if (successfullyImportedUsers) {
                    console.log("Successfully imported users into database");
                    res.status(200).json({
                        message: "Successfully imported users"
                    });
                }
            }
        }
        catch (error) {
            res.status(400).json({
                error: {
                    message: error.message
                }
            });
        }
    },
    async sendUserInvites (req, res) {
        try {
            let mailDetails = {
                recipients: []
            };
            const databaseUserTables = tableTypes.user;
            const databaseUserValidationTokenTables = tableTypes.validationToken;
            const [
                adminUsers,
                traineeUsers,
                facilitatorUsers,
                careerCoachUsers,
                technicalMentorUsers
            ] = await Promise.all([
                await adminModel.getUsersByTokenAssociation(databaseUserTables.ADMIN, databaseUserValidationTokenTables.ADMIN),
                await adminModel.getUsersByTokenAssociation(databaseUserTables.TRAINEE, databaseUserValidationTokenTables.TRAINEE),
                await adminModel.getUsersByTokenAssociation(databaseUserTables.FACILITATOR, databaseUserValidationTokenTables.FACILITATOR),
                await adminModel.getUsersByTokenAssociation(databaseUserTables.CAREERCOACH, databaseUserValidationTokenTables.CAREERCOACH),
                await adminModel.getUsersByTokenAssociation(databaseUserTables.TECHNICALMENTOR, databaseUserValidationTokenTables.TECHNICALMENTOR)
            ]);

            const emailDatabaseColumn = tableColumns.email;
            _operations.createMailDetails(adminUsers, emailDatabaseColumn.admin, mailDetails);
            _operations.createMailDetails(traineeUsers, emailDatabaseColumn.trainee, mailDetails);
            _operations.createMailDetails(facilitatorUsers, emailDatabaseColumn.facilitator, mailDetails);
            _operations.createMailDetails(careerCoachUsers, emailDatabaseColumn.careerCoach, mailDetails);
            _operations.createMailDetails(technicalMentorUsers, emailDatabaseColumn.technicalMentor, mailDetails);

            await mailer.sendMail(mailDetails, mailerTypes.INVITE);

            res.status(200).json({
                message: "Successfully sent out email invites"
            });
        }
        catch (error) {
            res.status(500).json({
                error: {
                    message: "There was an issue while sending out email invites please try again"
                }
            });
        }
    }
};

const _operations = {
    createMailDetails (users, userEmailColumn, mailDetailsObject) {
        users.forEach((user) => {
            const userEmailAndToken = {
                email: user[userEmailColumn],
                validationToken: user.token
            };
            mailDetailsObject.recipients.push(userEmailAndToken);
        });
    }
};

const _hubspotOperations = {
    async getUsers () {
        try {
            const urlString = "https://api.hubapi.com/crm/v3/objects/contacts/?properties=firstname,lastname,email,jobtitle"
            const response = await fetch(urlString, {
                method: "GET",
                headers: {
                    Authorization: `Bearer ${ process.env.HUBSPOT_TOKEN }`
                }
            });

            if (!response.ok) {
                throw new Error(`Fetch error: ${response.status} ${response.statusText}`);
            }

            const data = await response.json();
            return data;
        } catch (error) {
            console.error("Error fetching contacts:", error.response?.data || error.message);
            throw new Error("Failed to fetch contacts");
        }
    }
}

module.exports = controller;