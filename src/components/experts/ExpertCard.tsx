import { Star, Clock, Award, BookOpen } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card";
import { cn } from "@/lib/utils";

export interface Expert {
    id: string;
    name: string;
    title: string;
    bio: string;
    avatarUrl?: string;
    expertiseAreas: string[];
    rating: number;
    reviewCount: number;
    hourlyRate: number; // in cents
    isVerified: boolean;
}

interface ExpertCardProps {
    expert: Expert;
    onBook: (expertId: string) => void;
    className?: string;
}

export function ExpertCard({ expert, onBook, className }: ExpertCardProps) {
    return (
        <Card className={cn("overflow-hidden hover:shadow-lg transition-all duration-300", className)}>
            <CardHeader className="p-0">
                <div className="h-24 bg-gradient-to-r from-primary/20 to-primary/5" />
                <div className="px-6 -mt-12 flex justify-between items-end">
                    <Avatar className="w-24 h-24 border-4 border-card shadow-sm">
                        <AvatarImage src={expert.avatarUrl} alt={expert.name} />
                        <AvatarFallback className="text-xl font-bold bg-primary/10 text-primary">
                            {expert.name.split(' ').map(n => n[0]).join('').slice(0, 2)}
                        </AvatarFallback>
                    </Avatar>
                    {expert.isVerified && (
                        <Badge variant="secondary" className="mb-4 gap-1 bg-blue-100 text-blue-700 hover:bg-blue-200">
                            <Award className="w-3 h-3" />
                            Verified Expert
                        </Badge>
                    )}
                </div>
            </CardHeader>

            <CardContent className="px-6 pt-4 pb-2 space-y-4">
                <div>
                    <h3 className="text-xl font-bold text-card-foreground flex items-center gap-2">
                        {expert.name}
                        <span className="flex items-center text-sm font-normal text-muted-foreground">
                            <Star className="w-4 h-4 text-yellow-500 fill-yellow-500 mr-1" />
                            {expert.rating} ({expert.reviewCount})
                        </span>
                    </h3>
                    <p className="text-sm font-medium text-primary">{expert.title}</p>
                </div>

                <p className="text-sm text-muted-foreground line-clamp-2">
                    {expert.bio}
                </p>

                <div className="flex flex-wrap gap-2">
                    {expert.expertiseAreas.map((area) => (
                        <Badge key={area} variant="outline" className="text-xs font-normal">
                            {area}
                        </Badge>
                    ))}
                </div>
            </CardContent>

            <CardFooter className="px-6 py-4 bg-muted/30 flex gap-3">
                <Button
                    variant="default"
                    className="flex-1 gap-2"
                    onClick={() => onBook(expert.id)}
                >
                    <Clock className="w-4 h-4" />
                    Book Session
                </Button>
                <Button variant="ghost" size="icon" title="View Content">
                    <BookOpen className="w-4 h-4" />
                </Button>
            </CardFooter>
        </Card>
    );
}
