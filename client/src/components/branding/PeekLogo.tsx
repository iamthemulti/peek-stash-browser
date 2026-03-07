import { useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "../../hooks/useAuth";
import { getLandingPage } from "../../constants/navigation";

export const PeekLogo = ({
  size = "default", // 'small', 'default', 'large'
  variant = "auto", // 'auto', 'active', 'inactive', 'text-only', 'icon-only'
}) => {
  const navigate = useNavigate();
  const location = useLocation();
  const { user } = useAuth();

  // Navigate to user's preferred landing page
  // Passes current path so random mode excludes the current page
  const handleClick = (e: React.MouseEvent) => {
    e.preventDefault();
    const destination = getLandingPage(user?.landingPagePreference, location.pathname);
    navigate(destination);
  };

  // Size configurations
  const sizeConfig = {
    small: {
      container: "gap-2",
      logoHeight: "h-6", // 24px
      logoWidth: "w-auto",
      wordmark: "text-xl",
    },
    default: {
      container: "gap-2",
      logoHeight: "h-8", // 32px
      logoWidth: "w-auto",
      wordmark: "text-3xl",
    },
    large: {
      container: "gap-3",
      logoHeight: "h-12", // 48px
      logoWidth: "w-auto",
      wordmark: "text-4xl",
    },
  };

  const config = (sizeConfig as Record<string, any>)[size];

  // Get logo image paths
  const getLogoPath = () => {
    const basePath = "/branding/logos";

    return `${basePath}/peek-logo.svg`;
  };

  const renderLogo = () => {
    if (variant === "text-only") {
      return null;
    }

    return (
      <img
        src={getLogoPath()}
        alt="Peek"
        className={`${config.logoHeight} ${config.logoWidth} object-contain`}
      />
    );
  };

  const renderWordmark = () => {
    if (variant === "icon-only") {
      return null;
    }

    if (variant === "text-only") {
      return (
        <span
          className={`${config.wordmark} font-brand`}
          style={{
            color: "var(--accent-primary)",
            fontFamily: "var(--font-brand)",
          }}
        >
          peek
        </span>
      );
    }

    // Default/auto: show wordmark
    return (
      <span
        className={`${config.wordmark} font-brand`}
        style={{
          color: "var(--accent-primary)",
          fontFamily: "var(--font-brand)",
        }}
      >
        peek
      </span>
    );
  };

  return (
    <a
      href="/"
      onClick={handleClick}
      className={`flex items-center ${config.container} hover:opacity-80 transition-opacity duration-200 cursor-pointer`}
    >
      {renderLogo()}
      {renderWordmark()}
    </a>
  );
};
