import { useState, useCallback, useEffect, useRef } from 'react';

export interface PlaceSuggestion {
    placePrediction: {
        placeId: string;
        text: {
            text: string;
        };
        structuredFormat: {
            mainText: {
                text: string;
            };
            secondaryText: {
                text: string;
            };
        };
    };
}

interface UsePlacesAutocompleteProps {
    debounceMs?: number;
}

export const usePlacesAutocomplete = ({ debounceMs = 300 }: UsePlacesAutocompleteProps = {}) => {
    const [suggestions, setSuggestions] = useState<PlaceSuggestion[]>([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    // Keep track of the latest request to avoid race conditions
    const abortControllerRef = useRef<AbortController | null>(null);

    const fetchSuggestions = useCallback(async (input: string) => {
        if (!input.trim() || input.length < 3) {
            setSuggestions([]);
            return;
        }

        // Cancel previous request
        if (abortControllerRef.current) {
            abortControllerRef.current.abort();
        }
        abortControllerRef.current = new AbortController();

        setLoading(true);
        setError(null);

        try {
            const response = await fetch('/api/places-autocomplete', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ input }),
                signal: abortControllerRef.current.signal,
            });

            if (!response.ok) {
                throw new Error('Failed to fetch suggestions');
            }

            const data = await response.json();
            setSuggestions(data.suggestions || []);
        } catch (err) {
            if (err instanceof Error && err.name === 'AbortError') {
                // Ignore abort errors
                return;
            }
            console.error('Error fetching place suggestions:', err);
            setError('Failed to fetch suggestions');
            setSuggestions([]);
        } finally {
            setLoading(false);
        }
    }, []);

    const clearSuggestions = useCallback(() => {
        setSuggestions([]);
        setError(null);
        setLoading(false);
    }, []);

    return {
        suggestions,
        loading,
        error,
        fetchSuggestions,
        clearSuggestions,
    };
};