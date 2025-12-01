import { MainLayout } from "@/components/layout/MainLayout";
import { WelcomeCard } from "@/components/home/WelcomeCard";
import { CurrentReadingCard } from "@/components/home/CurrentReadingCard";
import { RecommendedBooks } from "@/components/home/RecommendedBooks";
import { TrendingDiscussions } from "@/components/home/TrendingDiscussions";
import { QuickActions } from "@/components/home/QuickActions";

import { CommunityStats } from "@/components/analytics/CommunityStats";

const Index = () => {
  return (
    <MainLayout>
      <div className="px-4 py-6 max-w-4xl mx-auto space-y-6">
        <WelcomeCard />
        <CommunityStats />
        <CurrentReadingCard />
        <RecommendedBooks />
        <TrendingDiscussions />
        <QuickActions />
      </div>
    </MainLayout>
  );
};

export default Index;
