import React from "react";
import { useAuthStore } from "../store/useAuthStore";

const SettingsPage = () => {
  const { authUser } = useAuthStore();

  return <div>SettingsPage</div>;
};

export default SettingsPage;
