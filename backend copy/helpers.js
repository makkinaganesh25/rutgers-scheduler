// Helper function to split and format officer names if they come as a single string
function formatOfficerNames(officers) {
    return officers.split(',').map(name => name.trim());  // Split by commas and trim whitespace
  }
  
  module.exports = { formatOfficerNames };
  