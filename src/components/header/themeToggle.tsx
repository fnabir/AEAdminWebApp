import * as React from "react"
import {useTheme} from "next-themes"

import {Button} from "@/components/ui/button"
import {FaMoon, FaSun} from "react-icons/fa6";

export function ThemeToggle() {
	const { theme, setTheme } = useTheme()

	const toggleTheme = () => {
		setTheme(theme === "light" ? "dark" : "light");
	};

  React.useEffect(() => {
    const storedTheme = localStorage.getItem('theme');
    if (storedTheme !== null) {
      setTheme(storedTheme);
    }
  });
  
  React.useEffect(() => {
    localStorage.setItem('theme', String(theme));
  }, [theme]);

	return (
		<Button variant="outline"
				size="icon"
				onClick={toggleTheme}
				className="text-primary hover:bg-accent"
		>
			{
				theme === "light" ?
					<FaMoon className="size-5" />
					: <FaSun className="size-5" />
			}
			<span className="sr-only">Toggle theme</span>
		</Button>
	)
}