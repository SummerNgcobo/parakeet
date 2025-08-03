import React, { useState } from 'react';
import { useNavigate  } from 'react-router'
import './ResetPassword.css';


/**
 * Reset Password Component
 * 
 * Provides a form for users to reset their password with validation and submission to the backend API.
 * Features password strength validation and confirmation matching.
 * 
 * @component
 * @example
 * // Typical usage in routing
 * <Route path="/reset-password" component={ResetPassword} />
 */

function ResetPassword() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  /**
   * Validates password against complexity requirements
   * @function
   * @param {string} pwd - Password to validate
   * @returns {Array} List of validation issues (empty if valid)
   */
  const validatePassword = (pwd) => {
    const issues = [];
    if (pwd.length < 8) issues.push('at least 8 characters');
    if (!/[A-Z]/.test(pwd)) issues.push('a capital letter');
    if (!/[a-z]/.test(pwd)) issues.push('a lowercase letter');
    if (!/[0-9]/.test(pwd)) issues.push('a number');
    if (!/[^A-Za-z0-9]/.test(pwd)) issues.push('a special character');
    return issues;
  };

  /**
   * Handles form submission
   * @async
   * @function
   * @param {Object} e - React form event
   */
  const handleSubmit = async (e) => {
    e.preventDefault();
    const passwordIssues = validatePassword(password);
    if (passwordIssues.length > 0) {
      setError(`Password must contain: ${passwordIssues.join(', ')}`);
      return;
    }
    if (password !== confirmPassword) {
      setError("Passwords don't match");
      return;
    }
    setError('');
    // Submit password reset request
    console.log('Password reset successful!');

    setLoading(true);

    try {
      const response = await fetch(`http://localhost:5000/authenticator/reset-password`, {
        credentials: "include",
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ password: password })
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.message || 'Failed to reset password');
      }

      setSuccess('Password updated successfully!');
      alert("Password Reset Successfully");
      navigate('/');
    } catch (err) {
      setError(err.message);
    }finally{
      setLoading(false);
    }

  };

  

  return (
    <>
      <form className='resetPwdForm' onSubmit={handleSubmit}>
        <h1>Reset Password</h1>

        {/* Insert user email input */}

        <input
          className='form-control'
          type="password"
          placeholder="New password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />

        <input
          className='form-control'
          type="password"
          placeholder="Confirm new password"
          value={confirmPassword}
          onChange={(e) => setConfirmPassword(e.target.value)}
        />

        {error && <p className="error">{error}</p>}

        {/* The submit button must send data to the api */}
        <button className='btn btn-primary resetPwdBtn' disabled={loading} type="submit">{loading ? 'Processing...' : 'Submit'}</button>
        {loading && <div className="resetSpinner"></div>}
      </form>
    </>
  );
}

export default ResetPassword;
