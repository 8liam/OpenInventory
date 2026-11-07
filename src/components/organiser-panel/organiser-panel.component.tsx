import { ArrowDown, ArrowUp, Trash2 } from "lucide-react";
import { useMemo, useState } from "react";
import { Button } from "~/components/button/button.component";
import { DangerDialog } from "~/components/danger-dialog/danger-dialog.component";
import { OrganiserRuleForm } from "~/components/organiser-rule-form/organiser-rule-form.component";
import { PlanPreview } from "~/components/plan-preview/plan-preview.component";
import { CONDITION_KIND } from "~/lib/organiser/organiser.config";
import { computePlan } from "~/lib/organiser/organiser.plan";
import { useOrganiser } from "~/lib/organiser/organiser.store";
import type { MovePlan, OrganiserRule } from "~/lib/organiser/organiser.types";
import { postJson } from "~/lib/storage/storage.client";
import { STORAGE_API } from "~/lib/storage/storage.config";
import { ORGANISER_PANEL } from "./organiser-panel.config";
import type { OrganiserPanelProps } from "./organiser-panel.types";

const ICON_SIZE = 14;

function uniqueSorted(values: Iterable<string | null>): readonly string[] {
  return [...new Set([...values].filter((v): v is string => v !== null && v !== ""))].sort();
}

export function OrganiserPanel({ items, units, itemsReady, busy }: OrganiserPanelProps) {
  const { rules, addRule, removeRule, moveRule } = useOrganiser();
  // The plan frozen when the dialog opened, so what is confirmed is what was reviewed.
  const [reviewing, setReviewing] = useState<MovePlan>();

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
      : plan.executable
        ? undefined
        : ORGANISER_PANEL.runBlocked;

  return (
    <div
      className="flex min-h-0 flex-1 flex-col gap-5 overflow-y-auto"
      aria-label={ORGANISER_PANEL.title}
    >
      <p className="text-muted-foreground">{ORGANISER_PANEL.description}</p>
      <section className="flex flex-col gap-2">
        <h3 className="font-medium">{ORGANISER_PANEL.rulesHeading}</h3>
        {rules.length === 0 ? (
          <p className="text-muted-foreground">{ORGANISER_PANEL.noRules}</p>
        ) : (
          <ol className="flex flex-col gap-1">
            {rules.map((rule, index) => (
              <li
                key={rule.id}
                className="flex items-center justify-between gap-2 rounded border px-3 py-1.5 text-sm"
              >
                <span className="min-w-0 truncate">
                  <span className="tabular text-muted-foreground">
                    {ORGANISER_PANEL.rulePrefix(index + 1)}
                  </span>{" "}
                  {describe(rule)}
                </span>
                <span className="flex shrink-0 gap-1">
                  <Button
                    small
                    aria-label={ORGANISER_PANEL.moveUp}
                    disabled={index === 0}
                    onClick={() => moveRule(rule.id, -1)}
                  >
                    <ArrowUp size={ICON_SIZE} />
                  </Button>
                  <Button
                    small
                    aria-label={ORGANISER_PANEL.moveDown}
                    disabled={index === rules.length - 1}
                    onClick={() => moveRule(rule.id, 1)}
                  >
                    <ArrowDown size={ICON_SIZE} />
                  </Button>
                  <Button
                    small
                    aria-label={ORGANISER_PANEL.remove}
                    onClick={() => removeRule(rule.id)}
                  >
                    <Trash2 size={ICON_SIZE} />
                  </Button>
                </span>
              </li>
            ))}
          </ol>
        )}
        <p className="text-xs text-muted-foreground">{ORGANISER_PANEL.storedLocally}</p>
      </section>
      <OrganiserRuleForm units={units} suggestions={suggestions} onAdd={addRule} />
      {itemsReady ? (
        <PlanPreview plan={plan} rules={rules} unitNames={unitNames} />
      ) : (
        <p className="text-muted-foreground">{ORGANISER_PANEL.itemsUnavailable}</p>
      )}
      <div className="flex flex-wrap items-center gap-3">
        <Button
          variant="primary"
          disabled={blocker !== undefined}
          onClick={() => setReviewing(plan)}
        >
          {ORGANISER_PANEL.run}
        </Button>
        {blocker && <span className="text-xs text-muted-foreground">{blocker}</span>}
      </div>
      <DangerDialog
        open={reviewing !== undefined}
        title={ORGANISER_PANEL.dialog.title}
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
          if (!reviewing) return;
          await postJson(STORAGE_API.transferPlan, {
            steps: reviewing.steps.map(({ from, to, itemIds }) => ({ from, to, itemIds })),
          });
        }}
        onClose={() => setReviewing(undefined)}
      />
    </div>
  );
}
