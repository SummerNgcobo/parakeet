// assignmentController.js

const { sendMail } = require('./mailer'); 
const path = require("path");
const Assignment = require("../services/database/postgres/models/assignment.js");
const AssignmentUser = require("../services/database/postgres/models/assignmentUser.js");
const User = require("../services/database/postgres/models/user.js");

/**
 * Create a new assignment and link to users by email
 */

async function createAssignment(req, res) {
  try {
    const {
      title,
      description,
      specialization,
      dueDate,
      userEmails,
      creatorEmail,
    } = req.body;

    if (!title || !specialization || !dueDate || !creatorEmail) {
      return res.status(400).json({
        message:
          "Title, specialization, dueDate, and creatorEmail are required",
      });
    }

    const creator = await User.findOne({ where: { email: creatorEmail } });
    if (!creator) {
      return res
        .status(404)
        .json({ message: `Creator with email ${creatorEmail} not found` });
    }

    const assignment = await Assignment.create({
      title,
      description,
      specialization,
      dueDate,
      createdByEmail: creatorEmail,
    });

    let linkedUsers = [];

    if (Array.isArray(userEmails) && userEmails.length > 0) {
      const users = await User.findAll({ where: { email: userEmails } });
      const links = users.map((user) => ({
        userEmail: user.email,
        assignmentId: assignment.id,
      }));
      linkedUsers = await AssignmentUser.bulkCreate(links);

      // Send email notifications to each user
      for (const user of users) {
        const emailContent = `
          Hello ${user.firstName || ''} ${user.lastName || ''},

          You have been assigned a new task: "${title}"

          Description: ${description}
          Due Date: ${dueDate}
          Specializations: ${specialization}

          Please log in to the platform to view and submit your assignment.

          Regards,
          TMS Team
        `;

        await sendMail({
          to: user.email,
          subject: `New Assignment: ${title}`,
          text: emailContent,
          html: emailContent.replace(/\n/g, '<br/>')
        });
      }
    } else {
      console.warn("No userEmails received or not an array");
    }

    res.status(201).json({ message: "Assignment created", assignment });
  } catch (err) {
    console.error("Create assignment error:", err);
    res
      .status(500)
      .json({ message: "Failed to create assignment", error: err.message });
  }
}

/**
 * Get all assignments assigned to a specific user by email
 */
async function getMyAssignments(req, res) {
  try {
    const userEmail = req.query.email;

    if (!userEmail) {
      return res.status(400).json({ message: "User email is required" });
    }

    const assignments = await Assignment.findAll({
      include: [{
        model: User,
        where: { email: userEmail },
        through: { attributes: [] },
        required: true 
      }]
    });

    res.status(200).json(assignments);
  } catch (err) {
    console.error("Get assignments error:", err);
    res.status(500).json({ message: "Failed to fetch assignments", error: err.message });
  }
}

/**
 * Submit an assignment with a file and comment
 */
async function submitAssignment(req, res) {
  try {
    const { id } = req.params; 
    const { userEmail, submissionComment } = req.body;

    if (!userEmail) {
      return res.status(400).json({ message: "User email is required" });
    }

    const user = await User.findOne({ where: { email: userEmail } });
    if (!user) {
      return res.status(404).json({ message: `User with email ${userEmail} not found` });
    }

    const assignmentUser = await AssignmentUser.findOne({
      where: { assignmentId: id, userEmail },
    });

    if (!assignmentUser) {
      return res.status(404).json({ message: "Assignment not found for this user" });
    }

    if (!req.file) {
      return res.status(400).json({ message: "No file uploaded" });
    }

    assignmentUser.submitted = true;
    assignmentUser.submittedAt = new Date();
    assignmentUser.submissionLink = req.file.filename;
    assignmentUser.submissionComment = submissionComment || null;

    await assignmentUser.save();

    res.status(200).json({
      message: "Assignment submitted successfully",
      submission: assignmentUser,
    });
    
  } catch (err) {
    console.error("Submit assignment error:", err);
    res.status(500).json({ message: "Failed to submit assignment", error: err.message });
  }
}


 /* Grade a user's assignment submission
 */
async function gradeAssignment(req, res) {
  try {
    const { id } = req.params;
    const { userEmail, grade, comments } = req.body;

    if (!userEmail || grade === undefined) {
      return res.status(400).json({ message: "User email and grade are required" });
    }

    const assignmentUser = await AssignmentUser.findOne({
      where: { assignmentId: id, userEmail },
    });

    if (!assignmentUser) {
      return res.status(404).json({ message: "Assignment not found for this user" });
    }

    assignmentUser.grade = grade;
    assignmentUser.comments = comments;
    assignmentUser.gradedAt = new Date();
    await assignmentUser.save();

    res.status(200).json({ message: "Assignment graded successfully" });
  } catch (err) {
    console.error("Grade assignment error:", err);
    res.status(500).json({ message: "Failed to grade assignment", error: err.message });
  }
}

