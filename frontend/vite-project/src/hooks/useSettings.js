import { useEffect, useState } from "react";
import { getSettings } from "../api/settingsApi";

const loadSettings = async () => {
  try {
    const response = await getSettings();

    console.log("========== SETTINGS ==========");
    console.log(response);
    console.log(response.data);
    console.log(response.data.settings);

    setSettings(response.data.settings);
  } catch (err) {
    console.error("ERROR:", err);
    console.log("ERROR RESPONSE:", err.response);
  } finally {
    setLoading(false);
  }
};


useEffect(() => {
  loadSettings();
}, []);

return {
  settings,
  loading,
  reloadSettings: loadSettings,
};
