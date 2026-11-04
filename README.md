# Holiday Entitlement Calculator: UI Test Suite - Amruta Devi Yembuluru

Automated browser tests for the GOV.UK
[Calculate your holiday entitlement](https://www.gov.uk/calculate-your-holiday-entitlement)
calculator. The test cases come from a decision table and are written in plain
English (Gherkin), then run with Playwright and TypeScript through `playwright-bdd`.

## Status at a glance

| Area | State |
|---|---|
| Journeys | All 41 scenarios complete their journey on the live site
| Expected results | Calculated in code from the answers each scenario enters. No expected value is typed in. Every row has a rule. See "How expected results are worked out". |
| Verification | All 41 rows were checked against the live calculator |

## Setup and running

```bash
npm install
npx playwright install chromium
npm test                  # regenerate the feature file, compile the steps, run everything
npm run test:headed       # same, with the browser visible
npm run test:report       # open the HTML report from the last run
npm run bdd:gen           # regenerate the feature file only
npm run typecheck         # TypeScript check only
```

The tests run against the live GOV.UK site by default. To run against another
copy of the calculator, set `BASE_URL`:

```bash
BASE_URL=https://example.test npm test
```

To run one group of scenarios, pass its tag, for example
`npx playwright test --grep @shifts`.

Tags: `@irregular-hours`, `@no-irregular-hours`, `@accrual`, `@days-worked`,
`@hours-worked`, `@annualised-hours`, `@compressed-hours`, `@shifts`.

## How the project fits together

```
data/irregular-hours.csv          23 rows from the decision table (Yes branch)
data/no-irregular-hours.csv       18 rows from the earlier No-branch scenarios
        |
        v  scripts/generate-features.mjs   checks every row, groups rows by pattern
features/decision_table.feature   generated Gherkin, one Scenario Outline per pattern
        |
        v  bddgen                          matches each step to steps/calculator.steps.ts
.features-gen/                     generated Playwright tests (do not edit)
```

- **`data/`** holds the test cases. This is the only place to change a value.
- **`scripts/generate-features.mjs`** checks the data and writes the feature file.
  It stops with a list of errors if a row is inconsistent, for example a timeframe
  that needs a start date but has none.
- **`features/`** holds the generated feature file. Do not edit it by hand; it is
  overwritten on every run.
- **`steps/`** holds the step definitions, which carry out each plain-English step
  in the browser.
- **`src/pages/`, `src/components/`, `src/helpers/`, `src/constants/`** hold the
  page objects, form controls, helper functions and on-screen labels that the steps use.
  `src/helpers/entitlement.ts` holds the rules that work out each expected result.

**To change a test case, edit the CSV, then run `npm test`.**

## Alignment with the decision table

| Decision table | CSV rows | Scenario outline |
|---|---|---|
| Test01 to Test03 | Yes, accrual | Irregular hours - pay period accrual |
| Test04 to Test07 | Yes, days worked per week | Irregular hours - days worked per week |
| Test08 to Test11 | Yes, hours worked per week | Irregular hours - hours worked per week |
| Test12 to Test15 | Yes, annualised hours | Irregular hours - annualised hours |
| Test16 to Test19 | Yes, compressed hours | Irregular hours - compressed hours |
| Test20 to Test23 | Yes, shifts | Irregular hours - shifts |
| (not in table) | No, five patterns, 18 rows | No irregular hours - ... |

The `source` column in each CSV row records where the value came from:
`table` (taken from the decision table), `table; ... placeholder` (the table does
not give the value), `gov.uk guidance` (taken from the GOV.UK guidance page), or
`legacy` (carried over from the earlier No-branch scenarios).

## How expected results are worked out

No expected result is typed into the data. Each scenario records the numbers it
entered (days, hours, shifts, dates, pay period hours). `src/helpers/entitlement.ts`
works out the figure the calculator should show, and the step checks the page
against it.

**Basis.** The statutory entitlement is 5.6 weeks a year, capped at 28 days. The
irregular-hours rate is 12.07% of hours worked. The GOV.UK guidance gives the first
of these. The rate and the part-year and shift rules were worked out from the
calculator's own results, so they are a reconstruction, not an official
implementation.

**Rules.**

| Row type | Rule |
|---|---|
| Accrual (irregular hours, pay period) | Hours worked × 12.07%, rounded (0.5 and above rounds up) |
| Full year, days worked per week | Days × 5.6 weeks, capped at 28 days |
| Full year, hours worked per week | Weekly hours × 5.6 |
| Full year, compressed hours | Weekly hours × 5.6 (the same as hours worked per week) |
| Full year, annualised hours | 5.6 weeks |
| Full year, shifts | (Shifts in cycle ÷ days in cycle) × 7 × 5.6 |
| Leaving part way through (leave year start given) | Full-year figure × share of the leave year worked. Share = calendar days from the leave year start to the end date, end date included, ÷ days in the leave year |
| Starting and leaving (no leave year start, No branch) | Full-year figure × days from start to end date, inclusive, ÷ 365 |
| Starting part way through | One-twelfth of the full-year figure for each month worked, counting the start month in full (the leave year runs April to March). Days and shifts are then rounded up to the next half day or half shift. Hours are rounded up in half days of the working pattern. Weeks are not rounded. |

**Tolerance.** The calculator shows days and hours to one decimal place, and
compressed hours to the minute. Full-year results must match within 0.02. Part-year
days and hours must match within 0.1, and part-year weeks and shifts within 0.01.
The starting-part-way rule for shifts allows 0.1.

**Where the rules came from.** The 5.6 weeks, the 28-day cap and the monthly
pro-rata description come from the GOV.UK guidance and calculator pages. The 12.07%
rate, the day-count method for part-year and the half-day rounding were worked out
from captured calculator results.

**If a rule is missing.** If a row has no rule, the scenario reports
`expected-result-not-calculated` and checks only that a result page appears.
Captured page text can be saved with `CAPTURE_RESULTS=1`.

## Placeholder values

The decision table leaves these blank, so the data uses placeholder values. They
let the suite run, but a passing scenario that uses one shows only that the
journey completes with that value.

- Days per week for Test04 to Test11: `5`.
- Weekly hours for Test08 to Test11: `37.5`.
- Annual hours for Test12 to Test15: `1600`. These are not entered on the full-year path, because the calculator goes straight to the result.
- Compressed hours for Test16 to Test19: `37.5`. Days per week: `5`, which the calculator asks for on this path.
- Shift details for Test20 to Test23: duration `12`, shifts in cycle `4`, days in cycle `8`.
- Start date for "starting" rows: `01/06/2024`. End date for "leaving" rows: `28/02/2025`.
- Leave year start for the No-branch part-year rows that start or leave but not both (NoDays-04, NoHours-03, NoShifts-03, NoDays-05, NoHours-04, NoShifts-04): `30/03/2026`. The table gives no leave year for the No branch.


## Screen order

Confirmed from the live calculator:

- **Yes branch:** leave year start, then working pattern, then timeframe, then dates, then pattern details.
- **No branch:** working pattern, then timeframe, then dates, then leave year start (starting-only rows only), then pattern details.
- **Full-year annualised hours:** the result appears straight after the timeframe. There is no amount question.
- **Compressed hours:** asks the weekly hours question, then days worked per week.
- **Shifts:** hours in each shift, then shifts in the pattern, then days in the pattern.

## Labels

The question labels are kept in `src/constants/vocabulary.ts`. All of them have
been checked on the live calculator.

If a label changes, update it in `vocabulary.ts` only. To find a label, run the
suite and open the `error-context.md` file for the failing scenario, or use
`npx playwright codegen https://www.gov.uk/calculate-your-holiday-entitlement`.

## What the tests check

- **Journey.** Each step waits for its question before acting, so a missing or
  reordered question fails with the step name.
- **Answers shown.** After the working pattern and timeframe are entered, the page
  must show the chosen wording. This confirms the answer was recorded.
- **Result.** The figure on the result page must match the calculated expected
  result, within the tolerance above. A result page that never appears fails the scenario.

## Known limits

- **Mid-month start dates** have not been checked. All rows start on the 1st of a month.
- The suite depends on the live GOV.UK page. A change to the wording or order of
  questions will cause failures until the labels or steps are updated.


### Negative tests to add

- Empty submission on each screen, and the error message shown.
- End date before start date, and a start date after the leave year end.
- Days per week of 0, 8, a negative value, and text in a numeric field.
- Weekly hours of 0 or above 168.
- Shifts in cycle greater than days in cycle.
- A date that does not exist, such as 29/02/2025.
- Boundary tests: exactly 5 days (28 days), 5.5 days, and 7 days (capped at 28).
- Pay period hours at a rounding boundary, such as 4.14 hours (rounds down) and 4.15 hours (rounds up).
