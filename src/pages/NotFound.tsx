import { useEffect } from "react";
import { useLocation } from "react-router-dom";

const NotFound = () => {
  const location = useLocation();

  useEffect(() => {
    console.error(
      "404 Error: User attempted to access non-existent route:",
      location.pathname
    );
  }, [location.pathname]);

  return (
    <div className="flex min-h-screen items-center justify-center bg-muted">
      <div className="text-center">
        <h1 className="mb-4 font-bold text-4xl tracking-tight">404</h1>
        <p className="mb-4 text-muted-foreground text-xl">
          Oops! Page not found
        </p>
        <a
          className="inline-block rounded-full bg-foreground px-4 py-2 text-background text-sm transition-colors hover:bg-foreground/85"
          href="/"
        >
          Return to Home
        </a>
      </div>
    </div>
  );
};

export default NotFound;
