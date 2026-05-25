import { useState, useEffect } from "react";
import { toDate } from "../constants";

export function useSessionTimer(openedAt) {
  const [elapsed, setElapsed] = useState("--:--:--");

  useEffect(() => {
    function update() {
      if (!openedAt) return;
      const diff = Math.floor((Date.now() - toDate(openedAt).getTime()) / 1000);
      const h = Math.floor(diff / 3600);
      const m = Math.floor((diff % 3600) / 60);
      const s = diff % 60;
      setElapsed(
        `${String(h).padStart(2, "0")}:${String(m).padStart(2, "0")}:${String(s).padStart(2, "0")}`
      );
    }
    update();
    const id = setInterval(update, 1000);
    return () => clearInterval(id);
  }, [openedAt]);

  return elapsed;
}
