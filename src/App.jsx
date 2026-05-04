import React, { useSyncExternalStore } from "react";
import CareerDiagnosisMVP from "./CareerDiagnosisMVP.jsx";
import AdminSubmissionsPage from "./AdminSubmissionsPage.jsx";
import DeployEnvBanner from "./DeployEnvBanner.jsx";
import SupabaseDbHealthBanner from "./SupabaseDbHealthBanner.jsx";

function readHash() {
  if (typeof window === "undefined") return "#/";
  return window.location.hash || "#/";
}

function subscribeHash(onChange) {
  window.addEventListener("hashchange", onChange);
  return () => window.removeEventListener("hashchange", onChange);
}

function useHashPath() {
  const hash = useSyncExternalStore(subscribeHash, readHash, () => "#/");
  const path = hash.replace(/^#/, "") || "/";
  return path.startsWith("/admin") ? "admin" : "app";
}

export default function App() {
  const route = useHashPath();
  return (
    <>
      <DeployEnvBanner />
      <SupabaseDbHealthBanner />
      {route === "admin" ? <AdminSubmissionsPage /> : <CareerDiagnosisMVP />}
    </>
  );
}
