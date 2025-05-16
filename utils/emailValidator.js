/**
 * Validates if an email belongs to the college domain
 * 
 * @param {string} email - The email to validate
 * @returns {boolean} True if the email is from the college domain
 */
const isCollegeEmail = (email) => {
  if (!email) return false;
  return email.endsWith('@pccegoa.edu.in');
};

/**
 * Extract user information from college email
 * Email format: studentid@pccegoa.edu.in
 * 
 * @param {string} email - The college email address
 * @returns {object|null} Extracted information or null if invalid
 */
const extractInfoFromEmail = (email) => {
  if (!isCollegeEmail(email)) return null;
  
  const studentId = email.split('@')[0];
  // Add logic to extract department, year, etc. from student ID if needed
  
  return {
    studentId
  };
};

module.exports = {
  isCollegeEmail,
  extractInfoFromEmail
};