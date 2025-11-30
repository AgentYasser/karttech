import { useEffect } from "react";
import { MainLayout } from "@/components/layout/MainLayout";
import { ExternalLink, Calendar, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";

const ExpertSessions = () => {
  // This page serves as a redirect/info page for expert sessions
  // In the future, this could redirect to a booking platform

  const handleRedirect = () => {
    // Placeholder - would redirect to a booking platform like Calendly
    window.open("https://calendly.com", "_blank");
  };

  return (
    <MainLayout>
      <div className="px-4 py-6 max-w-4xl mx-auto">
        <div className="text-center py-12">
          <div className="w-20 h-20 rounded-full bg-primary/20 flex items-center justify-center mx-auto mb-6">
            <Sparkles className="w-10 h-10 text-primary" />
          </div>

          <h1 className="font-reading text-2xl font-semibold text-card-foreground mb-3">
            Expert Sessions
          </h1>
          <p className="text-muted-foreground max-w-md mx-auto mb-8">
            Connect with literary experts, authors, and scholars for exclusive 
            one-on-one or group sessions. Discuss your favorite books, get 
            writing advice, or dive deep into literary analysis.
          </p>

          <div className="bg-card rounded-xl p-6 border border-border shadow-soft max-w-md mx-auto mb-8">
            <h2 className="font-medium text-card-foreground mb-4">Coming Soon!</h2>
            <ul className="text-left space-y-3 text-sm text-muted-foreground">
              <li className="flex items-start gap-2">
                <Calendar className="w-4 h-4 mt-0.5 text-primary shrink-0" />
                Schedule live sessions with literary experts
              </li>
              <li className="flex items-start gap-2">
                <Calendar className="w-4 h-4 mt-0.5 text-primary shrink-0" />
                Use your points to book exclusive sessions
              </li>
              <li className="flex items-start gap-2">
                <Calendar className="w-4 h-4 mt-0.5 text-primary shrink-0" />
                Join group discussions led by authors
              </li>
            </ul>
          </div>

          <Button onClick={handleRedirect} className="gap-2">
            <ExternalLink className="w-4 h-4" />
            Notify Me When Available
          </Button>
        </div>
      </div>
    </MainLayout>
  );
};

export default ExpertSessions;
