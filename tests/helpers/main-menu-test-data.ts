import type { MainMenuItem } from '../../src/pages/main-menu-page';

type NavigationCase = {
  name: Exclude<MainMenuItem, 'Maintenance'>;
  url: RegExp;
  heading: string;
};

export const navigationCases: NavigationCase[] = [
  { name: 'Admin', url: /admin\/viewSystemUsers/, heading: 'System Users' },
  { name: 'PIM', url: /pim\/viewEmployeeList/, heading: 'PIM' },
  { name: 'Leave', url: /leave\/viewLeaveList/, heading: 'Leave List' },
  { name: 'Time', url: /time\/viewEmployeeTimesheet/, heading: 'Select Employee' },
  { name: 'Recruitment', url: /recruitment\/viewCandidates/, heading: 'Candidates' },
  { name: 'My Info', url: /pim\/viewPersonalDetails/, heading: 'Personal Details' },
  { name: 'Performance', url: /performance\/searchEvaluatePerformanceReview/, heading: 'Employee Reviews' },
  { name: 'Dashboard', url: /dashboard\/index/, heading: 'Dashboard' },
  { name: 'Directory', url: /directory\/viewDirectory/, heading: 'Directory' },
  { name: 'Claim', url: /claim\/viewAssignClaim/, heading: 'Employee Claims' },
  { name: 'Buzz', url: /buzz\/viewBuzz/, heading: 'Buzz' },
];

export const apiCases = [
  { name: 'Dashboard', apiPath: '/api/v2/dashboard/' },
  { name: 'PIM', apiPath: '/api/v2/pim/employees' },
  { name: 'Directory', apiPath: '/api/v2/directory/employees' },
  { name: 'Claim', apiPath: '/api/v2/claim/' },
] as const;
