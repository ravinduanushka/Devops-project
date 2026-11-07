import { useState } from "react";
import useAdminData from "./useAdminData";
import useAdminForms from "./useAdminForms";

export default function useAdminDashboard() {
  const [currentUser] = useState(() => {
    try {
      return JSON.parse(localStorage.getItem("nexus_user") || "null");
    } catch {
      return null;
    }
  });
  const [activeTab, setActiveTab] = useState("register");
  const [notification, setNotification] = useState({ type: "", message: "" });
  const data = useAdminData(setNotification);
  const forms = useAdminForms({
    setNotification,
    loadDashboardData: data.loadDashboardData,
  });
  return {
    currentUser,
    activeTab,
    setActiveTab,
    notification,
    setNotification,
    ...data,
    ...forms,
  };
}
