/**
 * Live Reading & Expert Analysis Page
 * CRITICAL: This is LIVE READING where experts read to users in real-time
 * NOT pre-recorded audiobooks
 */
import { useState, useEffect } from "react";
import { MainLayout } from "@/components/layout/MainLayout";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardFooter } from "@/components/ui/card";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import {
  Volume2,
  Calendar,
  Clock,
  Users,
  BookOpen,
  Star,
  Lock,
  ChevronRight,
  Sparkles,
} from "lucide-react";
import { cn } from "@/lib/utils";

// Mock data - will be replaced with real data
const MOCK_LIVE_SESSIONS = [
  {
    id: "1",
    bookTitle: "Pride and Prejudice",
    chapterNum: 3,
    chapterTitle: "Chapter 3: The Ball at Netherfield",
    expert: {
      name: "Dr. Eleanor Vance",
      avatar: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=400&h=400&fit=crop",
      title: "Victorian Literature Professor",
    },
    currentListeners: 127,
    startedAt: new Date(Date.now() - 15 * 60 * 1000), // 15 mins ago
    duration: 45,
  },
];

const MOCK_SCHEDULED_SESSIONS = [
  {
    id: "2",
    bookTitle: "The Great Gatsby",
    bookAuthor: "F. Scott Fitzgerald",
    chapterNum: 1,
    chapterTitle: "Chapter 1: In My Younger and More Vulnerable Years",
    expert: {
      name: "James Baldwin II",
      avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&h=400&fit=crop",
      title: "Award-Winning Essayist",
    },
    scheduledDate: new Date(Date.now() + 2 * 60 * 60 * 1000), // In 2 hours
    duration: 60,
    price: 0, // Chapter 1 is FREE
    spotsRemaining: 15,
    maxAttendees: 50,
  },
  {
    id: "3",
    bookTitle: "Hamlet",
    bookAuthor: "William Shakespeare",
    chapterNum: 2,
    chapterTitle: "Act II",
    expert: {
      name: "Marcus Thorne",
      avatar: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=400&h=400&fit=crop",
      title: "Shakespearean Scholar",
    },
    scheduledDate: new Date(Date.now() + 24 * 60 * 60 * 1000), // Tomorrow
    duration: 75,
    price: 2.99,
    spotsRemaining: 8,
    maxAttendees: 30,
  },
  {
    id: "4",
    bookTitle: "1984",
    bookAuthor: "George Orwell",
    chapterNum: 1,
    chapterTitle: "Chapter 1: It Was a Bright Cold Day in April",
    expert: {
      name: "Sarah Chen",
      avatar: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=400&h=400&fit=crop",
      title: "Literary Critic",
    },
    scheduledDate: new Date(Date.now() + 48 * 60 * 60 * 1000), // In 2 days
    duration: 50,
    price: 0, // Chapter 1 FREE
    spotsRemaining: 22,
    maxAttendees: 40,
  },
];

const EXPERTS = [
  {
    id: "1",
    name: "Dr. Eleanor Vance",
    title: "Victorian Literature Professor",
    avatar: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=400&h=400&fit=crop",
    rating: 4.9,
    reviewCount: 124,
    specialties: ["Victorian Era", "Gothic Fiction", "Jane Austen"],
    totalReadings: 48,
  },
  {
    id: "2",
    name: "James Baldwin II",
    title: "Award-Winning Essayist",
    avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&h=400&fit=crop",
    rating: 5.0,
    reviewCount: 89,
    specialties: ["Modernism", "American Literature"],
    totalReadings: 36,
  },
  {
    id: "3",
    name: "Sarah Chen",
    title: "Sci-Fi & Fantasy Critic",
    avatar: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=400&h=400&fit=crop",
    rating: 4.8,
    reviewCount: 215,
    specialties: ["Science Fiction", "Fantasy", "World Building"],
    totalReadings: 52,
  },
  {
    id: "4",
    name: "Marcus Thorne",
    title: "Shakespearean Scholar",
    avatar: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=400&h=400&fit=crop",
    rating: 4.9,
    reviewCount: 156,
    specialties: ["Shakespeare", "Drama"],
    totalReadings: 67,
  },
];

