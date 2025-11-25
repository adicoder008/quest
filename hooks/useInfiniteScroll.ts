import { useEffect, useRef } from 'react';

interface UseInfiniteScrollProps {
  onLoadMore: () => void;
  hasMore: boolean;
  loading: boolean;
}

export const useInfiniteScroll = ({
  onLoadMore,
  hasMore,
  loading
}: UseInfiniteScrollProps) => {
  const sentinelRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        const first = entries[0];
        if (first.isIntersecting && hasMore && !loading) {
          onLoadMore();
        }
      },
      {
        root: null, // viewport
        rootMargin: '100px', // load before reaching the bottom
        threshold: 0.1
      }
    );

    const currentSentinel = sentinelRef.current;

    if (currentSentinel) {
      observer.observe(currentSentinel);
    }

    return () => {
      if (currentSentinel) {
        observer.unobserve(currentSentinel);
      }
    };
  }, [onLoadMore, hasMore, loading]);

  return sentinelRef;
};