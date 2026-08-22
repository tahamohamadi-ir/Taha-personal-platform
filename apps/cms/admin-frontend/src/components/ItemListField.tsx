import type { ReactElement } from "react";
import type { CompositionFieldSpec } from "../lib/api";

export interface ItemListFieldProps {
  spec: CompositionFieldSpec;
  items: Array<Record<string, unknown>>;
  onChange: (items: Array<Record<string, unknown>>) => void;
  error?: string;
}

function emptyItem(spec: CompositionFieldSpec): Record<string, unknown> {
  const item: Record<string, unknown> = {};
  for (const field of spec.itemFields ?? []) {
    item[field.key] = field.type === "textarea" ? "" : "";
  }
  return item;
}

export default function ItemListField({
  spec,
  items,
  onChange,
  error,
}: ItemListFieldProps): ReactElement {
  const minItems = spec.minItems ?? 1;
  const maxItems = spec.maxItems ?? 12;

  function updateItem(index: number, key: string, value: string): void {
    const next = items.map((item, itemIndex) =>
      itemIndex === index ? { ...item, [key]: value } : item
    );
    onChange(next);
  }

  function addItem(): void {
    if (items.length >= maxItems) {
      return;
    }
    onChange([...items, emptyItem(spec)]);
  }

  function removeItem(index: number): void {
    if (items.length <= minItems) {
      return;
    }
    onChange(items.filter((_, itemIndex) => itemIndex !== index));
  }

  return (
    <div className="admin-form-row">
      <label className="admin-label">{spec.label}</label>
      <div className="space-y-2">
        {items.map((item, index) => (
          <div key={index} className="rounded border p-2">
            <div className="mb-2 flex items-center justify-between gap-2">
              <span className="admin-muted text-xs">
                {spec.label} {index + 1}
              </span>
              <button
                type="button"
                className="admin-btn px-2 text-xs"
                onClick={() => removeItem(index)}
                disabled={items.length <= minItems}
              >
                حذف
              </button>
            </div>
            {(spec.itemFields ?? []).map((field) => {
              const raw = item[field.key];
              const value = typeof raw === "string" ? raw : "";
              if (field.type === "textarea") {
                return (
                  <div key={field.key} className="admin-form-row">
                    <label className="admin-label">{field.label}</label>
                    <textarea
                      className="admin-input"
                      rows={3}
                      dir="auto"
                      value={value}
                      onChange={(event) =>
                        updateItem(index, field.key, event.target.value)
                      }
                    />
                  </div>
                );
              }
              return (
                <div key={field.key} className="admin-form-row">
                  <label className="admin-label">{field.label}</label>
                  <input
                    className="admin-input"
                    dir="auto"
                    value={value}
                    onChange={(event) =>
                      updateItem(index, field.key, event.target.value)
                    }
                  />
                </div>
              );
            })}
          </div>
        ))}
      </div>
      <button
        type="button"
        className="admin-btn mt-2"
        onClick={addItem}
        disabled={items.length >= maxItems}
      >
        افزودن ({items.length}/{maxItems})
      </button>
      {error !== undefined && <p className="admin-field-error">{error}</p>}
    </div>
  );
}

export function itemsOf(settings: Record<string, unknown>, key: string): Array<Record<string, unknown>> {
  const value = settings[key];
  return Array.isArray(value) ? (value as Array<Record<string, unknown>>) : [];
}
