import { env } from "@/lib/validation/env";
import { log } from "@/lib/utils/logger";

type ReminderEmailPayload = {
  to: string;
  subject: string;
  text: string;
};

export interface ReminderEmailProvider {
  send(payload: ReminderEmailPayload): Promise<{ ok: boolean; provider: string }>;
}

class NoopEmailProvider implements ReminderEmailProvider {
  async send(payload: ReminderEmailPayload) {
    log("info", "Noop email provider used", { to: payload.to, subject: payload.subject });
    return { ok: true, provider: "noop" };
  }
}

class ResendEmailProvider implements ReminderEmailProvider {
  async send(payload: ReminderEmailPayload) {
    if (!env.RESEND_API_KEY || !env.EMAIL_FROM) {
      throw new Error("RESEND_API_KEY or EMAIL_FROM is missing");
    }

    const response = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${env.RESEND_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        from: env.EMAIL_FROM,
        to: payload.to,
        subject: payload.subject,
        text: payload.text,
      }),
    });

    if (!response.ok) {
      const text = await response.text();
      log("error", "Resend email failed", { status: response.status, body: text });
      return { ok: false, provider: "resend" };
    }

    return { ok: true, provider: "resend" };
  }
}

export function getReminderEmailProvider(): ReminderEmailProvider {
  if (env.EMAIL_PROVIDER === "resend") {
    return new ResendEmailProvider();
  }

  return new NoopEmailProvider();
}
