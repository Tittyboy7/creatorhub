import { notFound } from "next/navigation";

export default function SimulationLayout({
  children,
}) {
  const useSimulation =
    process.env
      .CREATORSHUB_USE_SIMULATION ===
    "true";

  if (!useSimulation) {
    notFound();
  }

  return children;
}