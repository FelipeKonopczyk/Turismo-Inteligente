import type { ReactNode } from "react";

export type KpiCardProps = {
  titulo: string;
  valor: ReactNode;
  sufixo?: ReactNode;
  icon?: ReactNode;
};

export default function KpiCard({ titulo, valor, sufixo, icon }: KpiCardProps) {
  return (
    <div
      style={{
        backgroundColor: "#1f2937",
        borderRadius: "16px",
        padding: "14px 16px",
        boxShadow: "0 15px 35px rgba(2, 6, 23, 0.35)",
        display: "flex",
        flexDirection: "column",
        gap: "6px",
        minHeight: 86
      }}
    >
      <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
        {icon && <span style={{ color: "#60a5fa" }}>{icon}</span>}
        <span style={{ fontSize: "0.8rem", color: "#cbd5f5" }}>{titulo}</span>
      </div>
      <div style={{ fontSize: "1.35rem", fontWeight: 600, color: "#f8fafc" }}>
        {valor}
        {sufixo && <span style={{ fontSize: "0.9rem", marginLeft: "4px", color: "#94a3b8" }}>{sufixo}</span>}
      </div>
    </div>
  );
}
