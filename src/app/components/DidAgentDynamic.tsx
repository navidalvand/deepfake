// src/app/components/DidAgentDynamic.tsx   (Client Component)
"use client";

import dynamic from "next/dynamic";

// now ssr:false is allowed because this file itself is client-only
const DidAgent = dynamic(() => import("./DidAgent"), { ssr: false });

export default function DidAgentDynamic() {
  return <DidAgent />;
}
