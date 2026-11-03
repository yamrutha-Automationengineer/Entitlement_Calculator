#!/usr/bin/env node
/**
 * Generates features/decision_table.feature from the CSV data files.
 *
 * The CSV files are the single source of truth for scenario data. This script
 * validates every row, groups rows into one Scenario Outline per working
 * pattern, and writes the Gherkin. Run it with `npm run bdd:gen`.
 *
 * Do not edit the generated feature by hand: change the CSV and regenerate.
 */
import { mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..');
const OUTPUT = 'features/decision_table.feature';
const NA = 'N/A';
const DATE = /^\d{2}\/\d{2}\/\d{4}$/;

const HEADERS = [
  'testId', 'irregularHours', 'leaveYearStart', 'payPeriodHours', 'daysPerWeek',
  'pattern', 'timeframe', 'startDate', 'endDate', 'amount',
  'shiftDuration', 'shiftsInCycle', 'daysInCycle', 'source',
];

const SOURCES = [
  { file: 'data/irregular-hours.csv', branch: 'Yes' },
  { file: 'data/no-irregular-hours.csv', branch: 'No' },
];

const TIMEFRAMES = [
  'for a full leave year',
  'for someone starting part way through a leave year',
  'for someone leaving part way through a leave year',
  'for someone starting and leaving part way through a leave year',
];

/** Each pattern, its tag, and the detail columns it actually uses. */
const PATTERNS = {
  'days worked per week': { slug: 'days-worked', needs: ['daysPerWeek'] },
  'hours worked per week': { slug: 'hours-worked', needs: ['amount', 'daysPerWeek'] },
  'annualised hours': { slug: 'annualised-hours', needs: ['amount'] },
  'compressed hours': { slug: 'compressed-hours', needs: ['amount', 'daysPerWeek'] },
  shifts: { slug: 'shifts', needs: ['shiftDuration', 'shiftsInCycle', 'daysInCycle'] },
};

const DETAIL_COLUMNS = ['daysPerWeek', 'amount', 'shiftDuration', 'shiftsInCycle', 'daysInCycle'];

// The expected result is worked out from the answers the scenario entered (see
// src/helpers/entitlement.ts). No expected value is stored in the data.
const CALCULATED_STEP = 'And the expected result is calculated from the answers';

const errors = [];
const seenIds = new Set();

function readCsv(file) {
  const [headerLine, ...body] = readFileSync(join(ROOT, file), 'utf8')
    .split(/\r?\n/)
    .filter((line) => line.trim() !== '');

  if (headerLine.trim() !== HEADERS.join(',')) {
    errors.push(`${file}: header must be ${HEADERS.join(',')}`);
    return [];
  }

  return body
    .map((line, i) => {
      const cells = line.split(',').map((cell) => cell.trim());
      if (cells.length !== HEADERS.length) {
        errors.push(`${file} line ${i + 2}: expected ${HEADERS.length} columns, found ${cells.length}`);
        return null;
      }
      return { file, ...Object.fromEntries(HEADERS.map((h, j) => [h, cells[j]])) };
    })
    .filter(Boolean);
}

function validate(row, branch) {
  const fail = (message) => errors.push(`${row.file} ${row.testId}: ${message}`);

  if (!row.testId) return fail('testId is blank');
  if (seenIds.has(row.testId)) fail('duplicate testId');
  seenIds.add(row.testId);

  if (row.irregularHours !== branch) fail(`irregularHours must be ${branch}`);

  for (const column of ['leaveYearStart', 'startDate', 'endDate']) {
    if (row[column] !== NA && !DATE.test(row[column])) fail(`${column} must be dd/mm/yyyy or N/A`);
  }
  if (branch === 'Yes' && row.leaveYearStart === NA) fail('leaveYearStart is required on the Yes branch');

  // Accrual rows: irregular hours with pay period hours, no working pattern.
  if (row.pattern === NA) {
    if (branch !== 'Yes') return fail('accrual rows exist only on the Yes branch');
    if (row.payPeriodHours === NA) fail('accrual rows need payPeriodHours');
    if (row.timeframe !== NA) fail('accrual rows must have timeframe N/A');
    return;
  }

  const pattern = PATTERNS[row.pattern];
  if (!pattern) return fail(`unknown pattern "${row.pattern}"`);
  if (row.payPeriodHours !== NA) fail('payPeriodHours is only used by accrual rows');
  if (!TIMEFRAMES.includes(row.timeframe)) return fail(`unknown timeframe "${row.timeframe}"`);

  const needsStart = row.timeframe.includes('starting');
  const needsEnd = row.timeframe.includes('leaving');
  if ((row.startDate !== NA) !== needsStart) {
    fail(needsStart ? 'startDate is required for this timeframe' : 'startDate must be N/A for this timeframe');
  }
  if ((row.endDate !== NA) !== needsEnd) {
    fail(needsEnd ? 'endDate is required for this timeframe' : 'endDate must be N/A for this timeframe');
  }

  // On the No branch, the calculator asks for the leave year start date after the employment
  // dates when the employee starts or leaves part way. It does not ask when the employee both
  // starts and leaves in the same year, or when the calculation is for a full year.
  if (branch === 'No') {
    const startsAndLeaves = row.timeframe.includes('starting') && row.timeframe.includes('leaving');
    const partYear = row.timeframe !== 'for a full leave year';
    const askedForLeaveYear = partYear && !startsAndLeaves;
    if (askedForLeaveYear !== (row.leaveYearStart !== NA)) {
      fail(
        askedForLeaveYear
          ? 'leaveYearStart is required for this timeframe on the No branch'
          : 'leaveYearStart must be N/A for this timeframe on the No branch',
      );
    }
  }

  for (const column of DETAIL_COLUMNS) {
    const used = pattern.needs.includes(column);
    if (used && row[column] === NA) fail(`${column} is required for ${row.pattern}`);
    if (!used && row[column] !== NA) fail(`${column} is not used by ${row.pattern}; set it to N/A`);
  }
}

/** Gherkin text, columns and tags for one Scenario Outline. */
function describeOutline({ branch, pattern, isAccrual }) {
  if (isAccrual) {
    return {
      title: 'Irregular hours - pay period accrual',
      tags: ['@irregular-hours', '@accrual'],
      columns: ['testId', 'leaveYearStart', 'payPeriodHours'],
      steps: [
        'When I enter the leave year start date "<leaveYearStart>"',
        'And I enter the pay period hours "<payPeriodHours>"',
        'Then the answers entered should be shown',
        CALCULATED_STEP,
      ],
    };
  }

  const { slug } = PATTERNS[pattern];
  const detailStep =
    'And I enter working pattern details with days "<daysPerWeek>", amount "<amount>", ' +
    'shift duration "<shiftDuration>", shifts in cycle "<shiftsInCycle>", days in cycle "<daysInCycle>"';
  const datesStep = 'And I enter the start date "<startDate>" and the end date "<endDate>"';
  const timeframeStep = 'And I select leave timeframe "<timeframe>"';
  const patternStep = `And I select working pattern "${pattern}"`;
  const outcomeSteps = ['Then the answers entered should be shown', CALCULATED_STEP];

  const patternColumns = [
    'testId', 'timeframe', 'startDate', 'endDate',
    'daysPerWeek', 'amount', 'shiftDuration', 'shiftsInCycle', 'daysInCycle',
  ];

  if (branch === 'Yes') {
    return {
      title: `Irregular hours - ${pattern}`,
      tags: ['@irregular-hours', `@${slug}`],
      columns: ['testId', 'leaveYearStart', ...patternColumns.slice(1)],
      steps: [
        'When I enter the leave year start date "<leaveYearStart>"',
        patternStep,
        timeframeStep,
        datesStep,
        detailStep,
        ...outcomeSteps,
      ],
    };
  }

  // The calculator asks the No branch questions in this order: pattern, timeframe, dates,
  // leave year (part year only), then pattern details.
  const leaveYearStep = 'And I enter the leave year start date "<leaveYearStart>"';
  return {
    title: `No irregular hours - ${pattern}`,
    tags: ['@no-irregular-hours', `@${slug}`],
    columns: ['testId', 'timeframe', 'startDate', 'endDate', 'leaveYearStart', ...patternColumns.slice(4)],
    steps: [patternStep, timeframeStep, datesStep, leaveYearStep, detailStep, ...outcomeSteps],
  };
}

function renderTable(columns, rows) {
  const widths = columns.map((column, i) =>
    Math.max(column.length, ...rows.map((row) => row[column].length)),
  );
  const line = (cells) =>
    `      | ${cells.map((cell, i) => cell.padEnd(widths[i])).join(' | ')} |`;
  return [
    line(columns),
    ...rows.map((row) => line(columns.map((column) => row[column]))),
  ];
}

function renderOutline(outline, rows, branch) {
  const { title, tags, columns, steps } = describeOutline(outline);
  const lines = [
    `  ${tags.join(' ')}`,
    `  Scenario Outline: ${title}`,
    `    Given I am testing case "<testId>"`,
    `    And I answer the irregular hours question with "${branch}"`,
    ...steps.map((step) => `    ${step}`),
    '',
    '    Examples:',
    ...renderTable(columns, rows),
  ];
  return lines.join('\n');
}

// --- Main ----------------------------------------------------------------

const outlines = new Map();

for (const { file, branch } of SOURCES) {
  for (const row of readCsv(file)) {
    validate(row, branch);
    const key = `${branch}|${row.pattern}`;
    if (!outlines.has(key)) {
      outlines.set(key, { branch, pattern: row.pattern, isAccrual: row.pattern === NA, rows: [] });
    }
    outlines.get(key).rows.push(row);
  }
}

if (errors.length > 0) {
  console.error(`Data errors (${errors.length}):\n  ${errors.join('\n  ')}`);
  process.exit(1);
}

const header = `# GENERATED FILE. Do not edit by hand.
# Source: ${SOURCES.map((s) => s.file).join(', ')}
# Regenerate with: npm run bdd:gen

Feature: Holiday entitlement calculator - decision table
  Each row of the decision table is one scenario. The data lives in the CSV files,
  so a change is made once and regenerated rather than copied into the feature.

  Background:
    Given I am on the GOV.UK Holiday Entitlement Calculator start page
    When I click start now
`;

const body = [...outlines.values()]
  .map((outline) => renderOutline(outline, outline.rows, outline.branch))
  .join('\n\n');

mkdirSync(join(ROOT, 'features'), { recursive: true });
writeFileSync(join(ROOT, OUTPUT), `${header}\n${body}\n`);

const scenarios = [...outlines.values()].reduce((n, o) => n + o.rows.length, 0);
console.log(`Wrote ${OUTPUT}: ${scenarios} scenarios in ${outlines.size} outlines.`);
