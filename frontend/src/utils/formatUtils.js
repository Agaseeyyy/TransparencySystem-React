/**
 * Format a number as currency
 * @param {number} amount - The amount to format
 * @returns {string} Formatted currency string
 */
export const formatCurrency = (amount) => {
  if (amount === null || amount === undefined) return 'N/A';
  
  return new Intl.NumberFormat('en-PH', {
    style: 'currency',
    currency: 'PHP',
    minimumFractionDigits: 2
  }).format(amount);
};

/**
 * Format a date string to a human readable format
 * @param {string} dateString - ISO date string
 * @returns {string} Formatted date string
 */
export const formatDate = (dateString) => {
  if (!dateString) return 'N/A';
  
  const date = new Date(dateString);
  if (isNaN(date.getTime())) return 'Invalid Date';
  
  return new Intl.DateTimeFormat('en-PH', {
    year: 'numeric',
    month: 'short',
    day: 'numeric'
  }).format(date);
};

/**
 * Format a datetime string to a human readable format with time
 * @param {string} dateTimeString - ISO datetime string
 * @returns {string} Formatted datetime string
 */
export const formatDateTime = (dateTimeString) => {
  if (!dateTimeString) return 'N/A';
  
  const date = new Date(dateTimeString);
  if (isNaN(date.getTime())) return 'Invalid Date';
  
  return new Intl.DateTimeFormat('en-PH', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  }).format(date);
};