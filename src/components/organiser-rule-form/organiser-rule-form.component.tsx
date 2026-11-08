import { useState } from "react";
import { Button } from "~/components/button/button.component";
import { Select } from "~/components/select/select.component";
import {
  CONDITION_KIND,
  CONDITION_KINDS,
  ORGANISER_LIMITS,
} from "~/lib/organiser/organiser.config";
import { randomId } from "~/utils/random-id";
import type { RuleCondition } from "~/lib/organiser/organiser.types";
import { RULE_FORM } from "./organiser-rule-form.config";
import type { OrganiserRuleFormProps } from "./organiser-rule-form.types";

const BLANK: RuleCondition = { kind: CONDITION_KIND.category, value: "" };

export function OrganiserRuleForm({ units, suggestions, onAdd }: OrganiserRuleFormProps) {
  const [conditions, setConditions] = useState<readonly RuleCondition[]>([BLANK]);
  const [target, setTarget] = useState("");
  const [touched, setTouched] = useState(false);

  const complete = conditions.every((c) => c.value.trim() !== "") && target !== "";

  function patch(index: number, change: Partial<RuleCondition>) {
    setConditions((current) => current.map((c, i) => (i === index ? { ...c, ...change } : c)));
  }

  function submit() {
    setTouched(true);
    if (!complete) return;
    onAdd({
      id: randomId(),
      targetUnitId: target,
      conditions: conditions.map((c) => ({ kind: c.kind, value: c.value.trim() })),
    });
    setConditions([BLANK]);
    setTarget("");
    setTouched(false);
  }

  return (
    <form
      className="flex flex-col gap-2"
      aria-label={RULE_FORM.heading}
      onSubmit={(event) => {
        event.preventDefault();
        submit();
      }}
    >
      <h2 className="font-medium">{RULE_FORM.heading}</h2>
      {conditions.map((condition, index) => (
        <div key={index} className="flex flex-wrap items-center gap-2">
          <Select
            value={condition.kind}
            ariaLabel={RULE_FORM.conditionKindLabel}
            className="w-44"
            options={CONDITION_KINDS.map((kind) => ({
              id: kind,
              label: RULE_FORM.kindLabels[kind],
            }))}
            onChange={(kind) => {
              const next = CONDITION_KINDS.find((k) => k === kind);
              if (next) patch(index, { kind: next });
            }}
          />
          <input
            aria-label={RULE_FORM.valueLabel}
            placeholder={RULE_FORM.valuePlaceholder}
            list={`${RULE_FORM.listIdPrefix}${condition.kind}`}
            maxLength={ORGANISER_LIMITS.maxValueLength}
            value={condition.value}
            onChange={(event) => patch(index, { value: event.target.value })}
            className={RULE_FORM.inputClass}
          />
          {conditions.length > 1 && (
            <Button
              small
              type="button"
              onClick={() => setConditions(conditions.filter((_, i) => i !== index))}
            >
              {RULE_FORM.removeCondition}
            </Button>
          )}
        </div>
      ))}
      {CONDITION_KINDS.map((kind) => (
        <datalist key={kind} id={`${RULE_FORM.listIdPrefix}${kind}`}>
          {suggestions[kind].map((value) => (
            <option key={value} value={value} />
          ))}
        </datalist>
      ))}
      <div className="flex flex-wrap items-center gap-2">
        <span className="text-muted-foreground">{RULE_FORM.targetLabel}</span>
        <Select
          value={target}
          ariaLabel={RULE_FORM.targetLabel}
          className="w-56"
          options={[
            { id: "", label: RULE_FORM.chooseTarget },
            ...units.map((unit) => ({ id: unit.id, label: unit.name })),
          ]}
          onChange={setTarget}
        />
      </div>
      <div className="flex flex-wrap gap-2">
        <Button
          small
          type="button"
          disabled={conditions.length >= ORGANISER_LIMITS.maxConditionsPerRule}
          onClick={() => setConditions([...conditions, BLANK])}
        >
          {RULE_FORM.addCondition}
        </Button>
        <Button small type="submit" variant="primary">
          {RULE_FORM.addRule}
        </Button>
      </div>
      {touched && !complete && (
        <p role="alert" className="text-sm text-destructive">
          {RULE_FORM.invalid}
        </p>
      )}
    </form>
  );
}
