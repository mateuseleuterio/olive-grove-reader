import { ReactNode } from "react";

interface SettingsContainerProps {
  children: ReactNode;
}

const SettingsContainer = ({ children }: SettingsContainerProps) => {
  return (
    <div className="container mx-auto max-w-4xl py-8">
      <h1 className="text-3xl font-bold mb-8">Configurações</h1>
      <div className="space-y-8">
        {children}
      </div>
    </div>
  );
};

export default SettingsContainer;