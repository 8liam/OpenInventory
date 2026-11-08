import { PROBLEM_SEVERITY, SEVERITY_BY_PROBLEM } from "~/lib/organiser/organiser.config";
import { STORAGE_LIMITS } from "~/lib/storage/storage.config";
import { PLAN_PREVIEW } from "./plan-preview.config";
import type { PlanPreviewProps } from "./plan-preview.types";

const { classes } = PLAN_PREVIEW;

/** What a plan would do, without doing it. */
export function PlanPreview({ plan, rules }: PlanPreviewProps) {
  const ruleLabel = (id: string) => `Rule ${rules.findIndex((rule) => rule.id === id) + 1}`;
  const anyViaInventory = plan.steps.some((step) => step.viaInventory);
  const matchesNothing = plan.ruleReports.every((report) => report.matched === 0);

  return (
    <section className={classes.root} aria-label={PLAN_PREVIEW.heading}>
      <h2 className={classes.heading}>{PLAN_PREVIEW.heading}</h2>
      {rules.length === 0 ? (
        <p className={classes.muted}>{PLAN_PREVIEW.noRules}</p>
      ) : (
        <>
          {plan.problems.length > 0 && (
            <div className={classes.problems} role="alert">
              <h3 className={classes.subheading}>{PLAN_PREVIEW.problemsHeading}</h3>
              <ul className={classes.problemList}>
                {plan.problems.map((problem) => (
                  <li
                    key={JSON.stringify(problem)}
                    className={
                      SEVERITY_BY_PROBLEM[problem.kind] === PROBLEM_SEVERITY.error
                        ? PLAN_PREVIEW.errorClass
                        : PLAN_PREVIEW.warningClass
                    }
                  >
                    {PLAN_PREVIEW.problem(problem, ruleLabel)}
                  </li>
                ))}
              </ul>
            </div>
          )}
          {plan.itemsToMove === 0 ? (
            <p className={classes.muted}>
              {matchesNothing ? PLAN_PREVIEW.noMatches : PLAN_PREVIEW.nothingToMove}
            </p>
          ) : (
            <>
              <p className={classes.tabular}>
                {PLAN_PREVIEW.summary(plan.itemsToMove, plan.steps.length, plan.gcActions)}
              </p>
              {anyViaInventory && <p className={classes.note}>{PLAN_PREVIEW.inventoryNote}</p>}
              <div>
                <h3 className={classes.subheading}>{PLAN_PREVIEW.stepsHeading}</h3>
                <ol className={classes.stepList}>
                  {plan.steps.map((step, index) => (
                    <li key={`${index}:${step.from}:${step.to}`} className={classes.tabular}>
                      {PLAN_PREVIEW.step(step.itemIds.length, step.fromName, step.toName)}
                      {step.viaInventory && ` (${PLAN_PREVIEW.viaInventory})`}
                    </li>
                  ))}
                </ol>
              </div>
              <div>
                <h3 className={classes.subheading}>{PLAN_PREVIEW.unitsHeading}</h3>
                <ul className={classes.lineList}>
                  {plan.unitChanges.map((change) => (
                    <li key={change.unitId} className={classes.tabular}>
                      {PLAN_PREVIEW.unitLine(
                        change.name,
                        change.before,
                        change.after,
                        STORAGE_LIMITS.unitCapacity,
                      )}
                    </li>
                  ))}
                </ul>
              </div>
            </>
          )}
          <div>
            <h3 className={classes.subheading}>{PLAN_PREVIEW.rulesHeading}</h3>
            <ul className={classes.lineList}>
              {plan.ruleReports.map((report, index) => (
                <li key={report.ruleId} className={classes.tabular}>
                  {report.matched === 0
                    ? PLAN_PREVIEW.ruleNoMatch(index + 1)
                    : PLAN_PREVIEW.ruleLine(
                        index + 1,
                        report.moving,
                        report.alreadyInPlace,
                        report.unplaced,
                      )}
                </li>
              ))}
            </ul>
          </div>
          <p className={classes.note}>{PLAN_PREVIEW.noChanges}</p>
        </>
      )}
    </section>
  );
}
