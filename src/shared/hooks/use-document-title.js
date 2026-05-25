import { useEffect } from "react";

const APP_NAME = "ServeFlow";

export function useDocumentTitle(section) {
  useEffect(() => {
    document.title = section ? `${section} - ${APP_NAME}` : APP_NAME;
  }, [section]);
}