/**
 * Get all assignments
 */
async function getAllAssignments(req, res) {
  try {
    const assignments = await Assignment.findAll({
      include: [
        {
          model: User,
          through: { attributes: [] },
        },
      ],
    });
    res.status(200).json(assignments);
  } catch (err) {
    console.error("Get all assignments error:", err);
    res.status(500).json({ message: "Failed to fetch assignments", error: err.message });
  }
}

/**
 * Get a specific assignment by ID
 */
async function getAssignmentById(req, res) {
  try {
    const { id } = req.params;

    const assignment = await Assignment.findByPk(id, {
      include: [
        {
          model: User,
          through: { attributes: [] },
        },
      ],
    });

    if (!assignment) {
      return res.status(404).json({ message: "Assignment not found" });
    }

    res.status(200).json(assignment);
  } catch (err) {
    console.error("Get assignment error:", err);
    res.status(500).json({ message: "Failed to fetch assignment", error: err.message });
  }
}

/**
 * Delete an assignment by ID
 */
async function deleteAssignment(req, res) {
  try {
    const { id } = req.params;

    const assignment = await Assignment.findByPk(id);
    if (!assignment) {
      return res.status(404).json({ message: "Assignment not found" });
    }

    await assignment.destroy();
    res.status(200).json({ message: "Assignment deleted successfully" });
  } catch (err) {
    console.error("Delete assignment error:", err);
    res.status(500).json({ message: "Failed to delete assignment", error: err.message });
  }
}

/**
 * Get all submitted assignments
 */
async function getAllSubmissions(req, res) {
  try {
    const submissions = await AssignmentUser.findAll({
      where: { submitted: true },
      include: [
        { model: Assignment, attributes: ["id", "title"] },
        { model: User, attributes: ["id", "firstName", "lastName", "email"] },
      ],
    });

    res.status(200).json(submissions);
  } catch (err) {
    console.error("Get submissions error:", err);
    res.status(500).json({ message: "Failed to fetch submissions", error: err.message });
  }
}

/**
 * Download submitted assignment file
 */
function downloadFile(req, res) {
  const file = path.join(__dirname, "../../uploads", req.params.filename);
  res.download(file, (err) => {
    if (err) {
      console.error("Download error:", err);
      res.status(500).json({ message: "File download failed" });
    }
  });
  
}


/**
 * Update an existing assignment by ID
 */

async function updateAssignment(req, res) {
  try {
    const { id } = req.params;
    const {
      title,
      description,
      specialization,
      dueDate,
      userEmails, 
    } = req.body;

    const assignment = await Assignment.findByPk(id);
    if (!assignment) {
      return res.status(404).json({ message: "Assignment not found" });
    }

    // Update main assignment fields if provided
    if (title !== undefined) assignment.title = title;
    if (description !== undefined) assignment.description = description;
    if (specialization !== undefined) assignment.specialization = specialization;
    if (dueDate !== undefined) assignment.dueDate = dueDate;
    await assignment.save();

    // Handle linked users
    if (userEmails && Array.isArray(userEmails)) {
      // Fetch current linked users
      const currentLinks = await AssignmentUser.findAll({ where: { assignmentId: id } });
      const currentEmails = currentLinks.map(link => link.userEmail);

      // Determine emails to add and remove
      const emailsToAdd = userEmails.filter(email => !currentEmails.includes(email));
      const emailsToRemove = currentEmails.filter(email => !userEmails.includes(email));

      // Add new links
      for (const email of emailsToAdd) {
        const user = await User.findOne({ where: { email } });
        if (user) {
          await AssignmentUser.create({ userEmail: email, assignmentId: id });
          
          // Send notification email to newly added user
          const emailContent = `
            Hello ${user.firstName || ''} ${user.lastName || ''},

            You have been assigned a new task: "${assignment.title}"

            Description: ${assignment.description}
            Due Date: ${assignment.dueDate}
            Specializations: ${assignment.specialization}

            Please log in to the platform to view and submit your assignment.

            Regards,
            TMS Team
          `;

          await sendMail({
            to: email,
            subject: `New Assignment: ${assignment.title}`,
            text: emailContent,
            html: emailContent.replace(/\n/g, '<br/>')
          });
        }
      }

      // Remove old links
      if (emailsToRemove.length > 0) {
        await AssignmentUser.destroy({
          where: {
            assignmentId: id,
            userEmail: emailsToRemove
          }
        });
      }
    }

    res.status(200).json({ message: "Assignment updated successfully", assignment });
  } catch (err) {
    console.error("Update assignment error:", err);
    res.status(500).json({ message: "Failed to update assignment", error: err.message });
  }
}

module.exports = {
  createAssignment,
  getMyAssignments,
  submitAssignment,
  gradeAssignment,
  getAllAssignments,
  getAssignmentById,
  deleteAssignment,
  getAllSubmissions,
  downloadFile,
  updateAssignment, 

};
