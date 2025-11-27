import React, { useState, useEffect, useRef } from 'react';
import { MapPin, X, Loader2 } from 'lucide-react';
import { usePlacesAutocomplete, PlaceSuggestion } from '@/hooks/usePlacesAutocomplete';

interface PlacesAutocompleteProps {
    value: string;
    onChange: (value: string) => void;
    onSelect: (suggestion: PlaceSuggestion) => void;
    placeholder?: string;
    className?: string;
}

export const PlacesAutocomplete = ({
    value,
    onChange,
    onSelect,
    placeholder = "Search for a place...",
    className = ""
}: PlacesAutocompleteProps) => {
    const [inputValue, setInputValue] = useState(value);
    const [showSuggestions, setShowSuggestions] = useState(false);
    const { suggestions, loading, fetchSuggestions, clearSuggestions } = usePlacesAutocomplete();
    const containerRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        setInputValue(value);
    }, [value]);

    // Handle outside click to close suggestions
    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
                setShowSuggestions(false);
            }
        };

        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    // Debounce input changes
    useEffect(() => {
        const timer = setTimeout(() => {
            if (inputValue && inputValue !== value) { // Only fetch if input changed by user typing
                fetchSuggestions(inputValue);
            }
        }, 300);

        return () => clearTimeout(timer);
    }, [inputValue, fetchSuggestions, value]);

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const newValue = e.target.value;
        setInputValue(newValue);
        onChange(newValue);

        if (newValue.length >= 3) {
            setShowSuggestions(true);
            fetchSuggestions(newValue);
        } else {
            setShowSuggestions(false);
            clearSuggestions();
        }
    };

    const handleSuggestionClick = (suggestion: PlaceSuggestion) => {
        const mainText = suggestion.placePrediction.structuredFormat.mainText.text;
        setInputValue(mainText);
        onSelect(suggestion);
        setShowSuggestions(false);
        clearSuggestions();
    };

    const clearInput = () => {
        setInputValue('');
        onChange('');
        setShowSuggestions(false);
        clearSuggestions();
    };

    return (
        <div className="relative" ref={containerRef}>
            <div className="relative">
                <div className="absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none">
                    <MapPin size={16} className="text-orange-400" />
                </div>
                <input
                    type="text"
                    value={inputValue}
                    onChange={handleInputChange}
                    onFocus={() => {
                        if (inputValue.length >= 3 && suggestions.length > 0) {
                            setShowSuggestions(true);
                        }
                    }}
                    className={`w-full bg-gray-800 text-white pl-10 pr-10 py-3 rounded-lg border border-gray-700 focus:border-orange-500 focus:outline-none ${className}`}
                    placeholder={placeholder}
                />
                {inputValue && (
                    <button
                        onClick={clearInput}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-white"
                    >
                        <X size={16} />
                    </button>
                )}
            </div>

            {showSuggestions && (suggestions.length > 0 || loading) && (
                <div className="absolute z-50 w-full mt-1 bg-gray-800 border border-gray-700 rounded-lg shadow-xl max-h-60 overflow-y-auto">
                    {loading && (
                        <div className="p-4 text-center text-gray-400 flex items-center justify-center gap-2">
                            <Loader2 className="w-4 h-4 animate-spin" />
                            <span>Loading...</span>
                        </div>
                    )}
                    {!loading && suggestions.map((suggestion, index) => (
                        <button
                            key={suggestion.placePrediction.placeId || index}
                            onClick={() => handleSuggestionClick(suggestion)}
                            className="w-full text-left px-4 py-3 hover:bg-gray-700 transition-colors border-b border-gray-700 last:border-b-0 flex items-start gap-3"
                        >
                            <MapPin className="w-4 h-4 text-orange-400 flex-shrink-0 mt-1" />
                            <div>
                                <div className="text-white text-sm font-medium">
                                    {suggestion.placePrediction.structuredFormat.mainText.text}
                                </div>
                                <div className="text-gray-400 text-xs mt-0.5">
                                    {suggestion.placePrediction.structuredFormat.secondaryText.text}
                                </div>
                            </div>
                        </button>
                    ))}
                </div>
            )}
        </div>
    );
};
