// src/components/quest/FlowCards.jsx
import React, { useEffect, useRef } from 'react';
import { Calendar, MapPin, Clock, CheckCircle, Circle, Image as ImageIcon } from 'lucide-react';
import { formatDistanceToNow, format } from 'date-fns';
import ImageGallery from './ImageGallery';

const FlowCard = ({ card, index, isActive, onFocus, canEdit }) => {
  const cardRef = useRef(null);
  const [showGallery, setShowGallery] = React.useState(false);
  const [checkedItems, setCheckedItems] = React.useState(new Set());

  useEffect(() => {
    if (isActive && cardRef.current) {
      const observer = new IntersectionObserver(
        ([entry]) => {
          if (entry.isIntersecting) {
            onFocus(index);
          }
        },
        { threshold: 0.5 }
      );
      
      observer.observe(cardRef.current);
      return () => observer.disconnect();
    }
  }, [isActive, index, onFocus]);

  const handleChecklistToggle = (itemIndex) => {
    if (!canEdit) return;
    
    const newChecked = new Set(checkedItems);
    if (newChecked.has(itemIndex)) {
      newChecked.delete(itemIndex);
    } else {
      newChecked.add(itemIndex);
    }
    setCheckedItems(newChecked);
  };

  const formatDate = (dateString) => {
    if (!dateString) return null;
    try {
      const date = new Date(dateString);
      return format(date, 'MMM d, yyyy');
    } catch {
      return null;
    }
  };

  return (
    <>
      <div
        ref={cardRef}
        id={`flow-card-${index}`}
        className={`bg-white rounded-xl shadow-sm border-2 transition-all duration-300 overflow-hidden ${
          isActive ? 'border-blue-500 shadow-lg' : 'border-gray-200 hover:border-gray-300'
        }`}
      >
        {/* Card Header */}
        <div className="p-6 pb-4">
          <div className="flex items-start justify-between mb-4">
            <div className="flex-1">
              <h3 className="text-xl font-semibold text-gray-900 mb-2">
                {card.title || `Day ${index + 1}`}
              </h3>
              
              {/* Metadata */}
              <div className="flex flex-wrap items-center gap-4 text-sm text-gray-600">
                {card.date && (
                  <div className="flex items-center gap-1">
                    <Calendar className="w-4 h-4" />
                    <span>{formatDate(card.date)}</span>
                  </div>
                )}
                
                {card.location?.name && (
                  <div className="flex items-center gap-1">
                    <MapPin className="w-4 h-4" />
                    <span>{card.location.name}</span>
                  </div>
                )}
                
                {card.duration && (
                  <div className="flex items-center gap-1">
                    <Clock className="w-4 h-4" />
                    <span>{card.duration}</span>
                  </div>
                )}
              </div>
            </div>
            
            {/* Step Number */}
            <div className="flex-shrink-0 w-8 h-8 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center text-sm font-medium">
              {index + 1}
            </div>
          </div>
          
          {/* Description */}
          {card.description && (
            <div className="prose prose-sm max-w-none text-gray-700 mb-4">
              <p>{card.description}</p>
            </div>
          )}
        </div>
        
        {/* Media Gallery */}
        {card.media && card.media.length > 0 && (
          <div className="px-6 pb-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
              {card.media.slice(0, 3).map((media, mediaIndex) => (
                <div
                  key={mediaIndex}
                  className="relative group cursor-pointer overflow-hidden rounded-lg aspect-square"
                  onClick={() => setShowGallery(true)}
                >
                  {media.type === 'image' ? (
                    <img
                      src={media.url}
                      alt={media.alt || `Media ${mediaIndex + 1}`}
                      className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                    />
                  ) : (
                    <video
                      src={media.url}
                      className="w-full h-full object-cover"
                      muted
                      preload="metadata"
                    />
                  )}
                  
                  {/* Media count overlay for first image */}
                  {mediaIndex === 0 && card.media.length > 3 && (
                    <div className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center text-white font-medium">
                      <ImageIcon className="w-6 h-6 mr-2" />
                      +{card.media.length - 3} more
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}
        
        {/* Checklist */}
        {card.checklist && card.checklist.length > 0 && (
          <div className="px-6 pb-4">
            <h4 className="text-sm font-medium text-gray-900 mb-3">Things to do:</h4>
            <div className="space-y-2">
              {card.checklist.map((item, itemIndex) => (
                <div
                  key={itemIndex}
                  className={`flex items-center gap-3 p-2 rounded-lg transition-colors ${
                    canEdit ? 'hover:bg-gray-50 cursor-pointer' : ''
                  }`}
                  onClick={() => handleChecklistToggle(itemIndex)}
                >
                  {checkedItems.has(itemIndex) ? (
                    <CheckCircle className="w-5 h-5 text-green-500 flex-shrink-0" />
                  ) : (
                    <Circle className="w-5 h-5 text-gray-400 flex-shrink-0" />
                  )}
                  <span className={`text-sm ${
                    checkedItems.has(itemIndex) ? 'text-gray-500 line-through' : 'text-gray-700'
                  }`}>
                    {item.text || item}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}
        
        {/* Notes */}
        {card.notes && (
          <div className="px-6 pb-4">
            <div className="bg-yellow-50 border-l-4 border-yellow-400 p-3 rounded-r-lg">
              <h4 className="text-sm font-medium text-yellow-800 mb-1">Notes:</h4>
              <p className="text-sm text-yellow-700">{card.notes}</p>
            </div>
          </div>
        )}
        
        {/* Tags */}
        {card.tags && card.tags.length > 0 && (
          <div className="px-6 pb-6">
            <div className="flex flex-wrap gap-2">
              {card.tags.map((tag, tagIndex) => (
                <span
                  key={tagIndex}
                  className="px-2 py-1 bg-gray-100 text-gray-600 text-xs rounded-full hover:bg-gray-200 cursor-pointer transition-colors"
                >
                  #{tag}
                </span>
              ))}
            </div>
          </div>
        )}
      </div>
      
      {/* Image Gallery Modal */}
      {showGallery && card.media && (
        <ImageGallery
          media={card.media}
          isOpen={showGallery}
          onClose={() => setShowGallery(false)}
          title={card.title}
        />
      )}
    </>
  );
};

const FlowCards = ({ flowCards, activeIndex, onCardFocus, questId, canEdit }) => {
  if (!flowCards || flowCards.length === 0) {
    return (
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-12 text-center">
        <div className="text-gray-400 mb-4">
          <MapPin className="w-16 h-16 mx-auto" />
        </div>
        <h3 className="text-lg font-medium text-gray-900 mb-2">No journey cards yet</h3>
        <p className="text-gray-600">This quest doesn't have any journey cards to display.</p>
        {canEdit && (
          <button className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
            Add First Card
          </button>
        )}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Journey Timeline */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <h2 className="text-xl font-semibold text-gray-900 mb-4">Journey Timeline</h2>
        <div className="text-sm text-gray-600">
          {flowCards.length} stop{flowCards.length !== 1 ? 's' : ''} • 
          {flowCards.filter(card => card.location).length > 0 && 
            ` ${flowCards.filter(card => card.location).length} location${flowCards.filter(card => card.location).length !== 1 ? 's' : ''}`
          }
        </div>
      </div>
      
      {/* Flow Cards */}
      {flowCards.map((card, index) => (
        <FlowCard
          key={index}
          card={card}
          index={index}
          isActive={index === activeIndex}
          onFocus={onCardFocus}
          canEdit={canEdit}
        />
      ))}
    </div>
  );
};

export default FlowCards;