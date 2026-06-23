import { describe, expect, test, vi } from "vitest";
import { createWhatsAppCloudSender } from "./whatsapp-cloud";

describe("WhatsApp Cloud Sender Adapter", () => {
  test("sends interactive buttons through Meta Cloud API", async () => {
    const fetchImpl = vi.fn(async () => new Response(JSON.stringify({ messages: [{ id: "wamid.out" }] }), { status: 200 }));
    const sender = createWhatsAppCloudSender({
      accessToken: "token",
      phoneNumberId: "phone-number-id",
      fetchImpl
    });

    await sender.send({
      to: "+966599999999",
      response: {
        kind: "interactive_buttons",
        body: "Welcome to MAG Events. How can we help you today?",
        buttons: [
          { id: "apply", title: "Apply" },
          { id: "contact_team", title: "Contact team" }
        ]
      }
    });

    expect(fetchImpl).toHaveBeenCalledWith(
      expect.stringContaining("/phone-number-id/messages"),
      expect.objectContaining({
        method: "POST",
        headers: expect.objectContaining({ Authorization: "Bearer token" }),
        body: JSON.stringify({
          messaging_product: "whatsapp",
          to: "966599999999",
          type: "interactive",
          interactive: {
            type: "button",
            body: { text: "Welcome to MAG Events. How can we help you today?" },
            action: {
              buttons: [
                { type: "reply", reply: { id: "apply", title: "Apply" } },
                { type: "reply", reply: { id: "contact_team", title: "Contact team" } }
              ]
            }
          }
        })
      })
    );
  });

  test("sends text responses and raises provider failures", async () => {
    const fetchImpl = vi.fn(async () => new Response("bad", { status: 400 }));
    const sender = createWhatsAppCloudSender({
      accessToken: "token",
      phoneNumberId: "phone-number-id",
      fetchImpl
    });

    await expect(
      sender.send({
        to: "+966500000000",
        response: { kind: "text", body: "Profile" }
      })
    ).rejects.toMatchObject({ code: "WHATSAPP_SEND_FAILED", status: 400 });
  });
});
