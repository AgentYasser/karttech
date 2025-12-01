// Brain-shaped SVG progress indicator component
import { cn } from "@/lib/utils";

interface BrainProgressProps {
    progress: number; // 0-100 percentage
    className?: string;
    size?: number; // Width/height in pixels
}

export function BrainProgress({ progress, className, size = 120 }: BrainProgressProps) {
    // Clamp progress between 0 and 100
    const clampedProgress = Math.max(0, Math.min(100, progress));

    // Calculate fill color based on progress
    const getFillColor = (prog: number) => {
        if (prog < 25) return "hsl(220, 13%, 75%)"; // Light gray
        if (prog < 50) return "hsl(221, 83%, 73%)"; // Light blue
        if (prog < 75) return "hsl(262, 83%, 58%)"; // Purple
        return "hsl(142, 71%, 45%)"; // Green
    };

    return (
        <div className={cn("relative inline-flex items-center justify-center", className)}>
            <svg
                width={size}
                height={size}
                viewBox="0 0 100 100"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
            >
                {/* Simplified brain shape paths */}
                <defs>
                    <linearGradient id="brainGradient" x1="0%" y1="0%" x2="0%" y2="100%">
                        <stop offset="0%" stopColor={getFillColor(clampedProgress)} stopOpacity="0.2" />
                        <stop offset={`${clampedProgress}%`} stopColor={getFillColor(clampedProgress)} stopOpacity="0.8" />
                        <stop offset={`${clampedProgress}%`} stopColor="hsl(220, 13%, 91%)" stopOpacity="0.1" />
                        <stop offset="100%" stopColor="hsl(220, 13%, 91%)" stopOpacity="0.1" />
                    </linearGradient>

                    <clipPath id="brainClip">
                        {/* Simple brain outline - two connected hemispheres */}
                        <path d="M 20,30 Q 15,15 30,15 Q 40,10 45,20 Q 48,15 50,15 Q 52,15 55,20 Q 60,10 70,15 Q 85,15 80,30 Q 85,40 82,50 Q 88,60 80,70 Q 75,80 65,78 Q 60,85 50,85 Q 40,85 35,78 Q 25,80 20,70 Q 12,60 18,50 Q 15,40 20,30 Z" />
                    </clipPath>
                </defs>

                {/* Background brain outline */}
                <path
                    d="M 20,30 Q 15,15 30,15 Q 40,10 45,20 Q 48,15 50,15 Q 52,15 55,20 Q 60,10 70,15 Q 85,15 80,30 Q 85,40 82,50 Q 88,60 80,70 Q 75,80 65,78 Q 60,85 50,85 Q 40,85 35,78 Q 25,80 20,70 Q 12,60 18,50 Q 15,40 20,30 Z"
                    fill="hsl(220, 13%, 91%)"
                    stroke="hsl(220, 13%, 75%)"
                    strokeWidth="1.5"
                />

                {/* Filled progress brain */}
                <rect
                    x="0"
                    y={100 - clampedProgress}
                    width="100"
                    height={clampedProgress}
                    fill="url(#brainGradient)"
                    clipPath="url(#brainClip)"
                    className="transition-all duration-500 ease-out"
                />

                {/* Brain details/folds */}
                <g opacity="0.3" stroke="hsl(220, 13%, 50%)" strokeWidth="1" fill="none">
                    {/* Left hemisphere curves */}
                    <path d="M 25,35 Q 30,33 35,35" />
                    <path d="M 23,45 Q 30,42 37,45" />
                    <path d="M 25,55 Q 32,52 38,55" />
                    <path d="M 28,65 Q 35,62 40,65" />

                    {/* Right hemisphere curves */}
                    <path d="M 65,35 Q 70,33 75,35" />
                    <path d="M 63,45 Q 70,42 77,45" />
                    <path d="M 65,55 Q 72,52 78,55" />
                    <path d="M 62,65 Q 68,62 73,65" />

                    {/* Center connection */}
                    <path d="M 45,40 Q 50,38 55,40" />
                    <path d="M 45,50 Q 50,48 55,50" />
                </g>
            </svg>

            {/* Progress percentage text */}
            <div className="absolute inset-0 flex items-center justify-center">
                <span className="text-lg font-bold text-card-foreground">
                    {Math.round(clampedProgress)}%
                </span>
            </div>
        </div>
    );
}
