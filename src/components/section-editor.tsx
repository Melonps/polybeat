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
import { Denominator, Grouping, RehearsalMark, type Section } from "@/domain";

interface SectionEditorProps {
  section: Section | null;
  onOpenChange: (open: boolean) => void;
  onSave: (section: Section) => void;
}

const NONE_VALUE = "none";

/** Modal for editing a section's time signature, accent grouping, length, and rehearsal mark. */
export function SectionEditor({ section, onOpenChange, onSave }: SectionEditorProps) {
  const [draft, setDraft] = useState<Section | null>(section);

  useEffect(() => {
    setDraft(section);
  }, [section]);

  if (!draft) {
    return null;
  }

  const setNumerator = (numerator: number) => {
    const clamped = Math.min(32, Math.max(1, numerator));
    setDraft({ ...draft, numerator: clamped, grouping: Grouping.default(clamped) });
  };

  const setDenominator = (denominator: Denominator) => {
    setDraft({ ...draft, denominator });
  };

  return (
    <Dialog open={section !== null} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>セクションを編集</DialogTitle>
          <DialogDescription>
            拍子・アクセントのグルーピング・小節数を設定します。
          </DialogDescription>
        </DialogHeader>

        <FieldGroup>
          <Field>
            <FieldLabel htmlFor="section-name">セクション名</FieldLabel>
            <Input
              id="section-name"
              value={draft.name}
              placeholder="例: Verse"
              onChange={(event) => setDraft({ ...draft, name: event.target.value })}
            />
          </Field>

          <div className="flex gap-3">
            <Field className="flex-1">
              <FieldLabel htmlFor="section-numerator">分子</FieldLabel>
              <Input
                id="section-numerator"
                type="number"
                min={1}
                max={32}
                value={draft.numerator}
                onChange={(event) => setNumerator(Number(event.target.value) || 1)}
              />
            </Field>
            <Field className="flex-1">
              <FieldLabel htmlFor="section-denominator">分母</FieldLabel>
              <Select
                value={String(draft.denominator)}
                onValueChange={(value) => setDenominator(Number(value) as Denominator)}
              >
                <SelectTrigger id="section-denominator" className="w-full">
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
            <div className="rounded-lg border border-border p-3">
              <GroupingEditor
                numerator={draft.numerator}
                grouping={draft.grouping}
                onChange={(grouping) => setDraft({ ...draft, grouping: [...grouping] })}
              />
            </div>
          </Field>

          <div className="flex gap-3">
            <Field className="flex-1">
              <FieldLabel htmlFor="section-measure-count">小節数</FieldLabel>
              <Input
                id="section-measure-count"
                type="number"
                min={1}
                max={99}
                value={draft.measureCount}
                onChange={(event) =>
                  setDraft({
                    ...draft,
                    measureCount: Math.min(99, Math.max(1, Number(event.target.value) || 1)),
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
