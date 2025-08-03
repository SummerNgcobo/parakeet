const TalentUsers = require("../models/talent-users.js");
const TalentUsersValidationTokens = require("../models/talent-users-validation-tokens.js");
const FacilitatorUsers = require("../models/facilitator-users.js");
const FacilitatorUsersValidationTokens = require("../models/facilitator-user-validation-tokens.js");
const CareerCoachUsers = require("../models/career-coach-users.js");
const CareerCoachUserValidationTokens = require("../models/career-coach-user-validation-tokens.js");
const TechnicalMentorUsers = require("../models/technical-mentor-users.js");
const TechnicalMentorUserValidationTokens = require("../models/technical-mentor-user-validation-tokens.js");
const AdminUsers = require("../models/admin-users.js");
const AdminUserValidationTokens = require("../models/admin-user-validation-tokens.js");
const PasswordResetTokens = require("../models/password-reset-tokens.js");
const User = require("../models/user.js");
const Attendance = require("../models/attendance.js");
const LeaveRequest = require("../models/leaveRequest.js");
const Assignment = require("../models/assignment.js");
const AssignmentUser = require("../models/assignmentUser.js");
const Event = require("../models/event.js");
const EventAttendance = require("../models/eventAttendance.js");

const { sequelize } = require("../postgres-database.js");

(async () => {
    try {
        // Database Tables creations
        await sequelize.sync({ alter: true });
        console.log("Successfully migrated tables");
    } catch (error) {
        throw new Error(error);
    }
})();