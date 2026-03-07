import { type ReactNode } from "react";
import { useEffect, useState } from "react";

interface Props {
  children: ReactNode;
}
import { migrateNavPreferences } from "../../constants/navigation";
type NavPreference = ReturnType<typeof migrateNavPreferences>[number];
import { useGlobalNavigation } from "../../hooks/useGlobalNavigation";
import useScrollRestoration from "../../hooks/useScrollRestoration";
import { apiGet } from "../../api";
import Sidebar from "./Sidebar";
import TopBar from "./TopBar";

/**
 * GlobalLayout - Top-level layout with sidebar navigation
 *
 * Layout structure:
 * - Sidebar (hidden on mobile, visible lg+)
 * - TopBar (logo, help, settings, user menu)
 * - Main content area with responsive spacing
 */
const GlobalLayout = ({ children }: Props) => {
  const [navPreferences, setNavPreferences] = useState<NavPreference[]>([]);
  const [isSidebarExpanded, setIsSidebarExpanded] = useState(false);

  useEffect(() => {
    const loadNavPreferences = async () => {
      try {
        const response = await apiGet("/user/settings") as { settings: Record<string, unknown> };
        const { settings } = response;
        const migratedPrefs = migrateNavPreferences(settings.navPreferences as NavPreference[]);
        setNavPreferences(migratedPrefs);
      } catch (error) {
        console.error("Failed to load navigation preferences:", error);
        // Use defaults on error
        setNavPreferences(migrateNavPreferences([]));
      }
    };

    loadNavPreferences();
  }, []);

  useGlobalNavigation();
  useScrollRestoration();

  return (
    <div
      className="layout-container min-h-screen"
      style={{
        // Used by main content margin on lg+; kept as CSS var so mobile stays flush
        ["--peek-sidebar-offset" as any]: isSidebarExpanded ? "15rem" : "4rem",
      }}
    >
      {/* Sidebar navigation - hidden on mobile, visible lg+ */}
      <Sidebar
        navPreferences={navPreferences as unknown as Parameters<typeof Sidebar>[0]["navPreferences"]}
        onExpandedChange={setIsSidebarExpanded}
      />

      {/* Top bar - mobile only (logo, hamburger menu) */}
      <TopBar navPreferences={navPreferences} />

      {/* Main content area - full width after sidebar, Plex-style */}
      <main
        className="ml-0 lg:ml-[var(--peek-sidebar-offset)] pt-16 lg:pt-0 transition-[margin-left] duration-100"
      >
        {children}
      </main>
    </div>
  );
};

export default GlobalLayout;
