import React from "react";
import { MessagesClient } from "./messages-client";

export default function MessagesPage() {
  return (
    <section className="content-band">
      <MessagesClient />
    </section>
  );
}
