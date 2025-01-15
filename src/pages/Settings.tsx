import BibleSettings from "@/components/settings/BibleSettings";
import AdminPromptPanel from "@/components/settings/AdminPromptPanel";
import SettingsContainer from "@/components/settings/SettingsContainer";

const Settings = () => {
  return (
    <SettingsContainer>
      <BibleSettings />
      <AdminPromptPanel />
    </SettingsContainer>
  );
};

export default Settings;