import * as chrono from "chrono-node";

type ParsedReminder = {
  title: string;
  remindAt?: string;
  timezone: string;
};

function normalizeTitle(input: string, datePhrase?: string) {
  let value = input;

  if (datePhrase) {
    value = value.replace(datePhrase, " ");
  }

  value = value
    .replace(/^\s*remind me\s*/i, "")
    .replace(/^to\s+/i, "")
    .replace(/\s+/g, " ")
    .trim();

  if (!value) {
    return "Untitled reminder";
  }

  return value;
}

export function parseReminderFromText(input: string, now = new Date()): ParsedReminder {
  const timezone = Intl.DateTimeFormat().resolvedOptions().timeZone || "UTC";

  const parsed = chrono.parse(input, now, {
    forwardDate: true,
  });

  const best = parsed.at(0);
  if (!best) {
    return {
      title: normalizeTitle(input),
      timezone,
    };
  }

  const remindDate = best.start.date();

  return {
    title: normalizeTitle(input, best.text),
    remindAt: remindDate.toISOString().slice(0, 16),
    timezone,
  };
}
