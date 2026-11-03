/**
 * Copy and routes for the holiday entitlement calculator.
 *
 * Keeping user-facing text and paths in one place means that when GOV.UK
 * changes wording, only this file needs updating, not every step.
 */
export const CALCULATOR = {
  path: '/calculate-your-holiday-entitlement',
  startPath: '/calculate-your-holiday-entitlement/y',

  // Matches the question URL with or without a query string (GOV.UK adds ?next=1 after a failed submit).
  startPathPattern: /\/calculate-your-holiday-entitlement\/y(\?.*)?$/,

  startPage: {
    heading: 'Calculate holiday entitlement',
    startButtonText: 'Start now',
  },

  irregularHoursQuestion: {
    question: 'Does the employee work irregular hours or for part of the year?',
    yes: 'Yes',
    no: 'No',
    continueButton: 'Continue',
  },
} as const;
