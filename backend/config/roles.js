// backend/config/roles.js

// who can view announcements (everyone authenticated)
const SUPERVISOR_ROLES = ['FTO','XO','CS','BS','LT'];

// who can create/edit/delete announcements
const ANNOUNCEMENT_CREATOR_ROLES = ['DR','LT','BS','CS','XO','FTO'];

module.exports = {
  SUPERVISOR_ROLES,
  ANNOUNCEMENT_CREATOR_ROLES,
};