export default function LiveReading() {
  const [liveSessions] = useState(MOCK_LIVE_SESSIONS);
  const [scheduledSessions] = useState(MOCK_SCHEDULED_SESSIONS);

  const formatDate = (date: Date) => {
    const now = new Date();
    const diff = date.getTime() - now.getTime();
    const hours = Math.floor(diff / (1000 * 60 * 60));
    const days = Math.floor(hours / 24);

    if (days > 0) return `In ${days} day${days > 1 ? "s" : ""}`;
    if (hours > 0) return `In ${hours} hour${hours > 1 ? "s" : ""}`;
    return "Soon";
  };

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString("en-US", {
      hour: "numeric",
      minute: "2-digit",
      hour12: true,
    });
  };

  return (
    <MainLayout>
      <div className="min-h-screen bg-gradient-to-br from-amber-50 via-white to-orange-50">
        {/* HEADER - CRITICAL: First thing visible */}
        <div className="bg-gradient-to-r from-amber-600 to-orange-600 text-white py-8 px-4">
          <div className="max-w-6xl mx-auto">
            <div className="flex items-center justify-center space-x-3 mb-2">
              <Volume2 className="w-8 h-8" />
              <h1 className="text-3xl font-normal">Live Reading & Expert Analysis</h1>
            </div>
            <p className="text-center text-amber-50 text-lg">
              Join scheduled sessions where literary experts read to you live and provide deep insights
            </p>
            {liveSessions.length > 0 && (
              <div className="flex items-center justify-center space-x-2 mt-4">
                <span className="px-3 py-1 bg-red-500 rounded-full text-sm flex items-center space-x-2 animate-pulse">
                  <span className="w-2 h-2 bg-white rounded-full"></span>
                  <span>{liveSessions.length} Session{liveSessions.length > 1 ? "s" : ""} Live Now</span>
                </span>
              </div>
            )}
          </div>
        </div>

        {/* LIVE SESSIONS (if any active) */}
        {liveSessions.length > 0 && (
          <section className="max-w-6xl mx-auto px-4 py-8">
            <div className="bg-red-50 border-2 border-red-500 rounded-xl p-6 mb-8">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-2xl font-normal text-slate-800 flex items-center space-x-2">
                  <span className="relative flex h-3 w-3">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-3 w-3 bg-red-500"></span>
                  </span>
                  <span>Live Reading Sessions Now</span>
                </h2>
                <span className="text-sm text-red-700 font-medium">Join immediately</span>
              </div>

              <div className="grid md:grid-cols-2 gap-4">
                {liveSessions.map((session) => (
                  <Card key={session.id} className="border-red-300 bg-white hover:shadow-lg transition-shadow">
                    <CardHeader className="pb-3">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-1">
                            <span className="relative flex h-2 w-2">
                              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
                              <span className="relative inline-flex rounded-full h-2 w-2 bg-red-500"></span>
                            </span>
                            <Badge variant="destructive" className="text-xs">LIVE</Badge>
                          </div>
                          <h3 className="font-semibold text-lg">{session.bookTitle}</h3>
                          <p className="text-sm text-muted-foreground">{session.chapterTitle}</p>
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent className="pb-3">
                      <div className="flex items-center gap-3 mb-3">
                        <Avatar className="w-10 h-10">
                          <AvatarImage src={session.expert.avatar} />
                          <AvatarFallback>{session.expert.name[0]}</AvatarFallback>
                        </Avatar>
                        <div>
                          <p className="font-medium text-sm">{session.expert.name}</p>
                          <p className="text-xs text-muted-foreground">{session.expert.title}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-4 text-xs text-muted-foreground">
                        <span className="flex items-center gap-1">
                          <Users className="w-3.5 h-3.5" />
                          {session.currentListeners} listening
                        </span>
                        <span className="flex items-center gap-1">
                          <Clock className="w-3.5 h-3.5" />
                          {session.duration} min session
                        </span>
                      </div>
                    </CardContent>
                    <CardFooter>
                      <Button className="w-full bg-red-500 hover:bg-red-600">
                        Join Live Session
                      </Button>
                    </CardFooter>
                  </Card>
                ))}
              </div>
            </div>
          </section>
        )}

        {/* UPCOMING SCHEDULE */}
        <section className="max-w-6xl mx-auto px-4 py-8">
          <h2 className="text-2xl font-normal text-slate-800 mb-6">Upcoming Live Reading Sessions</h2>

          <div className="bg-amber-50 border border-amber-200 rounded-lg p-4 mb-6">
            <div className="flex items-start space-x-3">
              <Calendar className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" />
              <div className="text-sm text-amber-800">
                <p className="font-medium mb-2">How Live Reading Works</p>
                <ul className="space-y-1 list-disc list-inside">
                  <li>Book a scheduled session with your favorite expert</li>
                  <li>Join at the scheduled time (or watch recording later)</li>
                  <li>Expert reads the chapter live with commentary and analysis</li>
                  <li>Ask questions via chat during the session</li>
                  <li>
                    <strong>Chapter 1 FREE</strong> with subscription, <strong>$2.99</strong> per additional chapter
                  </li>
                </ul>
              </div>
            </div>
          </div>

          <div className="space-y-4">
            {scheduledSessions.map((session, index) => (
              <Card
                key={session.id}
                className="hover:shadow-md transition-all duration-300 animate-fade-up"
                style={{ animationDelay: `${index * 100}ms` }}
              >
                <CardContent className="p-6">
                  <div className="flex flex-col md:flex-row gap-6">
                    {/* Book Icon/Cover */}
                    <div className="w-20 h-28 bg-gradient-to-br from-amber-100 to-orange-100 rounded-lg flex items-center justify-center text-4xl shrink-0">
                      📚
                    </div>

                    {/* Session Details */}
                    <div className="flex-1 space-y-3">
                      <div>
                        <div className="flex items-start justify-between gap-2">
                          <div>
                            <h3 className="font-semibold text-lg">{session.bookTitle}</h3>
                            <p className="text-sm text-muted-foreground">{session.bookAuthor}</p>
                          </div>
                          {session.price === 0 ? (
                            <Badge className="bg-green-100 text-green-700 hover:bg-green-100">
                              FREE
                            </Badge>
                          ) : (
                            <Badge variant="secondary">${session.price.toFixed(2)}</Badge>
                          )}
                        </div>
                        <p className="text-sm font-medium text-amber-700 mt-1">{session.chapterTitle}</p>
                      </div>

                      <div className="flex items-center gap-3">
                        <Avatar className="w-10 h-10">
                          <AvatarImage src={session.expert.avatar} />
                          <AvatarFallback>{session.expert.name[0]}</AvatarFallback>
                        </Avatar>
                        <div>
                          <p className="font-medium text-sm">Read by: {session.expert.name}</p>
                          <p className="text-xs text-muted-foreground">{session.expert.title}</p>
                        </div>
                      </div>

                      <div className="flex flex-wrap items-center gap-4 text-sm text-muted-foreground">
                        <span className="flex items-center gap-1">
                          <Calendar className="w-4 h-4" />
                          {formatDate(session.scheduledDate)} at {formatTime(session.scheduledDate)}
                        </span>
                        <span className="flex items-center gap-1">
                          <Clock className="w-4 h-4" />
                          {session.duration} minutes
                        </span>
                        <span className="flex items-center gap-1">
                          <Users className="w-4 h-4" />
                          {session.spotsRemaining} / {session.maxAttendees} spots left
                        </span>
                      </div>
                    </div>

                    {/* Booking Button */}
                    <div className="flex items-center md:items-start">
                      <Button size="lg" className="bg-amber-600 hover:bg-amber-700">
                        Book Your Spot
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </section>

        {/* EXPERT GRID */}
        <section className="max-w-6xl mx-auto px-4 py-8">
          <h2 className="text-2xl font-normal text-slate-800 mb-6">Our Live Reading Experts</h2>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {EXPERTS.map((expert) => (
              <Card key={expert.id} className="hover:shadow-lg transition-shadow">
                <CardHeader className="pb-3">
                  <div className="flex flex-col items-center text-center">
                    <Avatar className="w-20 h-20 mb-3 border-2 border-amber-200">
                      <AvatarImage src={expert.avatar} />
                      <AvatarFallback className="bg-gradient-to-br from-amber-100 to-orange-100 text-amber-800 text-lg">
                        {expert.name
                          .split(" ")
                          .map((n) => n[0])
                          .join("")}
                      </AvatarFallback>
                    </Avatar>
                    <Badge className="bg-amber-100 text-amber-700 hover:bg-amber-100 mb-2">
                      Live Reading Expert
                    </Badge>
                    <h3 className="font-semibold">{expert.name}</h3>
                    <p className="text-xs text-muted-foreground">{expert.title}</p>
                  </div>
                </CardHeader>
                <CardContent className="pb-3">
                  <div className="flex items-center justify-center gap-1 text-sm mb-3">
                    <Star className="w-4 h-4 text-yellow-500 fill-yellow-500" />
                    <span className="font-medium">{expert.rating}</span>
                    <span className="text-muted-foreground">({expert.reviewCount})</span>
                  </div>
                  <div className="flex flex-wrap gap-1 justify-center mb-3">
                    {expert.specialties.slice(0, 3).map((specialty) => (
                      <Badge key={specialty} variant="outline" className="text-xs">
                        {specialty}
                      </Badge>
                    ))}
                  </div>
                  <p className="text-xs text-center text-muted-foreground">
                    {expert.totalReadings} live readings completed
                  </p>
                </CardContent>
                <CardFooter>
                  <Button variant="outline" className="w-full gap-2">
                    View Schedule
                    <ChevronRight className="w-4 h-4" />
                  </Button>
                </CardFooter>
              </Card>
            ))}
          </div>
        </section>

        {/* CTA SECTION */}
        <section className="max-w-6xl mx-auto px-4 py-12 mb-20">
          <div className="bg-gradient-to-r from-amber-600 to-orange-600 rounded-3xl p-8 md:p-12 text-center text-white">
            <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-white/20 mb-6">
              <Sparkles className="w-6 h-6" />
            </div>
            <h2 className="text-3xl font-bold mb-4">Are you a literary expert?</h2>
            <p className="text-lg text-amber-50 max-w-2xl mx-auto mb-8">
              Join our community of live reading experts. Share your passion, read classics aloud, and earn income
              while connecting with book lovers worldwide.
            </p>
            <Button size="lg" className="font-semibold bg-white text-amber-600 hover:bg-amber-50">
              Apply to Become a Reading Expert
            </Button>
          </div>
        </section>
      </div>
    </MainLayout>
  );
}

