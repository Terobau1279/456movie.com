import { MainNav } from "@/components/navbar/main-nav";
import { MobileNav } from "@/components/navbar/mobile-nav";
import { ThemeToggle } from "@/components/theme-toggle";
import { CommandSearch } from "../command-search";

export function SiteHeader() {
  return (
    <header className="sticky top-0 z-50 w-full border-b border-border/40 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-14 max-w-screen-2xl items-center">
        <MainNav />
        <MobileNav />
        <div className="flex flex-1 items-center space-x-2 justify-end">
          <nav className="flex items-center space-x-4">
            <CommandSearch />
            <ThemeToggle />
            {/* Styled Link to Discord */}
            <a
              href="https://discord.gg/e5BEVDnp"
              target="_blank"
              rel="noopener noreferrer"
              className="text-white hover:text-gray-300 transition-colors duration-300"
            >
              Join Discord
            </a>
          </nav>
        </div>
      </div>
    </header>
  );
}
