'use client'
import React, { useState, useEffect } from 'react';
import {
    MapPin, Sparkles, Camera, GraduationCap, ArrowRight,
    CheckCircle2, X, Copy, Tent, Utensils, Star,
    Flame, Zap, Send, Ticket
} from 'lucide-react';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';
import { db, auth } from '@/lib/firebase';
import { useAuthState } from 'react-firebase-hooks/auth';

// --- Global Texture Overlay ---
const GrainOverlay = () => (
    <div className="fixed inset-0 z-[100] pointer-events-none opacity-20 mix-blend-soft-light"
        style={{ backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.8' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)'/%3E%3C/svg%3E")` }}>
    </div>
);

const Navbar = ({ onOpenModal, onScrollToForm }) => (
    <nav className="fixed top-6 left-0 right-0 z-50 flex justify-center px-4 pointer-events-none">
        <div className="bg-[#0E0E12]/80 backdrop-blur-xl border border-[#FF8C00]/20 rounded-full px-6 py-3 flex items-center gap-8 shadow-2xl shadow-[#FF8C00]/10 pointer-events-auto">
            <div className="flex items-center gap-2">
                <span className="text-2xl font-black tracking-tighter text-[#FFFCE0] style={{textShadow: '0 2px 10px rgba(255,140,0,0.3)'}}">
                    <img src="/OQ_LOGO_MAIN.svg" alt="OnQuest Logo" className="h-10 w-28" />
                </span>
            </div>

            <div className="hidden md:flex items-center gap-6">
                <a href="#how" className="text-sm font-bold text-[#FFFCE0]/70 hover:text-[#FFFCE0] transition-colors uppercase tracking-wider">Vibe Check</a>
                <a href="#rule" className="text-sm font-bold text-[#FFFCE0]/70 hover:text-[#FFFCE0] transition-colors uppercase tracking-wider">The Rule</a>
                <button
                    onClick={onScrollToForm}
                    className="bg-[#FF8C00] text-[#0E0E12] px-6 py-2 rounded-full text-sm font-black uppercase tracking-wider hover:bg-[#FF9F33] transition-transform active:scale-95 shadow-[0_0_20px_-5px_#FF8C00]"
                >
                    Apply Now
                </button>
            </div>
        </div>
    </nav>
);

const Hero = ({ onScrollToForm, onOpenModal }) => (
    <section className="relative min-h-screen flex items-start md:items-center justify-center overflow-hidden pt-20">
        {/* Dynamic Background */}
        <div className="absolute inset-0 z-0">
            {/* Desktop Image */}
            <img
                src="/bunny_banaras.png"
                alt="Ranbir in Banaras Illustration"
                className="w-full h-full object-cover object-center scale-105 hidden md:block"
            />
            {/* Mobile Image - Cropped from bottom */}
            <img
                src="/bunny_banaras.png"
                alt="Ranbir in Banaras Illustration (Mobile)"
                className="w-full h-full object-cover object-top scale-105 block md:hidden"
            />

            {/* Mobile Gradient: Dark at top for text readability, transparent at bottom */}
            <div className="absolute inset-0 bg-gradient-to-b from-[#0E0E12] via-[#0E0E12]/60 to-transparent block md:hidden" />

            {/* Desktop Gradients */}
            <div className="absolute inset-0 bg-gradient-to-r from-slate-950 to-transparent hidden md:block" />
            <div className="absolute inset-0 bg-slate-980/20 mix-blend-multiply hidden md:block" />
        </div>

        <div className="relative z-10 w-full container mx-auto px-4 pt-8 md:pt-0 grid lg:grid-cols-2 gap-12 items-start md:items-center">
            <div className="space-y-6 max-w-2xl">
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#ff6900]/10 border border-[#ff6900]/20 text-[#ff6900] text-xs font-bold uppercase tracking-wider">
                    <Sparkles size={12} />
                    Limited Seats • College Students Only
                </div>

                <h1 className="text-4xl md:text-6xl lg:text-7xl font-extrabold tracking-tight text-white leading-[1.1]">
                    Wanna be <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#ff6900] to-yellow-400">Bunny</span> from YJHD?
                </h1>

                <p className="text-lg md:text-xl text-slate-300 leading-relaxed max-w-lg">
                    We're sending 10 student travellers to <strong>Banaras(VARANASI)</strong>.
                    Free accommodation, local eats, and a chance to be an OnQuest Ambassador.
                </p>

                <div className="flex flex-wrap gap-4 pt-4">
                    <button
                        onClick={onScrollToForm}
                        className="px-8 py-4 bg-[#ff6900] hover:bg-orange-600 text-white rounded-2xl font-bold text-lg shadow-xl shadow-[#ff6900]/20 transition-all hover:-translate-y-1 active:scale-95 flex items-center gap-2"
                    >
                        Apply
                        <ArrowRight size={20} />
                    </button>
                    <button
                        onClick={onOpenModal}
                        className="px-6 py-4 bg-white/5 hover:bg-white/10 border border-white/10 text-white rounded-2xl font-semibold backdrop-blur-sm transition-all"
                    >
                        See Sample Quest
                    </button>
                </div>

                <div className="flex items-center gap-6 pt-4 text-sm text-slate-400 font-medium">
                    <span className="flex items-center gap-2"><Tent size={16} className="text-[#ff6900]" /> 3 Days Stay</span>
                    <span className="flex items-center gap-2"><Utensils size={16} className="text-[#ff6900]" /> Curated Eats</span>
                    <span className="flex items-center gap-2"><Star size={16} className="text-[#ff6900]" /> Ambassador Status</span>
                </div>
            </div>

            {/* Hero Card / Preview */}
            {/* <div className="hidden lg:block relative">
            <div className="absolute -inset-1 bg-gradient-to-tr from-[#ff6900] to-yellow-500 rounded-3xl blur opacity-30 animate-pulse"></div>
            <div className="relative bg-slate-900/60 backdrop-blur-xl border border-white/10 p-6 rounded-3xl shadow-2xl">
              <div className="flex items-start justify-between mb-6">
                <div>
                  <h3 className="text-white font-bold text-xl">What's the catch?</h3>
                  <p className="text-slate-400 text-sm mt-1">There is no money involved. Just one rule.</p>
                </div>
                <div className="bg-[#ff6900]/20 p-2 rounded-lg">
                  <AlertCircle className="text-[#ff6900]" />
                </div>
              </div>
              
              <div className="space-y-4">
                <div className="flex items-center gap-4 bg-white/5 p-4 rounded-xl border border-white/5">
                  <div className="w-12 h-12 rounded-full bg-indigo-500 flex items-center justify-center text-white font-bold text-xl">1</div>
                  <div>
                    <h4 className="text-white font-semibold">Make a Quest</h4>
                    <p className="text-xs text-slate-400">Create a guide about your last trip on OnQuest.</p>
                  </div>
                </div>
                <div className="flex items-center gap-4 bg-white/5 p-4 rounded-xl border border-white/5">
                  <div className="w-12 h-12 rounded-full bg-[#ff6900] flex items-center justify-center text-white font-bold text-xl">2</div>
                  <div>
                    <h4 className="text-white font-semibold">Submit Link</h4>
                    <p className="text-xs text-slate-400">Paste the public link in the form below.</p>
                  </div>
                </div>
              </div>
    
              <div className="mt-6 pt-6 border-t border-white/10 text-center">
                <p className="text-slate-400 text-sm">Deadline: <span className="text-white font-bold">Applications closing soon</span></p>
              </div>
            </div>
          </div> */}
        </div>
    </section>
);

const BentoCard = ({ icon: Icon, title, desc, className, image }) => (
    <div className={`relative overflow-hidden rounded-3xl bg-[#1A1A24] border border-[#FF8C00]/10 p-8 group hover:border-[#FF8C00]/50 transition-all duration-500 hover:shadow-[0_0_30px_-10px_#FF8C00] ${className}`}>
        {image && (
            <img src={image} alt="bg" className="absolute inset-0 w-full h-full object-cover opacity-30 group-hover:opacity-50 transition-opacity mix-blend-luminosity" />
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-[#0E0E12] via-[#0E0E12]/80 to-transparent" />

        <div className="relative z-10 h-full flex flex-col justify-between">
            <div className="w-14 h-14 rounded-2xl bg-[#FF8C00]/10 backdrop-blur-md flex items-center justify-center mb-4 border border-[#FF8C00]/20 group-hover:scale-110 transition-transform group-hover:bg-[#FF8C00] group-hover:text-[#0E0E12]">
                <Icon className="text-[#FF8C00] group-hover:text-[#0E0E12] transition-colors" size={28} />
            </div>
            <div>
                <h3 className="text-2xl font-black text-[#FFFCE0] mb-2 leading-tight uppercase">{title}</h3>
                <p className="text-[#FFFCE0]/70 text-sm leading-relaxed font-medium">{desc}</p>
            </div>
        </div>
    </div>
);

const SampleQuestModal = ({ isOpen, onClose }) => {
    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            <div className="absolute inset-0 bg-[#0E0E12]/90 backdrop-blur-xl" onClick={onClose} />
            <div className="relative w-full max-w-md bg-[#0E0E12] border border-[#FF8C00]/20 rounded-[2.5rem] overflow-hidden shadow-2xl flex flex-col max-h-[85vh]">

                {/* Header */}
                <div className="p-6 border-b border-[#FF8C00]/10 flex justify-between items-center bg-[#1A1A24]">
                    <div>
                        <h3 className="text-[#FFFCE0] font-black text-xl uppercase">Quest Blueprint</h3>
                        <p className="text-xs text-[#FF8C00] font-bold uppercase tracking-wider">The winning formula</p>
                    </div>
                    <button onClick={onClose} className="p-2 bg-[#0E0E12] rounded-full text-[#FFFCE0] hover:bg-[#FF8C00] hover:text-[#0E0E12] transition-colors">
                        <X size={20} />
                    </button>
                </div>

                {/* Phone Screen Simulation */}
                <div className="flex-1 overflow-y-auto p-0 bg-[#0E0E12]">
                    <div className="relative h-52">
                        <img src="https://images.unsplash.com/photo-1561361513-2d000a50f0dc?auto=format&fit=crop&w=800&q=80" className="w-full h-full object-cover opacity-80" />
                        <div className="absolute inset-0 bg-gradient-to-t from-[#0E0E12] to-transparent" />
                        <div className="absolute bottom-4 left-4">
                            <span className="bg-[#FF8C00] text-[#0E0E12] text-[10px] font-black px-2 py-1 rounded uppercase">Example</span>
                            <h2 className="text-[#FFFCE0] font-black text-2xl mt-1 uppercase">Banaras Dawn Walk</h2>
                        </div>
                    </div>

                    <div className="p-6 space-y-6">
                        {/* Checklist */}
                        <div className="space-y-3">
                            <div className="flex items-center gap-3 p-4 rounded-2xl bg-[#1A1A24] border border-[#FF8C00]/10">
                                <Camera className="text-[#FF8C00]" size={24} />
                                <div className="text-sm text-[#FFFCE0]/70 font-medium"><span className="text-[#FFFCE0] font-black uppercase">5+ Vibe Photos</span> <br />No blurry aesthetic pls.</div>
                            </div>
                            <div className="flex items-center gap-3 p-4 rounded-2xl bg-[#1A1A24] border border-[#FF8C00]/10">
                                <MapPin className="text-[#FF8C00]" size={24} />
                                <div className="text-sm text-[#FFFCE0]/70 font-medium"><span className="text-[#FFFCE0] font-black uppercase">The Route</span> <br />Start Point → End Point</div>
                            </div>
                            <div className="flex items-center gap-3 p-4 rounded-2xl bg-[#1A1A24] border border-[#FF8C00]/10">
                                <Star className="text-[#FF8C00]" size={24} />
                                <div className="text-sm text-[#FFFCE0]/70 font-medium"><span className="text-[#FFFCE0] font-black uppercase">3 Real Tips</span> <br />"Don't get scammed at X"</div>
                            </div>
                        </div>

                        {/* Copyable Content */}
                        <div className="bg-[#1A1A24] p-4 rounded-xl border-2 border-dashed border-[#FF8C00]/30 relative group">
                            <h4 className="text-[10px] font-bold text-[#FF8C00] uppercase mb-2">Description Template</h4>
                            <p className="text-xs font-mono text-[#FFFCE0]/80">
                                Route: Assi Ghat - Dashashwamedh<br />
                                Top 3 Tips:<br />
                                1. Best lassi at Blue Lassi Shop.<br />
                                2. Go at 5 AM for sunrise.<br />
                                3. Bargain 50% on boat rides.
                            </p>
                            <button
                                onClick={() => navigator.clipboard.writeText("Template copied")}
                                className="absolute top-3 right-3 p-1.5 bg-[#FF8C00] rounded-md text-[#0E0E12] opacity-0 group-hover:opacity-100 transition-opacity"
                            >
                                <Copy size={16} />
                            </button>
                        </div>
                    </div>
                </div>

                <div className="p-4 border-t border-[#FF8C00]/10 bg-[#1A1A24]">
                    <button onClick={onClose} className="w-full py-4 bg-[#FF8C00] text-[#0E0E12] font-black uppercase tracking-wider rounded-xl hover:scale-[1.02] transition-transform shadow-lg">
                        Got it, Let's Cook
                    </button>
                </div>
            </div>
        </div>
    );
}

const ApplicationForm = () => {
    const [user] = useAuthState(auth);
    const [formData, setFormData] = useState({ name: '', college: '', email: '', phone: '', reason: '', questLink: '', handle: '', consent: false });
    const [status, setStatus] = useState('idle');

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!user) {
            alert("Please log in to submit an application.");
            return;
        }

        setStatus('submitting');

        try {
            await addDoc(collection(db, 'travel_applications'), {
                ...formData,
                uid: user.uid,
                createdAt: serverTimestamp(),
                source: 'live2travel'
            });
            setStatus('success');
        } catch (error) {
            console.error("Error submitting application: ", error);
            alert("Something went wrong. Please try again.");
            setStatus('idle');
        }
    };

    if (status === 'success') {
        return (
            <div className="text-center py-12 animate-in fade-in zoom-in">
                <div className="w-24 h-24 bg-[#FF8C00]/10 rounded-full flex items-center justify-center mx-auto mb-6 border-2 border-[#FF8C00]">
                    <CheckCircle2 size={48} className="text-[#FF8C00]" />
                </div>
                <h3 className="text-3xl font-black text-[#FFFCE0] mb-2 uppercase italic">You're In Line!</h3>
                <p className="text-[#FFFCE0]/70 mb-8 font-medium">If your vibe matches ours, <br />you'll see a WhatsApp message soon.</p>
                <button onClick={() => setStatus('idle')} className="text-[#FF8C00] font-black uppercase tracking-wider hover:underline underline-offset-4">
                    Send another
                </button>
            </div>
        );
    }

    return (
        <form onSubmit={handleSubmit} className="space-y-5">
            <div className="grid md:grid-cols-2 gap-5">
                <div className="group">
                    <input
                        required type="text" placeholder="Full Name"
                        className="w-full bg-[#0E0E12] border-2 border-[#FF8C00]/10 rounded-xl p-4 text-[#FFFCE0] focus:outline-none focus:border-[#FF8C00] transition-all placeholder:text-[#FFFCE0]/40 font-bold"
                        value={formData.name} onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    />
                </div>
                <div>
                    <input
                        required type="text" placeholder="College (e.g., IIT BHU)"
                        className="w-full bg-[#0E0E12] border-2 border-[#FF8C00]/10 rounded-xl p-4 text-[#FFFCE0] focus:outline-none focus:border-[#FF8C00] transition-all placeholder:text-[#FFFCE0]/40 font-bold"
                        value={formData.college} onChange={(e) => setFormData({ ...formData, college: e.target.value })}
                    />
                </div>
            </div>

            <div className="grid md:grid-cols-2 gap-5">
                <input
                    required type="email" placeholder="College Email (.edu/.ac.in)"
                    className="w-full bg-[#0E0E12] border-2 border-[#FF8C00]/10 rounded-xl p-4 text-[#FFFCE0] focus:outline-none focus:border-[#FF8C00] transition-all placeholder:text-[#FFFCE0]/40 font-bold"
                    value={formData.email} onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                />
                <input
                    required type="tel" placeholder="WhatsApp Number"
                    className="w-full bg-[#0E0E12] border-2 border-[#FF8C00]/10 rounded-xl p-4 text-[#FFFCE0] focus:outline-none focus:border-[#FF8C00] transition-all placeholder:text-[#FFFCE0]/40 font-bold"
                    value={formData.phone} onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                />
            </div>

            <div>
                <input
                    type="text" placeholder="Instagram/Twitter Handle (Optional)"
                    className="w-full bg-[#0E0E12] border-2 border-[#FF8C00]/10 rounded-xl p-4 text-[#FFFCE0] focus:outline-none focus:border-[#FF8C00] transition-all placeholder:text-[#FFFCE0]/40 font-bold"
                    value={formData.handle} onChange={(e) => setFormData({ ...formData, handle: e.target.value })}
                />
            </div>

            <textarea
                required rows={3}
                placeholder="Why do you deserve this trip? Be bold. Don't be boring."
                className="w-full bg-[#0E0E12] border-2 border-[#FF8C00]/10 rounded-xl p-4 text-[#FFFCE0] focus:outline-none focus:border-[#FF8C00] transition-all placeholder:text-[#FFFCE0]/40 font-bold resize-none"
                value={formData.reason} onChange={(e) => setFormData({ ...formData, reason: e.target.value })}
            />


            {/* The Important Bit */}
            <div className="p-1 rounded-2xl bg-gradient-to-r from-[#FF8C00] via-red-500 to-purple-600 shadow-xl">
                <div className="bg-[#0E0E12] rounded-[12px] p-5">
                    <div className="flex items-center gap-2 mb-3">
                        <Send className="text-[#FF8C00]" size={20} />
                        <label className="text-sm font-black text-[#FFFCE0] uppercase tracking-wider">Your Quest Link (Crucial)</label>
                    </div>
                    <input
                        required type="url" placeholder="https://onquest.in/quest/..."
                        className="w-full bg-[#1A1A24] border-none rounded-xl p-4 text-[#FFFCE0] focus:ring-2 focus:ring-[#FF8C00] placeholder:text-[#FFFCE0]/40 font-bold"
                        value={formData.questLink} onChange={(e) => setFormData({ ...formData, questLink: e.target.value })}
                    />
                </div>
            </div>

            <div className="flex items-center gap-3 pt-2">
                <input
                    type="checkbox" required id="consent"
                    className="w-6 h-6 rounded border-[#FF8C00]/30 bg-[#0E0E12] text-[#FF8C00] focus:ring-[#FF8C00]"
                    checked={formData.consent} onChange={(e) => setFormData({ ...formData, consent: e.target.checked })}
                />
                <label htmlFor="consent" className="text-sm text-[#FFFCE0]/70 cursor-pointer select-none font-medium leading-tight">
                    I confirm I am a current college student and the Quest submitted is my original work.
                </label>
            </div>

            <button
                disabled={status === 'submitting'}
                className="w-full bg-[#FF8C00] hover:bg-[#FF9F33] text-[#0E0E12] py-6 rounded-xl font-black text-2xl uppercase tracking-widest shadow-[0_0_30px_-5px_#FF8C00] transition-all active:scale-[0.98] disabled:opacity-70 disabled:cursor-not-allowed mt-6"
            >
                {status === 'submitting' ? 'Sending...' : 'Send It 🚀'}
            </button>
        </form>
    );
};

export default function App() {
    const [isModalOpen, setIsModalOpen] = useState(false);

    const scrollToForm = () => {
        const el = document.getElementById('apply-section');
        if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' });
    };

    return (
        // Updated Background and Selection Colors to match theme
        <div className="min-h-screen bg-[#0E0E12] text-[#FFFCE0] font-sans selection:bg-[#FF8C00] selection:text-[#0E0E12] overflow-x-hidden">
            <GrainOverlay />
            <Navbar onOpenModal={() => setIsModalOpen(true)} onScrollToForm={scrollToForm} />
            <Hero onScrollToForm={scrollToForm} onOpenModal={() => setIsModalOpen(true)} />

            {/* Feature Bento Grid */}
            <section id="how" className="py-12 px-4 relative z-10">
                <div className="max-w-6xl mx-auto">
                    <div className="mb-16 flex flex-col md:flex-row justify-between items-start gap-6">
                        <div>
                            <h2 className="text-5xl md:text-7xl font-black uppercase tracking-tight leading-none text-[#FFFCE0] drop-shadow-lg">
                                Why The <br /><span className="text-[#FF8C00]">Hype?</span>
                            </h2>
                        </div>
                        <p className="text-[#FFFCE0]/70 max-w-sm text-left font-bold text-lg">We pay for the stay.<br />You pay with your stories.</p>
                    </div>

                    <div className="grid md:grid-cols-3 gap-6 auto-rows-[320px]">
                        <BentoCard
                            className="md:col-span-2"
                            title="Creator Economy 101"
                            desc="Don't just consume. Create a Quest that guides thousands. This is your portfolio piece."
                            icon={Camera}
                            // Use warm, high contrast images here
                            image="https://fourthwall.com/webflow-cdn/63ff7c6ecc83f9ec7ffe916b/67103d6dee895d41c23fb5e7_6656289fde213456d156929b_CreatorEconomy-ezgif.com-png-to-webp-converter.webp"
                        />
                        <BentoCard
                            className="md:col-span-1 bg-[#1A1A24]"
                            title="Travel Influencer"
                            desc="Top picks get featured. You become the face of OnQuest for your campus."
                            icon={Star}
                            image="https://images.unsplash.com/photo-1602081967340-63762a43a599?q=80&w=688&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D"
                        />
                        <BentoCard
                            className="md:col-span-1 bg-[#1A1A24]"
                            title="Free Stays"
                            desc="Curated stays. Fully covered."
                            icon={Utensils}
                            image="https://images.unsplash.com/photo-1700004060538-cb750e9a2992?q=80&w=1470&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D"
                        />
                        <BentoCard
                            className="md:col-span-2"
                            title="The Varanasi Vibe"
                            desc="Chaos and calm. Lassi and Aarti. Experience the duality of the oldest city."
                            icon={Flame}
                            // Use warm, high contrast images here
                            image="https://images.unsplash.com/photo-1612779774202-68e4305b849b?q=80&w=1470&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D"
                        />
                    </div>
                </div>
            </section>

            {/* The Rule Section - Vintage Ticket Style */}
            <section id="rule" className="py-24 px-4 relative z-10">
                <div className="max-w-5xl mx-auto">
                    {/* Changed background to a warm parchment color */}
                    <div className="relative bg-[#F2E8C9] text-[#0E0E12] rounded-[2.5rem] p-8 md:p-20 overflow-hidden transform rotate-1 hover:rotate-0 transition-transform duration-500 shadow-[0_20px_50px_-20px_#FF8C0030] border-4 border-[#0E0E12]">

                        {/* Decorative Ticket Elements */}
                        <div className="absolute left-0 top-1/2 -translate-x-1/2 w-12 h-12 bg-[#0E0E12] rounded-full" />
                        <div className="absolute right-0 top-1/2 translate-x-1/2 w-12 h-12 bg-[#0E0E12] rounded-full" />
                        <Ticket className="absolute top-8 right-8 text-[#0E0E12]/20 w-32 h-32 rotate-12" />

                        <div className="text-center relative z-10">
                            <h2 className="text-lg font-black tracking-[0.5em] text-[#0E0E12]/60 uppercase mb-6">Mission Brief</h2>
                            <h3 className="text-5xl md:text-8xl font-black uppercase leading-[0.85] mb-10">
                                One Rule <br /><span className="text-[#FF8C00]">To Rule Them All</span>
                            </h3>

                            <p className="text-2xl md:text-3xl font-black max-w-3xl mx-auto mb-12 leading-tight">
                                You must publish a valid <span className="underline decoration-wavy decoration-[#FF8C00] underline-offset-4">Quest on OnQuest</span>.
                                <br /><span className="text-lg font-bold text-[#0E0E12]/70 mt-4 block font-mono">Photos + Route + 3 Real Tips. No generic AI stuff.</span>
                            </p>

                            <button
                                onClick={() => setIsModalOpen(true)}
                                className="inline-flex items-center gap-3 px-8 py-4 bg-[#0E0E12] text-[#FFFCE0] font-black uppercase tracking-wider rounded-full hover:bg-[#FF8C00] hover:text-[#0E0E12] transition-all shadow-xl"
                            >
                                See a winning example <ArrowRight size={20} />
                            </button>
                        </div>

                        {/* Aged Paper Texture Pattern */}
                        <div className="absolute inset-0 opacity-10 pointer-events-none"
                            style={{ backgroundImage: 'url("https://www.transparenttextures.com/patterns/aged-paper.png")' }}>
                        </div>
                    </div>
                </div>
            </section>

            {/* Form Section */}
            <section id="apply-section" className="py-32 px-4 relative z-10">
                {/* Warmer glow in background */}
                <div className="absolute inset-0 bg-gradient-to-b from-transparent via-[#FF8C00]/20 to-transparent pointer-events-none mix-blend-screen" />

                <div className="max-w-3xl mx-auto relative z-10">
                    <div className="bg-[#0E0E12]/80 backdrop-blur-2xl border-2 border-[#FF8C00]/20 rounded-[3rem] p-8 md:p-16 shadow-2xl shadow-[#FF8C00]/20">
                        <div className="mb-16 text-center">
                            <div className="inline-block bg-[#FF8C00] text-[#0E0E12] px-6 py-2 rounded-full text-sm font-black uppercase tracking-widest mb-6 shadow-lg">
                                Final Boss Level
                            </div>
                            <h2 className="text-5xl md:text-6xl font-black text-[#FFFCE0] mb-4 uppercase">Secure Your Spot</h2>
                            <p className="text-[#FFFCE0]/70 text-xl font-bold">Don't start unless your Quest link is ready.</p>
                        </div>

                        <ApplicationForm />
                    </div>
                </div>
            </section>
            {/* FAQ Section */}
            <section id="faq" className="py-16 px-4 relative z-10">
                <div className="max-w-3xl mx-auto">
                    <div className="bg-[#0E0E12]/80 backdrop-blur-2xl border-2 border-[#FF8C00]/20 rounded-[3rem] p-8 md:p-16 shadow-2xl shadow-[#FF8C00]/20">
                        <h4 className="font-black text-3xl text-[#FFFCE0] mb-8 uppercase text-center">FAQs</h4>
                        <ul className="space-y-6 text-[#FFFCE0]/70">
                            <li>
                                <span className="font-bold text-[#FFFCE0] text-lg">Are tickets included?</span>
                                <p className="text-sm mt-1">Accommodation only. Travel is on you.</p>
                            </li>
                            <li>
                                <span className="font-bold text-[#FFFCE0] text-lg">Can I go with friends?</span>
                                <p className="text-sm mt-1">Yes, but apply individually.</p>
                            </li>
                            <li>
                                <span className="font-bold text-[#FFFCE0] text-lg">What if I don't have a Quest link?</span>
                                <p className="text-sm mt-1">You must publish a valid Quest on OnQuest to be eligible. No exceptions.</p>
                            </li>
                            <li>
                                <span className="font-bold text-[#FFFCE0] text-lg">When will I know if I'm selected?</span>
                                <p className="text-sm mt-1">We'll reach out via WhatsApp within 7-10 days if your application is successful.</p>
                            </li>
                        </ul>
                    </div>
                </div>
            </section>

            <footer className="border-t border-[#FF8C00]/20 py-16 bg-[#0E0E12] text-center relative z-10">
                <div className="flex justify-center items-center gap-2 mb-4 opacity-50 hover:opacity-100 transition-opacity">
                    <img src="/OQ_LOGO_MAIN.svg" alt="OnQuest Logo" className="h-8 md:h-10" />
                </div>
                <p className="text-[#FFFCE0]/50 text-sm font-medium">© 2025 Project Banaras. Built for the real ones.</p>
            </footer>

            <SampleQuestModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} />
        </div>
    );
}