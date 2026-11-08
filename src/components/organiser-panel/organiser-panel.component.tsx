import { ArrowDown, ArrowUp, Trash2 } from "lucide-react";
import { useId, useMemo, useRef, useState } from "react";
import { Button } from "~/components/button/button.component";
import { DangerDialog } from "~/components/danger-dialog/danger-dialog.component";
import { OrganiserRuleForm } from "~/components/organiser-rule-form/organiser-rule-form.component";
import { PlanPreview } from "~/components/plan-preview/plan-preview.component";
import { CONDITION_KIND } from "~/lib/organiser/organiser.config";
import { computePlan } from "~/lib/organiser/organiser.plan";
import { useOrganiserRules } from "~/lib/organiser/organiser.store";
import type { MovePlan, OrganiserRule } from "~/lib/organiser/organiser.types";
import { postJson } from "~/lib/storage/storage.client";
import { restoreLostFocus } from "~/utils/restore-focus";
import { STORAGE_API } from "~/lib/storage/storage.config";
import { ORGANISER_PANEL } from "./organiser-panel.config";
import type { OrganiserPanelProps } from "./organiser-panel.types";

const { classes } = ORGANISER_PANEL;

function uniqueSorted(values: Iterable<string | null>): readonly string[] {
  return [...new Set([...values].filter((v): v is string => v !== null && v !== ""))].sort();
}

export function OrganiserPanel({
  items,
  units,
  itemsReady,
  accountId,
  accountName,
  busy,
}: OrganiserPanelProps) {
  const unitIds = useMemo(() => new Set(units.map((unit) => unit.id)), [units]);
  const { rules, addRule, removeRule, moveRule } = useOrganiserRules(accountId, unitIds);
  // The plan frozen when the dialog opened, so what is confirmed is what was reviewed.
  const [reviewing, setReviewing] = useState<MovePlan>();
  const runButton = useRef<HTMLButtonElement>(null);
  const blockerId = useId();

  const plan = useMemo(() => computePlan({ items, units, rules }), [items, units, rules]);
  const unitNames = useMemo(() => new Map(units.map((u) => [u.id, u.name])), [units]);
  const suggestions = useMemo(
    () => ({
      [CONDITION_KIND.category]: uniqueSorted(items.map((i) => i.category)),
      [CONDITION_KIND.rarity]: uniqueSorted(items.map((i) => i.rarityName)),
      [CONDITION_KIND.collection]: uniqueSorted(items.flatMap((i) => i.collections)),
      [CONDITION_KIND.name]: [],
    }),
    [items],
  );

  const describe = (rule: OrganiserRule) =>
    ORGANISER_PANEL.ruleText(
      rule.conditions
        .map((c) => ORGANISER_PANEL.conditionText[c.kind](c.value))
        .join(ORGANISER_PANEL.conditionJoin),
      unitNames.get(rule.targetUnitId) ?? ORGANISER_PANEL.missingUnit,
    );

  const blocker = busy
    ? ORGANISER_PANEL.busy
    : !itemsReady
      ? ORGANISER_PANEL.itemsUnavailable
      : rules.length === 0
        ? ORGANISER_PANEL.needsRules
        : plan.blocked
          ? ORGANISER_PANEL.runBlocked
          : plan.executable
            ? undefined
            : plan.ruleReports.every((report) => report.matched === 0)
              ? ORGANISER_PANEL.noMatches
              : ORGANISER_PANEL.nothingToMove;

  return (
    <div className={classes.root} aria-label={ORGANISER_PANEL.title}>
      <p className={classes.muted}>{ORGANISER_PANEL.description}</p>
      <section className={classes.rules}>
        <h2 className={classes.heading}>{ORGANISER_PANEL.rulesHeading}</h2>
        {rules.length === 0 ? (
          <p className={classes.muted}>{ORGANISER_PANEL.noRules}</p>
        ) : (
          <ol className={classes.ruleList}>
            {rules.map((rule, index) => (
              <li key={rule.id} className={classes.rule}>
                <span className={classes.ruleText}>
                  <span className={classes.rulePrefix}>
                    {ORGANISER_PANEL.rulePrefix(index + 1)}
                  </span>{" "}
                  {describe(rule)}
                </span>
                <span className={classes.ruleActions}>
                  <Button
                    small
                    aria-label={ORGANISER_PANEL.moveUp}
                    disabled={index === 0}
                    onClick={() => moveRule(rule.id, -1)}
                  >
                    <ArrowUp size={ORGANISER_PANEL.iconSize} />
                  </Button>
                  <Button
                    small
                    aria-label={ORGANISER_PANEL.moveDown}
                    disabled={index === rules.length - 1}
                    onClick={() => moveRule(rule.id, 1)}
                  >
                    <ArrowDown size={ORGANISER_PANEL.iconSize} />
                  </Button>
                  <Button
                    small
                    aria-label={ORGANISER_PANEL.remove}
                    onClick={() => removeRule(rule.id)}
                  >
                    <Trash2 size={ORGANISER_PANEL.iconSize} />
                  </Button>
                </span>
              </li>
            ))}
          </ol>
        )}
        <p className={classes.note}>{ORGANISER_PANEL.storedLocally}</p>
      </section>
      <OrganiserRuleForm units={units} suggestions={suggestions} onAdd={addRule} />
      {itemsReady ? (
        <PlanPreview plan={plan} rules={rules} unitNames={unitNames} />
      ) : (
        <p className={classes.muted}>{ORGANISER_PANEL.itemsUnavailable}</p>
      )}
      <div className={classes.runRow}>
        {/* aria-disabled, not disabled: once a run starts the button is "busy", and a disabled
            opener could not take focus back when the dialog closes. */}
        <Button
          ref={runButton}
          variant="primary"
          aria-disabled={blocker !== undefined}
          aria-describedby={blocker === undefined ? undefined : blockerId}
          className={blocker === undefined ? undefined : classes.runBlocked}
          onClick={blocker === undefined ? () => setReviewing(plan) : undefined}
        >
          {ORGANISER_PANEL.run}
        </Button>
        {blocker && (
          <span id={blockerId} className={classes.note}>
            {blocker}
          </span>
        )}
      </div>
      <DangerDialog
        open={reviewing !== undefined}
        title={
          accountName ? ORGANISER_PANEL.dialog.titleFor(accountName) : ORGANISER_PANEL.dialog.title
        }
        warning={
          reviewing
            ? ORGANISER_PANEL.dialog.warning(reviewing.itemsToMove, reviewing.steps.length)
            : ""
        }
        effects={ORGANISER_PANEL.dialog.effects}
        acknowledgement={ORGANISER_PANEL.dialog.acknowledgement}
        confirmLabel={ORGANISER_PANEL.dialog.confirm}
        workingLabel={ORGANISER_PANEL.dialog.working}
        cancelLabel={ORGANISER_PANEL.dialog.cancel}
        onConfirm={async () => {
          if (!reviewing || accountId === undefined) return;
          await postJson(STORAGE_API.transferPlan, {
            accountId,
            steps: reviewing.steps.map(({ from, to, itemIds }) => ({ from, to, itemIds })),
          });
        }}
        onClose={() => {
          setReviewing(undefined);
          // The dialog hands focus back to the button that opened it; if that did not happen, do it here.
          restoreLostFocus(runButton.current);
        }}
      />
    </div>
  );
}
