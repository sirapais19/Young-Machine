import { useContext } from "react";
import { AppDataContext } from "@/store/AppDataProvider";

export function useAppData() {
  const context = useContext(AppDataContext);
  if (!context) {
    throw new Error("useAppData must be used inside AppDataProvider");
  }
  return context;
}
