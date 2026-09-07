import { readFileSync } from "node:fs";

function assert(condition, message) {
  if (!condition) {
    throw new Error(message);
  }
}

/**
 * Remaining-work (LOG-0278 escalation): the contact form's email field
 * degrades to type="text" because ui/InputField exposes no type seam,
 * and neither primitive exposes autocomplete/maxlength/rows seams.
 * Server-side enforcement is unchanged — these are render-only seams.
 */
const input = readFileSync(new URL("../src/components/ui/InputField.astro", import.meta.url), "utf8");
assert(input.includes("type?"), "InputField lacks type seam (email degrades to text)");
assert(input.includes("autocomplete?"), "InputField lacks autocomplete seam");
assert(input.includes("maxlength?"), "InputField lacks maxlength seam");
assert(
  input.includes('type="text"') || input.includes("type={"),
  "InputField must keep an explicit type on <input>",
);

const textarea = readFileSync(
  new URL("../src/components/ui/TextareaField.astro", import.meta.url),
  "utf8",
);
assert(textarea.includes("rows?"), "TextareaField lacks rows seam");
assert(textarea.includes("maxlength?"), "TextareaField lacks maxlength seam");

const contact = readFileSync(
  new URL("../src/components/ContactPage.astro", import.meta.url),
  "utf8",
);
assert(
  contact.includes('name="email"') && contact.includes('type="email"'),
  "ContactPage email field must use type=email once the seam exists",
);

console.log("PASS inputfield-seams (type/autocomplete/maxlength/rows + contact wiring)");
