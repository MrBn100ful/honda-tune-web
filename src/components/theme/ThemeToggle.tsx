
import { Button } from "@/components/ui/button";
import { Moon, Sun } from "lucide-react";
import { useTheme } from "@/providers/ThemeProvider";

export const ThemeToggle = () => {
  const { theme, toggleTheme } = useTheme();
  const isDark = theme === 'dark';
  
  return (
    <Button 
      variant="outline" 
      size="icon" 
      onClick={toggleTheme}
      className={`relative overflow-hidden transition-colors ${
        isDark 
          ? "bg-honda-gray border-honda-gray text-honda-light hover:bg-honda-dark" 
          : "bg-white border-gray-300 text-honda-dark hover:bg-gray-100"
      }`}
      title={isDark ? 'Switch to light mode' : 'Switch to dark mode'}
    >
      <span className={`absolute transform transition-all ${isDark ? 'scale-0' : 'scale-100'}`}>
        <Moon size={16} />
      </span>
      <span className={`absolute transform transition-all ${isDark ? 'scale-100' : 'scale-0'}`}>
        <Sun size={16} />
      </span>
    </Button>
  );
};
