import { PlusIcon, TrashIcon } from "lucide-react";
import { useEffect, useState } from "react";
import { GroupingEditor } from "@/components/grouping-editor";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Field, FieldGroup, FieldLabel } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Denominator, Grouping, MeasurePattern, RehearsalMark, type Section } from "@/domain";

interface SectionEditorProps {
  section: Section | null;
  onOpenChange: (open: boolean) => void;
  onSave: (section: Section) => void;
}

const NONE_VALUE = "none";

/**
 * Modal for editing a section: one or more time-signature "steps" (that cycle in order,
 * e.g. 12/8 then 4/8), how many times the whole sequence repeats, and the rehearsal mark.
 */
export function SectionEditor({ section, onOpenChange, onSave }: SectionEditorProps) {
  const [draft, setDraft] = useState<Section | null>(section);

  useEffect(() => {
    setDraft(section);
  }, [section]);

  if (!draft) {
    return null;
  }

  const updateStep = (stepIndex: number, changes: Partial<MeasurePattern>) => {
    setDraft({
      ...draft,
      pattern: draft.pattern.map((step, index) =>
        index === stepIndex ? { ...step, ...changes } : step,
      ),
    });
  };

  const setStepNumerator = (stepIndex: number, numerator: number) => {
    const clamped = Math.min(32, Math.max(1, numerator));
    updateStep(stepIndex, { numerator: clamped, grouping: Grouping.default(clamped) });
  };

  const addStep = () => {
    setDraft({ ...draft, pattern: [...draft.pattern, MeasurePattern.create()] });
  };

  const removeStep = (stepIndex: number) => {
    if (draft.pattern.length <= 1) {
      return;
    }
    setDraft({ ...draft, pattern: draft.pattern.filter((_, index) => index !== stepIndex) });
  };

  return (
    <Dialog open={section !== null} onOpenChange={onOpenChange}>
      <DialogContent className="flex max-h-[85vh] w-full max-w-sm flex-col overflow-hidden">
        <DialogHeader>
          <DialogTitle>セクションを編集</DialogTitle>
          <DialogDescription>
            拍子・アクセントのグルーピング・繰り返し回数を設定します。複数の拍子を追加すると、その順番で交互に繰り返されます（例:
            12/8 → 4/8 → 12/8 → 4/8 ...）。
          </DialogDescription>
        </DialogHeader>

        <FieldGroup className="-mx-1 min-h-0 flex-1 overflow-y-auto px-1">
          <Field>
            <FieldLabel htmlFor="section-name">セクション名</FieldLabel>
            <Input
              id="section-name"
              value={draft.name}
              placeholder="例: Verse"
              onChange={(event) => setDraft({ ...draft, name: event.target.value })}
            />
          </Field>

          {draft.pattern.map((step, stepIndex) => (
            <div
              // biome-ignore lint/suspicious/noArrayIndexKey: steps are a fixed-order sequence, not a reorderable list
              key={stepIndex}
              className="flex flex-col gap-3 rounded-lg border border-border p-3"
            >
              <div className="flex items-center justify-between">
                <span className="text-xs font-medium text-muted-foreground">
                  拍子 {stepIndex + 1}
                </span>
                {draft.pattern.length > 1 ? (
                  <Button
                    size="icon-sm"
                    variant="ghost"
                    aria-label="この拍子を削除"
                    onClick={() => removeStep(stepIndex)}
                  >
                    <TrashIcon />
                  </Button>
                ) : null}
              </div>

              <div className="flex gap-3">
                <Field className="flex-1">
                  <FieldLabel htmlFor={`section-numerator-${stepIndex}`}>分子</FieldLabel>
                  <Input
                    id={`section-numerator-${stepIndex}`}
                    type="number"
                    min={1}
                    max={32}
                    value={step.numerator}
                    onChange={(event) =>
                      setStepNumerator(stepIndex, Number(event.target.value) || 1)
                    }
                  />
                </Field>
                <Field className="flex-1">
                  <FieldLabel htmlFor={`section-denominator-${stepIndex}`}>分母</FieldLabel>
                  <Select
                    value={String(step.denominator)}
                    onValueChange={(value) =>
                      updateStep(stepIndex, { denominator: Number(value) as Denominator })
                    }
                  >
                    <SelectTrigger id={`section-denominator-${stepIndex}`} className="w-full">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectGroup>
                        {Denominator.values.map((value) => (
                          <SelectItem key={value} value={String(value)}>
                            {value}
                          </SelectItem>
                        ))}
                      </SelectGroup>
                    </SelectContent>
                  </Select>
                </Field>
              </div>

              <Field>
                <FieldLabel>グルーピング</FieldLabel>
                <GroupingEditor
                  numerator={step.numerator}
                  grouping={step.grouping}
                  onChange={(grouping) => updateStep(stepIndex, { grouping: [...grouping] })}
                />
              </Field>
            </div>
          ))}

          <Button variant="outline" size="sm" onClick={addStep} className="self-start">
            <PlusIcon data-icon="inline-start" />
            拍子を追加
          </Button>

          <div className="flex gap-3">
            <Field className="flex-1">
              <FieldLabel htmlFor="section-repeat-count">
                {draft.pattern.length > 1 ? "繰り返し回数" : "小節数"}
              </FieldLabel>
              <Input
                id="section-repeat-count"
                type="number"
                min={1}
                max={99}
                value={draft.repeatCount}
                onChange={(event) =>
                  setDraft({
                    ...draft,
                    repeatCount: Math.min(99, Math.max(1, Number(event.target.value) || 1)),
                  })
                }
              />
            </Field>
            <Field className="flex-1">
              <FieldLabel htmlFor="section-rehearsal-mark">リハーサルマーク</FieldLabel>
              <Select
                value={draft.rehearsalMark ?? NONE_VALUE}
                onValueChange={(value) =>
                  setDraft({
                    ...draft,
                    rehearsalMark:
                      value === NONE_VALUE ? null : (value as Section["rehearsalMark"]),
                  })
                }
              >
                <SelectTrigger id="section-rehearsal-mark" className="w-full">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectGroup>
                    <SelectItem value={NONE_VALUE}>なし</SelectItem>
                    {RehearsalMark.all.map((mark) => (
                      <SelectItem key={mark} value={mark}>
                        {mark}
                      </SelectItem>
                    ))}
                  </SelectGroup>
                </SelectContent>
              </Select>
            </Field>
          </div>
          {draft.pattern.length > 1 ? (
            <p className="text-xs text-muted-foreground">
              合計 {draft.pattern.length * draft.repeatCount} 小節（
              {draft.pattern.map(MeasurePattern.label).join(" → ")} を {draft.repeatCount}{" "}
              回繰り返し）
            </p>
          ) : null}
        </FieldGroup>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button
            onClick={() => {
              onSave(draft);
              onOpenChange(false);
            }}
          >
            Save
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
