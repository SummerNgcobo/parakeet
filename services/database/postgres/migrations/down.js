const TalentUsers = require("../models/talent-users.js");
const TalentUsersValidationTokens = require("../models/talent-users-validation-tokens.js");
const FacilitatorUsers = require("../models/facilitator-users.js");
const FacilitatorUsersValidationTokens = require("../models/facilitator-user-validation-tokens.js");
const CareerCoachUsers = require("../models/career-coach-users.js");
const CareerCoachUserValidationTokens = require("../models/career-coach-user-validation-tokens.js");
const TechnicalMentorUserValidationTokens = require("../models/technical-mentor-user-validation-tokens.js")
const TechnicalMentorUsers = require("../models/technical-mentor-users.js");
const AdminUsers = require("../models/admin-users.js");
const AdminUserValidationTokens = require("../models/admin-user-validation-tokens.js");
const PasswordResetTokens = require("../models/password-reset-tokens.js");
const Messages = require("../models/messages.js");
const User = require("../models/user.js");
const Attendance = require("../models/attendance.js");
const LeaveRequest = require("../models/leaveRequest.js");
const event = require("../models/event.js");
const EventAttendance = require("../models/eventAttendance.js");

(async () => {
    try {
        await Promise.all([
            TalentUsers,
            TalentUsersValidationTokens,
            FacilitatorUsers,
            FacilitatorUsersValidationTokens,
            CareerCoachUsers,
            CareerCoachUserValidationTokens,
            TechnicalMentorUsers,
            TechnicalMentorUserValidationTokens,
            AdminUsers,
            AdminUserValidationTokens,
            PasswordResetTokens,
            Messages,
            Attendance,
            LeaveRequest,
            User,
            Event,
            EventAttendance
        ].map(async (model) => {
            return await model.drop({ force: true });
        }));
        console.log("Successfully deleted tables");
    } catch (error) {
        throw new Error(error);
    }
})();