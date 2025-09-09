// This page is not used as the main app logic is in App.tsx
// Keeping as fallback

const Index = () => {
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
        <p className="text-lg text-muted-foreground max-w-md mx-auto">
          Transform your ideas into organized task boards with the power of AI
        </p>
        <div className="pt-4">
          <a 
            href="/app" 
            className="inline-flex items-center justify-center bg-gradient-primary text-primary-foreground hover:opacity-90 shadow-card transition-smooth font-semibold h-11 rounded-md px-8"
          >
            Get Started
          </a>
        </div>
      </div>
    </div>
  );
};

export default Index;
