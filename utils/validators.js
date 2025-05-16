/**
 * Validate Metamask ID format (15 digits)
 * 
 * @param {string} metamaskId - The metamask ID to validate
 * @returns {boolean} True if valid
 */
const isValidMetamaskId = (metamaskId) => {
  if (!metamaskId) return false;
  return /^[0-9]{15}$/.test(metamaskId);
};

/**
 * Validate price format
 * 
 * @param {number} price - The price to validate
 * @returns {boolean} True if valid
 */
const isValidPrice = (price) => {
  return typeof price === 'number' && price >= 0;
};

/**
 * Validate product category
 * 
 * @param {string} category - The category to validate
 * @returns {boolean} True if valid
 */
const isValidCategory = (category) => {
  const validCategories = [
    'Stationary', 
    'Books', 
    'Electronics', 
    'Project Materials', 
    'Others'
  ];
  return validCategories.includes(category);
};

/**
 * Validate product condition
 * 
 * @param {string} condition - The condition to validate
 * @returns {boolean} True if valid
 */
const isValidCondition = (condition) => {
  const validConditions = [
    'New', 
    'Like New',
    'Slightly Used',
    'Used',
    'Heavily Used'
  ];
  return validConditions.includes(condition);
};

module.exports = {
  isValidMetamaskId,
  isValidPrice,
  isValidCategory,
  isValidCondition
};