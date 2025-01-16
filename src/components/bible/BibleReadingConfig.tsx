import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { ArrowUp, ArrowDown, Sun, Moon } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface BibleReadingConfigProps {
  onFontSizeChange: (size: number) => void;
  currentFontSize: number;
}

const BibleReadingConfig = ({ onFontSizeChange, currentFontSize }: BibleReadingConfigProps) => {
  const [isDarkMode, setIsDarkMode] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    // Check if dark mode was previously enabled
    const darkModeEnabled = localStorage.getItem("darkMode") === "true";
    setIsDarkMode(darkModeEnabled);
    if (darkModeEnabled) {
      document.documentElement.classList.add("dark");
    }
  }, []);

  const toggleDarkMode = () => {
    setIsDarkMode(!isDarkMode);
    if (!isDarkMode) {
      document.documentElement.classList.add("dark");
      localStorage.setItem("darkMode", "true");
    } else {
      document.documentElement.classList.remove("dark");
      localStorage.setItem("darkMode", "false");
    }
    
    toast({
      title: !isDarkMode ? "Modo noturno ativado" : "Modo noturno desativado",
      duration: 1500,
    });
  };

  const increaseFontSize = () => {
    if (currentFontSize < 24) {
      onFontSizeChange(currentFontSize + 1);
      toast({
        title: "Fonte aumentada",
        duration: 1500,
      });
    }
  };

  const decreaseFontSize = () => {
    if (currentFontSize > 14) {
      onFontSizeChange(currentFontSize - 1);
      toast({
        title: "Fonte diminuída",
        duration: 1500,
      });
    }
  };

  return (
    <div className="flex items-center gap-2 p-2 bg-white dark:bg-bible-navy rounded-lg shadow-sm">
      <Button
        variant="ghost"
        size="icon"
        onClick={decreaseFontSize}
        disabled={currentFontSize <= 14}
        className="hover:bg-bible-gray dark:hover:bg-bible-accent"
      >
        <ArrowDown className="h-4 w-4" />
      </Button>
      <Button
        variant="ghost"
        size="icon"
        onClick={increaseFontSize}
        disabled={currentFontSize >= 24}
        className="hover:bg-bible-gray dark:hover:bg-bible-accent"
      >
        <ArrowUp className="h-4 w-4" />
      </Button>
      <div className="w-px h-6 bg-bible-gray dark:bg-bible-accent mx-1" />
      <Button
        variant="ghost"
        size="icon"
        onClick={toggleDarkMode}
        className="hover:bg-bible-gray dark:hover:bg-bible-accent"
      >
        {isDarkMode ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
      </Button>
    </div>
  );
};

export default BibleReadingConfig;