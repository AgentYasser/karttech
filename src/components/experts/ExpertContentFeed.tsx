import { Lock, BookOpen, Clock, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

interface ExpertContent {
    id: string;
    title: string;
    summary: string;
    author: {
        name: string;
        avatarUrl?: string;
        title: string;
    };
    bookTitle?: string;
    readTime: string;
    isPremium: boolean;
    publishedAt: string;
}

// Mock data
const MOCK_CONTENT: ExpertContent[] = [
    {
        id: '1',
        title: 'The Hidden Feminist Subtext in Pride and Prejudice',
        summary: 'Beyond the romance, Austen weaves a scathing critique of inheritance laws and female financial dependence. Let\'s analyze the letters...',
        author: {
            name: 'Dr. Eleanor Vance',
            title: 'Professor of Victorian Literature',
            avatarUrl: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=400&h=400&fit=crop',
        },
        bookTitle: 'Pride and Prejudice',
        readTime: '8 min read',
        isPremium: true,
        publishedAt: '2 days ago',
    },
    {
        id: '2',
        title: 'Why We Need "The Fifth Season" Now More Than Ever',
        summary: 'N.K. Jemisin\'s masterpiece isn\'t just about geology—it\'s a manual for surviving systemic collapse. A deep dive into the Orogeny metaphor.',
        author: {
            name: 'Sarah Chen',
            title: 'Sci-Fi & Fantasy Critic',
            avatarUrl: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=400&h=400&fit=crop',
        },
        bookTitle: 'The Fifth Season',
        readTime: '12 min read',
        isPremium: false,
        publishedAt: '5 days ago',
    },
    {
        id: '3',
        title: 'Decoding the "Green Light" in Gatsby',
        summary: 'It\'s not just envy. It\'s not just money. The green light represents the unbridgeable gap between the past we romanticize and the future we can\'t reach.',
        author: {
            name: 'James Baldwin II',
            title: 'Award-Winning Essayist',
            avatarUrl: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&h=400&fit=crop',
        },
        bookTitle: 'The Great Gatsby',
        readTime: '6 min read',
        isPremium: true,
        publishedAt: '1 week ago',
    },
];

export function ExpertContentFeed() {
    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <h2 className="text-2xl font-bold font-reading">Expert Insights & Deep Dives</h2>
                <Button variant="ghost" className="text-primary">View All <ChevronRight className="w-4 h-4 ml-1" /></Button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {MOCK_CONTENT.map((item) => (
                    <Card key={item.id} className="flex flex-col h-full hover:shadow-md transition-shadow">
                        <CardHeader className="p-0">
                            <div className="h-2 bg-gradient-to-r from-primary/40 to-primary/10" />
                        </CardHeader>
                        <CardContent className="flex-1 p-6 space-y-4">
                            <div className="flex items-center justify-between">
                                <Badge variant="secondary" className="text-xs font-normal">
                                    {item.bookTitle || 'Literary Analysis'}
                                </Badge>
                                {item.isPremium && (
                                    <div className="flex items-center text-xs font-medium text-amber-600 bg-amber-50 px-2 py-1 rounded-full">
                                        <Lock className="w-3 h-3 mr-1" />
                                        Premium
                                    </div>
                                )}
                            </div>

                            <div>
                                <h3 className="text-lg font-bold mb-2 line-clamp-2 group-hover:text-primary transition-colors">
                                    {item.title}
                                </h3>
                                <p className="text-sm text-muted-foreground line-clamp-3">
                                    {item.summary}
                                </p>
                            </div>

                            <div className="flex items-center gap-2 pt-2">
                                <Avatar className="w-8 h-8">
                                    <AvatarImage src={item.author.avatarUrl} />
                                    <AvatarFallback>{item.author.name[0]}</AvatarFallback>
                                </Avatar>
                                <div className="text-xs">
                                    <p className="font-medium text-foreground">{item.author.name}</p>
                                    <p className="text-muted-foreground">{item.author.title}</p>
                                </div>
                            </div>
                        </CardContent>
                        <CardFooter className="p-6 pt-0 flex items-center justify-between text-xs text-muted-foreground border-t bg-muted/10 mt-auto">
                            <div className="flex items-center gap-4 mt-3 w-full justify-between">
                                <span className="flex items-center gap-1">
                                    <Clock className="w-3 h-3" />
                                    {item.readTime}
                                </span>
                                <span>{item.publishedAt}</span>
                            </div>
                        </CardFooter>
                    </Card>
                ))}
            </div>
        </div>
    );
}
