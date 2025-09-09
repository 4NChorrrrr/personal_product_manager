import { useLocation } from "react-router-dom";
import { useEffect } from "react";

const NotFound = () => {
  const location = useLocation();

  useEffect(() => {
    console.error("404 Error: User attempted to access non-existent route:", location.pathname);
  }, [location.pathname]);

  return (
    <div className="flex min-h-screen items-center justify-center bg-background">
      <div className="text-center space-y-4">
        <div className="flex items-center justify-center space-x-2 mb-6">
          <div className="w-12 h-12 bg-gradient-primary rounded-full flex items-center justify-center">
            <div className="w-6 h-6 bg-white rounded-full" />
          </div>
          <h1 className="text-3xl font-bold bg-gradient-primary bg-clip-text text-transparent">
            AI Kanban MVP
          </h1>
        </div>
        <h2 className="text-6xl font-bold text-muted-foreground">404</h2>
        <p className="text-xl text-muted-foreground max-w-md mx-auto">
          Oops! The page you're looking for doesn't exist.
        </p>
        <div className="pt-4">
          <a 
            href="/" 
            className="inline-flex items-center justify-center bg-gradient-primary text-primary-foreground hover:opacity-90 shadow-card transition-smooth font-semibold h-11 rounded-md px-8"
          >
            Return to Home
          </a>
        </div>
      </div>
    </div>
  );
};

export default NotFound;
