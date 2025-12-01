// Hook for reading time tracking and points awarding
import { useEffect, useRef } from 'react';
import { useAwardPoints } from './usePoints';

const READING_TIME_INTERVAL = 5 * 60 * 1000; // 5 minutes in milliseconds
const POINTS_PER_INTERVAL = 5;

interface UseReadingTimeTrackerOptions {
    bookId?: string;
    isReading?: boolean;
    onPointsAwarded?: (points: number) => void;
}

/**
 * Hook to track reading time and award points every 5 minutes
 * Only tracks when user is actively on the reading page
 */
export function useReadingTimeTracker({
    bookId,
    isReading = true,
    onPointsAwarded,
}: UseReadingTimeTrackerOptions) {
    const awardPoints = useAwardPoints();
    const intervalRef = useRef<NodeJS.Timeout | null>(null);
    const startTimeRef = useRef<number>(Date.now());
    const lastAwardTimeRef = useRef<number>(Date.now());

    useEffect(() => {
        if (!isReading || !bookId) {
            // Stop tracking when not reading
            if (intervalRef.current) {
                clearInterval(intervalRef.current);
                intervalRef.current = null;
            }
            return;
        }

        // Reset start time when starting to read
        startTimeRef.current = Date.now();
        lastAwardTimeRef.current = Date.now();

        // Check every minute if we've reached the 5-minute threshold
        intervalRef.current = setInterval(() => {
            const now = Date.now();
            const timeSinceLastAward = now - lastAwardTimeRef.current;

            if (timeSinceLastAward >= READING_TIME_INTERVAL) {
                // Award points for 5 minutes of reading
                awardPoints.mutate(
                    {
                        source: 'reading_time',
                        customPoints: POINTS_PER_INTERVAL
                    },
                    {
                        onSuccess: () => {
                            onPointsAwarded?.(POINTS_PER_INTERVAL);
                            lastAwardTimeRef.current = now;
                        }
                    }
                );
            }
        }, 60 * 1000); // Check every minute

        return () => {
            if (intervalRef.current) {
                clearInterval(intervalRef.current);
            }
        };
    }, [isReading, bookId, awardPoints, onPointsAwarded]);

    return {
        isTracking: isReading && !!bookId,
        elapsedTime: isReading ? Date.now() - startTimeRef.current : 0,
    };
}
