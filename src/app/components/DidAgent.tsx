"use client";

import { useEffect, useRef, useState } from "react";
import * as sdk from "@d-id/client-sdk";
/* eslint-disable @typescript-eslint/no-explicit-any */

const AGENT_ID = process.env.NEXT_PUBLIC_DID_AGENT_ID!;
const CLIENT_KEY = process.env.NEXT_PUBLIC_DID_CLIENT_KEY!;

export default function DidAgent() {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [agentManager, setAgentManager] = useState<any>(null);
  const [messages, setMessages] = useState<
    { role: "user" | "assistant"; content: string }[]
  >([]);
  const [input, setInput] = useState("");

  // ------- initialise once on mount -------
  useEffect(() => {
    let manager: any;
    (async () => {
      const callbacks = {
        // mandatory – pipe the WebRTC MediaStream to <video>
        onSrcObjectReady(value: MediaStream) {
          if (videoRef.current) videoRef.current.srcObject = value;
        },

        // keep a local chat log
        onNewMessage(newMsgs: any, type: "partial" | "answer") {
          if (type === "answer") setMessages(newMsgs);
        },

        // (optional) debug connection status
        onConnectionStateChange: (s: string) => console.log("[connection]", s),

        onError: (err: any, data: any) =>
          console.error("[D-ID error]", err, data),
      };

      manager = await sdk.createAgentManager(
        AGENT_ID,
        {
          auth: { type: "key", clientKey: CLIENT_KEY },
          callbacks,
          streamOptions: { compatibilityMode: "auto", streamWarmup: true },
        } as any // ← loose-casts the options
      );

      await manager.connect(); // open WebRTC + chat session
      setAgentManager(manager);
    })();

    // cleanup on unmount
    return () => manager?.disconnect?.();
  }, []);

  // ------- send a user message -------
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || !agentManager) return;
    const content = input.trim();
    setMessages((m) => [...m, { role: "user", content }]);
    setInput("");
    // chat() streams a talking-head reply (video+audio)
    await agentManager.chat(content);
  };

  return (
    <div className="w-full max-w-md mx-auto space-y-4">
      <video
        ref={videoRef}
        playsInline
        autoPlay
        muted={false} // let the voice be heard
        className="w-full rounded-lg bg-black"
      />
      <ul className="space-y-2 h-60 overflow-y-auto border p-2 rounded">
        {messages.map((m, i) => (
          <li key={i} className={m.role === "user" ? "text-right" : ""}>
            <span
              className={
                m.role === "user"
                  ? "bg-blue-500 text-white px-2 py-1 rounded"
                  : "bg-gray-200 px-2 py-1 rounded"
              }
            >
              {m.content}
            </span>
          </li>
        ))}
      </ul>
      <form onSubmit={handleSubmit} className="flex gap-2">
        <input
          className="flex-1 border rounded px-2 py-1"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Ask me anything…"
        />
        <button
          className="px-4 py-1 rounded bg-blue-600 text-white disabled:opacity-50"
          disabled={!input.trim() || !agentManager}
        >
          Send
        </button>
      </form>
    </div>
  );
}
