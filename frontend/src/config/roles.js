// // src/config/roles.js
// // Must exactly match the user_rank values in your DB
// export const SUPERVISOR_ROLES = [
//     'FTO',  // Field Training Officer
//     'XO',   // Executive Officer
//     'CS',   // Company Supervisor
//     'BS',   // Battalion Supervisor
//     'LT',    // Lieutenant
//   ];
  
// export const EVENT_CREATOR_ROLES = [
//     'CS',  // Company Supervisor
//     'BS',  // Battalion Supervisor
//     'LT',   // Lieutenant
//   ];

// // src/config/roles.js
// // Who can view the “Overview” panel:
// export const SUPERVISOR_ROLES = ['FTO','XO','CS','BS','LT'];

// // Who can create & manage Special Events:
// export const EVENT_CREATOR_ROLES = ['CS','BS','LT'];

// // Who can access the Admin User-CRUD page:
// export const ADMIN_USER_ROLES = ['BS','LT'];

// // — CSO leave & mandate roles —
// // Who can request CSO leave:
// export const CSO_LEAVE_REQUESTER_ROLES = ['CDT','CSO','FTO','XO','CS','BS'];
// // Who can approve CSO leave:
// export const CSO_LEAVE_APPROVER_ROLES = ['CS','BS','LT'];
// // Who can mandate CSOs onto open shifts:
// export const CSO_MANDATE_ROLES = ['CS','BS','LT'];

// // — Security division —
// export const SECURITY_DIVISION = 'security';
// // Who can request security leave:
// export const SECURITY_OFFICER_ROLES = ['SO','SLT'];
// // Who can approve security leave:
// export const SECURITY_LEAVE_APPROVER_ROLES = ['LT'];


// src/config/roles.js
export const SUPERVISOR_ROLES = ['FTO','XO','CS','BS','LT'];
export const EVENT_CREATOR_ROLES = ['CS','BS','LT'];
export const ADMIN_USER_ROLES = ['BS','LT'];
export const ANNOUNCEMENT_CREATOR_ROLES = ['DR','LT','BS','CS','XO','FTO'];

export const CSO_LEAVE_REQUESTER_ROLES = ['CDT','CSO','FTO','XO','CS','BS'];
export const CSO_LEAVE_APPROVER_ROLES  = ['CS','BS','LT'];
export const CSO_MANDATE_ROLES         = ['CS','BS','LT'];

export const SECURITY_DIVISION = 'security';
export const SECURITY_OFFICER_ROLES = ['SO','SLT'];
export const SECURITY_LEAVE_APPROVER_ROLES = ['LT'];
