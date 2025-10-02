// file: app/create-quest/page.tsx
'use client'
import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthState } from 'react-firebase-hooks/auth';
import { auth } from '@/lib/firebase';
import questService, { FlowCardState } from '@/lib/questService';
import { ImageUploader } from '@/components/quest/ImageUploader';
import { ArrowLeft, PlusCircle, Trash2 } from 'lucide-react';

// Local interface for form state (extends the service interface)
interface FlowCardFormState {
  id: string;
  type: string;
  title: string;
  description: string;
  imageFile: File | null;
}

const CreateQuestPage = () => {
  const [user] = useAuthState(auth);
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Form State
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [coverImageFile, setCoverImageFile] = useState<File | null>(null);
  const [flowCards, setFlowCards] = useState<FlowCardFormState[]>([
    { id: Date.now().toString(), type: 'journey', title: '', description: '', imageFile: null }
  ]);

  const handleFlowCardChange = (index: number, field: keyof FlowCardFormState, value: string | File | null) => {
    const newFlowCards = [...flowCards];
    if (field === 'imageFile') {
      newFlowCards[index].imageFile = value as File | null;
    } else {
      (newFlowCards[index] as any)[field] = value;
    }
    setFlowCards(newFlowCards);
  };

  const addFlowCard = () => {
    setFlowCards([...flowCards, { 
      id: Date.now().toString(), 
      type: 'journey', 
      title: '', 
      description: '', 
      imageFile: null 
    }]);
  };

  const removeFlowCard = (index: number) => {
    if (flowCards.length > 1) {
      setFlowCards(flowCards.filter((_, i) => i !== index));
    }
  };

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!user || !coverImageFile || !title) {
      alert('Please fill in a title and add a cover image.');
      return;
    }

    setIsSubmitting(true);
    try {
      const questData = { title, description, privacy: 'public', tags: [] };
      
      // Convert FlowCardFormState to FlowCardState (remove imageFile, keep only necessary data)
      const flowCardsData: FlowCardState[] = flowCards.map(card => ({
        id: card.id,
        type: card.type,
        content: {
          title: card.title,
          description: card.description
        }
      }));
      
      const result = await questService.createQuest(user.uid, questData, coverImageFile, flowCardsData);
      
      alert('Quest created successfully!');
      router.push(`/quest/${result.questId}`);
    } catch (error) {
      console.error("Failed to create quest:", error);
      alert('There was an error creating your quest. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-black text-white">
      <header className="sticky top-0 z-10 bg-black bg-opacity-80 backdrop-blur-sm p-4 flex items-center gap-4 border-b border-gray-800">
        <button onClick={() => router.back()} className="p-2">
          <ArrowLeft size={24} />
        </button>
        <h1 className="text-xl font-bold">Create a New Quest</h1>
      </header>

      <main className="p-4 pb-24">
        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label htmlFor="title" className="block text-sm font-medium text-gray-300 mb-2">Quest Title</label>
            <input
              type="text"
              id="title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g., A Weekend Trip to Coorg"
              className="w-full bg-gray-800 text-white px-4 py-3 rounded-lg border border-gray-700 focus:border-orange-500 focus:outline-none"
              required
            />
          </div>

          <div>
            <label htmlFor="description" className="block text-sm font-medium text-gray-300 mb-2">Description</label>
            <textarea
              id="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="What is this quest about?"
              rows={3}
              className="w-full bg-gray-800 text-white px-4 py-3 rounded-lg border border-gray-700 focus:border-orange-500 focus:outline-none"
            />
          </div>

          <ImageUploader label="Cover Image" onFileSelect={setCoverImageFile} />

          <hr className="border-gray-700" />
          
          <div>
            <h2 className="text-lg font-bold mb-4">Journey Cards</h2>
            <div className="space-y-6">
              {flowCards.map((card, index) => (
                <div key={card.id} className="bg-gray-900 p-4 rounded-xl border border-gray-800">
                  <div className="flex justify-between items-center mb-4">
                    <p className="font-semibold">Card {index + 1}</p>
                    {flowCards.length > 1 && (
                      <button type="button" onClick={() => removeFlowCard(index)} className="p-1 text-gray-400 hover:text-red-500">
                        <Trash2 size={18} />
                      </button>
                    )}
                  </div>
                  <div className="space-y-4">
                    <input
                      type="text"
                      value={card.title}
                      onChange={(e) => handleFlowCardChange(index, 'title', e.target.value)}
                      placeholder="Card Title (e.g., Dubare Elephant Camp)"
                      className="w-full bg-gray-800 text-white px-4 py-3 rounded-lg border border-gray-700"
                    />
                    <textarea
                      value={card.description}
                      onChange={(e) => handleFlowCardChange(index, 'description', e.target.value)}
                      placeholder="Card Description"
                      rows={2}
                      className="w-full bg-gray-800 text-white px-4 py-3 rounded-lg border border-gray-700"
                    />
                    <ImageUploader
                      label="Card Image (Optional)"
                      onFileSelect={(file) => handleFlowCardChange(index, 'imageFile', file)}
                    />
                  </div>
                </div>
              ))}
            </div>
            <button
              type="button"
              onClick={addFlowCard}
              className="mt-6 flex items-center justify-center gap-2 w-full px-4 py-3 bg-gray-800 text-orange-400 rounded-lg border-2 border-dashed border-gray-700 hover:border-orange-500"
            >
              <PlusCircle size={20} />
              Add another card
            </button>
          </div>
          
          <div className="fixed bottom-0 left-0 right-0 p-4 bg-black border-t border-gray-800">
            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full px-6 py-4 bg-orange-500 text-white rounded-xl font-semibold hover:bg-orange-600 transition-all disabled:opacity-50"
            >
              {isSubmitting ? 'Creating Quest...' : 'Create Quest'}
            </button>
          </div>
        </form>
      </main>
    </div>
  );
};

export default CreateQuestPage;