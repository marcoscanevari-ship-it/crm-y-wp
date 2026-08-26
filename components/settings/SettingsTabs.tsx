"use client";

import { useState } from "react";
import { SettingsForm } from "./SettingsForm";
import { RolesMatrix } from "./RolesMatrix";

interface ProfileRow {
  id: string;
  email: string;
  role: "admin" | "operador";
}

export function SettingsTabs({
  systemPrompt,
  calendlyLink,
  profiles,
  currentUserId,
}: {
  systemPrompt: string;
  calendlyLink: string;
  profiles: ProfileRow[];
  currentUserId: string;
}) {
  const [tab, setTab] = useState<"zokky" | "roles">("zokky");

  return (
    <div>
      <div className="flex items-center gap-2 mb-4">
        <TabButton active={tab === "zokky"} onClick={() => setTab("zokky")}>
          Zokky
        </TabButton>
        <TabButton active={tab === "roles"} onClick={() => setTab("roles")}>
          Roles
        </TabButton>
      </div>

      {tab === "zokky" ? (
        <SettingsForm systemPrompt={systemPrompt} calendlyLink={calendlyLink} />
      ) : (
        <RolesMatrix profiles={profiles} currentUserId={currentUserId} />
      )}
    </div>
  );
}

function TabButton({
  active,
  onClick,
  children,
}: {
  active: boolean;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      onClick={onClick}
      className={`px-4 py-2 rounded-xl text-sm font-medium transition ${
        active ? "bg-gray-900 text-white" : "bg-white text-gray-500 hover:text-gray-800"
      }`}
    >
      {children}
    </button>
  );
}
