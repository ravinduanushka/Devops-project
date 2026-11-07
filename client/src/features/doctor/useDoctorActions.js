import { useState } from "react";
import { createActionRunner } from "./actionRunner";

export default function useDoctorActions() {
  const [pendingActions, setPendingActions] = useState([]);
  const [actionError, setActionError] = useState("");
  const [runAction] = useState(() =>
    createActionRunner({
      onPending: setPendingActions,
      onError: setActionError,
    }),
  );
  return { pendingActions, actionError, runAction };
}
