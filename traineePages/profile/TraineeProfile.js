import React, { useState, useRef, useEffect } from "react";
import "./TraineeProfile.css";
import { useUser } from "../../../contexts/UserContext";

const TraineeProfile = () => {
  const { user } = useUser();
  const traineeName = user?.firstName || "Facilitator";
  const traineeSurname = user?.lastName || "Surname";
  const traineeEmail = user?.email || "";
  const fileInputRef = useRef(null);
  const [phoneError, setPhoneError] = useState("");
  const [formValid, setFormValid] = useState(true);

  const defaultProfile = {
    name: traineeName + " " + traineeSurname,
    email: traineeEmail,
    phone: "+27 83 257 8730",
    education: "Certificate in Software Engineering",
    skills: "React, Node.js, JavaScript",
    avatar: "https://randomuser.me/api/portraits/women/44.jpg",
    bio: "Passionate developer creating pixel-perfect experiences ✨",
    funFact: "I can solve a Rubik's cube in under 2 minutes!",
    superpower: "Debugging complex issues with coffee ☕"
  };

  const [profile, setProfile] = useState(defaultProfile);
  const [isEditing, setIsEditing] = useState(false);
  const [successMessage, setSuccessMessage] = useState("");

  // Load profile from localStorage if available
  useEffect(() => {
    const storedProfile = localStorage.getItem("traineeProfile");
    if (storedProfile) {
      setProfile(JSON.parse(storedProfile));
    }
  }, []);

  const validatePhoneNumber = (phone) => {
    // First check for any non-digit characters (except + at start and spaces)
    if (/[^0-9+\s]/.test(phone)) {
      return "Only numbers, + prefix and spaces allowed";
    }
    
    // Remove all non-digit characters
    const digitsOnly = phone.replace(/\D/g, '');
    
    if (!digitsOnly) return "Phone number is required";
    
    // Check length (must be exactly 11 digits including 27 country code)
    if (digitsOnly.length < 11) return "Too short - must be 11 digits (including 27)";
    if (digitsOnly.length > 11) return "Too long - must be 11 digits (including 27)";
    
    // Must start with 27 (South Africa country code)
    if (!digitsOnly.startsWith('27')) return "Must start with 27 (South Africa)";
    
    // Check remaining digits are valid
    const remainingDigits = digitsOnly.substring(2);
    if (!/^[0-9]{9}$/.test(remainingDigits)) {
      return "Invalid phone number format";
    }
    
    return ""; // No error
  };

  const formatPhoneNumber = (value) => {
    const digits = value.replace(/\D/g, '');
    let formattedValue = value;
    
    if (digits.length <= 2) {
      formattedValue = digits;
    } else if (digits.length <= 5) {
      formattedValue = `${digits.slice(0, 2)} ${digits.slice(2)}`;
    } else if (digits.length <= 8) {
      formattedValue = `${digits.slice(0, 2)} ${digits.slice(2, 5)} ${digits.slice(5)}`;
    } else {
      formattedValue = `${digits.slice(0, 2)} ${digits.slice(2, 5)} ${digits.slice(5, 8)} ${digits.slice(8, 11)}`;
    }
    
    return formattedValue;
  };

  const handleProfileChange = (e) => {
    const { name, value } = e.target;
    
    if (name === "phone") {
      // Real-time validation as user types
      const error = validatePhoneNumber(value);
      setPhoneError(error);
      
      // Auto-format the phone number
      const formattedValue = formatPhoneNumber(value);
      
      setProfile({
        ...profile,
        [name]: formattedValue
      });
    } else {
      setProfile({
        ...profile,
        [name]: value
      });
    }
  };

  const handleAvatarChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        const updatedProfile = {
          ...profile,
          avatar: reader.result
        };
        setProfile(updatedProfile);
        localStorage.setItem("traineeProfile", JSON.stringify(updatedProfile));
      };
      reader.readAsDataURL(file);
    }
  };

  const triggerFileInput = () => {
    fileInputRef.current.click();
  };

  const handleProfileSubmit = (e) => {
    e.preventDefault();
    const phoneValidationError = validatePhoneNumber(profile.phone);
    if (phoneValidationError) {
      setPhoneError(phoneValidationError);
      setFormValid(false);
      return;
    }
    setFormValid(true);
    setIsEditing(false);
    setSuccessMessage("✨ Profile updated successfully!");

    // Save to localStorage
    localStorage.setItem("traineeProfile", JSON.stringify(profile));

    // Show success confetti and message
    setTimeout(() => setSuccessMessage(""), 3000);
    if (typeof window !== "undefined" && typeof window.confetti === "function") {
      window.confetti({
        particleCount: 100,
        spread: 70,
        origin: { y: 0.6 }
      });
    }
  };

  const ProfileField = ({ label, name, value, onChange, editing, icon, type = "text", textarea = false, error, maxLength }) => (
    <div className="profile-field">
      <label>
        <span className="field-icon">{icon}</span> {label}
      </label>
      {textarea ? (
        <textarea
          name={name}
          value={value}
          onChange={onChange}
          disabled={!editing}
          rows="3"
        />
      ) : (
        <>
          <input
            type={type}
            name={name}
            value={value}
            onChange={onChange}
            disabled={!editing}
            className={error ? "error-input" : ""}
            maxLength={maxLength}
          />
          {error && <div className="error-message">{error}</div>}
        </>
      )}
    </div>
  );

  return (
    <div className="profile-container">
      <div className="profile-card">
        <div className="profile-header">
<div className="avatar-wrapper">
  <div className="avatar-ring">
    <div className="avatar avatar-initial">
      {(traineeName || "?").charAt(0).toUpperCase()}
    </div>
  </div>
  
    {/* {isEditing && (
      <>
        <button 
          type="button" 
          className="avatar-edit-btn"
          onClick={triggerFileInput}
        >
          <span role="img" aria-label="edit">🎨</span>
        </button>
        <input
          type="file"
          ref={fileInputRef}
          onChange={handleAvatarChange}
          accept="image/*"
          style={{ display: 'none' }}
        />
      </>
    )} */}
  </div>
  
          
          <h1 className="profile-title">
            {isEditing ? "Edit Your Awesome Profile" : "Hey there, " + traineeName}
            <span role="img" aria-label="sparkles">✨</span>
          </h1>
          
          {/* <button 
            className={`mode-toggle ${isEditing ? 'editing' : ''}`}
            onClick={() => setIsEditing(!isEditing)}
          >
            {isEditing ? '👀 Preview' : '✏️ Edit Mode'}
          </button> */}
        </div>

        {successMessage && (
          <div className="success-message">
            <div className="party-popper">🎉</div>
            {successMessage}
          </div>
        )}

        <form onSubmit={handleProfileSubmit}>
          <div className="profile-grid">
            <div className="profile-section personal-info">
              <h2 className="section-title">
                <span role="img" aria-label="star">🌟</span> Personal Info
              </h2>
              
              <ProfileField 
                label="Full Name" 
                name="name" 
                value={profile.name} 
                onChange={handleProfileChange} 
                editing={isEditing} 
                icon="👤"
              />
              
              <ProfileField 
                label="Email" 
                name="email" 
                value={profile.email} 
                onChange={handleProfileChange} 
                editing={isEditing} 
                icon="📧"
                type="email"
              />
              
              <ProfileField 
                label="Phone (e.g. 27 83 123 4567)" 
                name="phone"
                value={profile.phone} 
                onChange={handleProfileChange} 
                editing={isEditing} 
                icon="📱"
                error={phoneError}
                maxLength={14} // Allows for formatting: 27 83 123 4567
              />
            </div>

            <div className="profile-section professional-info">
              <h2 className="section-title">
                <span role="img" aria-label="briefcase">💼</span> Professional
              </h2>
              
              <ProfileField 
                label="Education" 
                name="education" 
                value={profile.education} 
                onChange={handleProfileChange} 
                editing={isEditing} 
                icon="🎓"
              />
              
              <ProfileField 
                label="Skills" 
                name="skills" 
                value={profile.skills} 
                onChange={handleProfileChange} 
                editing={isEditing} 
                icon="🛠️"
              />
            </div>

            <div className="profile-section fun-info">
              <h2 className="section-title">
                <span role="img" aria-label="sparkles">🎨</span> Fun Stuff
              </h2>
              
              <ProfileField 
                label="Bio" 
                name="bio" 
                value={profile.bio} 
                onChange={handleProfileChange} 
                editing={isEditing} 
                icon="✏️"
                textarea
              />
              
              <ProfileField 
                label="Fun Fact" 
                name="funFact" 
                value={profile.funFact} 
                onChange={handleProfileChange} 
                editing={isEditing} 
                icon="🤹"
              />
              
              <ProfileField 
                label="Superpower" 
                name="superpower" 
                value={profile.superpower} 
                onChange={handleProfileChange} 
                editing={isEditing} 
                icon="💕"
              />
            </div>
          </div>

          {isEditing && (
            <div className="form-actions">
              <button type="submit" className="save-btn">
                Save Changes <span>🚀</span>
              </button>
              <button 
                type="button" 
                className="cancel-btn"
                onClick={() => setIsEditing(false)}
              >
                Cancel <span>😅</span>
              </button>
            </div>
          )}
        </form>
      </div>
    </div>
  );
};

export default TraineeProfile;