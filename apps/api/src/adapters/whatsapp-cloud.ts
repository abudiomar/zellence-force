import type { WhatsAppBotResponse } from "@zellforce/application";

export class WhatsAppCloudSenderError extends Error {
  constructor(
    public readonly code: string,
    message: string,
    public readonly status?: number
  ) {
    super(message);
    this.name = "WhatsAppCloudSenderError";
  }
}

export function createWhatsAppCloudSender(input: {
  accessToken: string;
  phoneNumberId: string;
  graphApiVersion?: string;
  fetchImpl?: typeof fetch;
}) {
  const fetchImpl = input.fetchImpl ?? fetch;
  const graphApiVersion = input.graphApiVersion ?? "v20.0";

  return {
    async send(args: { to: string; response: WhatsAppBotResponse }): Promise<void> {
      const response = await fetchImpl(
        `https://graph.facebook.com/${graphApiVersion}/${encodeURIComponent(input.phoneNumberId)}/messages`,
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${input.accessToken}`,
            "Content-Type": "application/json"
          },
          body: JSON.stringify(toCloudApiPayload(args.to, args.response))
        }
      );

      if (!response.ok) {
        throw new WhatsAppCloudSenderError(
          "WHATSAPP_SEND_FAILED",
          "Unable to send WhatsApp message",
          response.status
        );
      }
    }
  };
}

function toCloudApiPayload(to: string, response: WhatsAppBotResponse) {
  const base = {
    messaging_product: "whatsapp",
    to: to.replace(/[^\d]/g, "")
  };

  if (response.kind === "text") {
    return {
      ...base,
      type: "text",
      text: { body: response.body }
    };
  }

  return {
    ...base,
    type: "interactive",
    interactive: {
      type: "button",
      body: { text: response.body },
      action: {
        buttons: response.buttons.map((button) => ({
          type: "reply",
          reply: {
            id: button.id,
            title: button.title
          }
        }))
      }
    }
  };
}
