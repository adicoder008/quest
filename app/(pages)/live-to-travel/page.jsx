'use client'
import React, { useState, useEffect } from 'react';
import {
  MapPin,
  Sparkles,
  Camera,
  GraduationCap,
  ArrowRight,
  CheckCircle2,
  AlertCircle,
  X,
  Copy,
  Tent,
  Utensils,
  Star
} from 'lucide-react';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';
import { db } from '@/lib/firebase';

// --- Components ---

const Navbar = ({ onOpenModal, onScrollToForm }) => (
  <nav className="fixed top-0 left-0 right-0 z-50 flex items-center justify-between px-6 py-4 bg-slate-950/80 backdrop-blur-md border-b border-white/5 transition-all duration-300">
    <div className="flex items-center gap-2">
      <div className="w-12 h-6 flex items-center justify-center">
        <img src="/OQ_LOGO_MAIN.svg" alt="OnQuest Logo" className="w-[130px] h-[30px]" />
      </div>
    </div>

    <div className="hidden md:flex items-center gap-6">
      <a href="#how" className="text-sm font-medium text-slate-300 hover:text-white transition-colors">How it works</a>
      <a href="#rule" className="text-sm font-medium text-slate-300 hover:text-white transition-colors">The Rule</a>
      <button
        onClick={onOpenModal}
        className="text-sm font-medium text-slate-300 hover:text-white transition-colors"
      >
        See Sample
      </button>
      <button
        onClick={onScrollToForm}
        className="bg-white text-slate-950 px-4 py-2 rounded-full text-sm font-bold hover:bg-slate-200 transition-transform active:scale-95"
      >
        Apply Now
      </button>
    </div>

    {/* Mobile Action */}
    <div className="md:hidden">
      <button
        onClick={onScrollToForm}
        className="bg-[#ff6900] text-white px-4 py-1.5 rounded-full text-xs font-bold"
      >
        Apply
      </button>
    </div>
  </nav>
);

const Hero = ({ onScrollToForm, onOpenModal }) => (
  <section className="relative min-h-screen flex items-center justify-center overflow-hidden pt-20">
    {/* Background Image with Overlay */}
    <div className="absolute inset-0 z-0">
      <img
        src="/bunny_banaras.png"
        srcSet="/bunny_mobile_v2.png 768w, /bunny_banaras.png 1200w"
        sizes="(max-width: 768px) 768px, 1200px"
        alt="Banaras Ghats"
        className="w-full h-full object-cover object-top opacity-100"
      />

      <div className="absolute inset-0 bg-gradient-to-r from-slate-950/90 via-slate-950/50 to-transparent" />
      <div className="absolute inset-0 bg-slate-980/20 mix-blend-multiply" />
    </div>

    <div className="relative z-10 container mx-auto px-4 grid lg:grid-cols-2 gap-12 items-center">
      <div className="space-y-6 max-w-2xl">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#ff6900]/10 border border-[#ff6900]/20 text-[#ff6900] text-xs font-bold uppercase tracking-wider">
          <Sparkles size={12} />
          Limited Seats • College Students Only
        </div>

        <h1 className="text-4xl md:text-6xl lg:text-7xl font-extrabold tracking-tight text-white leading-[1.1]">
          Wanna be <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#ff6900] to-yellow-400">Bunny</span> from YJHD?
        </h1>

        <p className="text-lg md:text-xl text-slate-300 leading-relaxed max-w-lg">
          We're sending 10 student travellers to <strong>Banaras</strong>.
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

const FeatureCard = ({ icon: Icon, title, desc }) => (
  <div className="p-6 rounded-2xl bg-slate-900/50 border border-white/5 hover:border-[#ff6900]/30 transition-all hover:bg-slate-800/50 group">
    <div className="w-12 h-12 rounded-xl bg-slate-800 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform group-hover:bg-[#ff6900]/20">
      <Icon className="text-[#ff6900]" size={24} />
    </div>
    <h3 className="text-xl font-bold text-white mb-2">{title}</h3>
    <p className="text-slate-400 leading-relaxed text-sm">{desc}</p>
  </div>
);

const SampleQuestModal = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/80 backdrop-blur-sm" onClick={onClose} />
      <div className="relative bg-slate-900 border border-white/10 w-full max-w-4xl rounded-2xl overflow-hidden shadow-2xl flex flex-col md:flex-row max-h-[90vh]">
        <button onClick={onClose} className="absolute top-4 right-4 z-10 p-2 bg-black/50 rounded-full text-white hover:bg-[#ff6900] transition-colors">
          <X size={20} />
        </button>

        {/* Visual Side */}
        <div className="w-full md:w-5/12 bg-slate-800 relative hidden md:block">
          <img
            src="https://images.unsplash.com/photo-1505678261036-a3fcc5e884ee?auto=format&fit=crop&w=800&q=80"
            alt="Varanasi"
            className="w-full h-full object-cover opacity-80"
          />
          <div className="absolute bottom-0 inset-x-0 p-6 bg-gradient-to-t from-black to-transparent">
            <h3 className="text-white font-bold text-2xl">Banaras Dawn Walk</h3>
            <p className="text-slate-300 text-sm mt-1">Example Quest Cover</p>
          </div>
        </div>

        {/* Content Side */}
        <div className="flex-1 p-8 overflow-y-auto">
          <div className="mb-6">
            <h2 className="text-2xl font-bold text-white">How to structure your Quest</h2>
            <p className="text-slate-400 mt-2">To get selected, your Quest needs to be helpful, not just poetic. Use this structure:</p>
          </div>

          <div className="space-y-6">
            <div className="p-4 bg-slate-950 rounded-xl border border-dashed border-slate-700">
              <h4 className="text-[#ff6900] font-bold text-sm uppercase tracking-wide mb-2">Required Elements</h4>
              <ul className="space-y-3">
                <li className="flex items-start gap-3 text-slate-300 text-sm">
                  <Camera size={16} className="mt-1 text-emerald-400 shrink-0" />
                  <span><strong>5+ Photos:</strong> Mix of landscapes, food close-ups, and street shots.</span>
                </li>
                <li className="flex items-start gap-3 text-slate-300 text-sm">
                  <MapPin size={16} className="mt-1 text-emerald-400 shrink-0" />
                  <span><strong>The Route:</strong> Where did you start? Where did you end?</span>
                </li>
                <li className="flex items-start gap-3 text-slate-300 text-sm">
                  <Star size={16} className="mt-1 text-emerald-400 shrink-0" />
                  <span><strong>3 Verified Tips:</strong> "Eat at X", "Avoid Y", "Best time is Z".</span>
                </li>
              </ul>
            </div>

            <div>
              <h4 className="font-bold text-white mb-2">Copy this format (Description)</h4>
              <div className="bg-slate-950 p-4 rounded-lg font-mono text-xs text-slate-400 relative group">
                <p>Route: Assi Ghat → Dashashwamedh → Kashi Vishwanath<br />
                  Photos: 6 (ghat, puja, street breakfast)<br /><br />
                  Top 3 Tips:<br />
                  1. Best time: 5:30 AM for sunrise.<br />
                  2. Eat at 'Kashi Delights' (Cash only).<br />
                  3. Charge powerbank at Blue Lassi shop.</p>
                <button
                  onClick={() => {
                    navigator.clipboard.writeText(`Route: Assi Ghat -> Dashashwamedh -> Kashi Vishwanath\nPhotos: 6 (ghat, puja, street breakfast)\n\nTop 3 Tips:\n1. Best time: 5:30 AM for sunrise.\n2. Eat at 'Kashi Delights' (Cash only).\n3. Charge powerbank at Blue Lassi shop.`);
                    alert('Copied to clipboard!');
                  }}
                  className="absolute top-2 right-2 p-2 bg-slate-800 rounded hover:bg-slate-700 text-white opacity-0 group-hover:opacity-100 transition-opacity"
                >
                  <Copy size={14} />
                </button>
              </div>
            </div>

            <button onClick={onClose} className="w-full py-3 bg-white text-slate-900 font-bold rounded-xl hover:bg-slate-200 transition-colors">
              Got it, I'll make one
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

const ApplicationForm = () => {
  const [formData, setFormData] = useState({
    name: '',
    college: '',
    email: '',
    phone: '',
    reason: '',
    questLink: '',
    handle: '',
    consent: false
  });
  const [status, setStatus] = useState('idle'); // idle, submitting, success
  const [wordCount, setWordCount] = useState(0);

  const handleReasonChange = (e) => {
    const text = e.target.value;
    const words = text.trim().split(/\s+/).filter(Boolean).length;
    if (words <= 120) {
      setFormData({ ...formData, reason: text });
      setWordCount(words);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setStatus('submitting');

    try {
      await addDoc(collection(db, 'travel_applications'), {
        ...formData,
        createdAt: serverTimestamp(),
        source: 'live-to-travel' // To distinguish between the two pages
      });
      setStatus('success');
      // Save to localstorage for demo purposes (optional, but keeping it as backup)
      const existing = JSON.parse(localStorage.getItem('onquest_applications') || '[]');
      localStorage.setItem('onquest_applications', JSON.stringify([...existing, { ...formData, date: new Date().toISOString() }]));
    } catch (error) {
      console.error("Error submitting application: ", error);
      alert("Something went wrong. Please try again.");
      setStatus('idle');
    }
  };

  if (status === 'success') {
    return (
      <div className="bg-slate-900 border border-emerald-500/30 p-8 rounded-3xl text-center animate-in fade-in zoom-in duration-500">
        <div className="w-20 h-20 bg-emerald-500/20 rounded-full flex items-center justify-center mx-auto mb-6">
          <CheckCircle2 size={40} className="text-emerald-500" />
        </div>
        <h3 className="text-2xl font-bold text-white mb-2">Application Received!</h3>
        <p className="text-slate-400 mb-6">We've got your details. Shortlisting happens on rolling basis. Keep an eye on your WhatsApp.</p>
        <button
          onClick={() => setStatus('idle')}
          className="text-emerald-400 font-semibold hover:text-emerald-300"
        >
          Submit another response
        </button>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="grid md:grid-cols-2 gap-6">
        <div className="space-y-2">
          <label className="text-sm font-medium text-slate-300 ml-1">Full Name</label>
          <input
            required
            type="text"
            placeholder="Aditi Verma"
            className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 text-white focus:outline-none focus:border-[#ff6900] transition-colors placeholder:text-slate-600"
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
          />
        </div>
        <div className="space-y-2">
          <label className="text-sm font-medium text-slate-300 ml-1">College & Year</label>
          <input
            required
            type="text"
            placeholder="IIT Delhi, 3rd Year"
            className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 text-white focus:outline-none focus:border-[#ff6900] transition-colors placeholder:text-slate-600"
            value={formData.college}
            onChange={(e) => setFormData({ ...formData, college: e.target.value })}
          />
        </div>
      </div>

      <div className="grid md:grid-cols-2 gap-6">
        <div className="space-y-2">
          <label className="text-sm font-medium text-slate-300 ml-1">Email</label>
          <input
            required
            type="email"
            placeholder="aditi@iitd.ac.in"
            className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 text-white focus:outline-none focus:border-[#ff6900] transition-colors placeholder:text-slate-600"
            value={formData.email}
            onChange={(e) => setFormData({ ...formData, email: e.target.value })}
          />
          <p className="text-xs text-slate-500 ml-1">We verify student status via email extension.</p>
        </div>
        <div className="space-y-2">
          <label className="text-sm font-medium text-slate-300 ml-1">Phone (WhatsApp)</label>
          <input
            required
            type="tel"
            placeholder="+91 99999 XXXXX"
            className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 text-white focus:outline-none focus:border-[#ff6900] transition-colors placeholder:text-slate-600"
            value={formData.phone}
            onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
          />
        </div>
      </div>

      <div className="space-y-2">
        <label className="text-sm font-medium text-slate-300 ml-1">Your Pitch</label>
        <textarea
          required
          rows={3}
          placeholder="Why Banaras? Why you? Be honest, be bold."
          className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 text-white focus:outline-none focus:border-[#ff6900] transition-colors placeholder:text-slate-600 resize-none"
          value={formData.reason}
          onChange={handleReasonChange}
        />
        <div className="flex justify-end">
          <span className={`text-xs ${wordCount > 100 ? 'text-[#ff6900]' : 'text-slate-500'}`}>{wordCount}/120 words</span>
        </div>
      </div>

      <div className="p-4 bg-[#ff6900]/5 border border-[#ff6900]/20 rounded-xl space-y-4">
        <div className="flex items-center gap-2 mb-2">
          <Star className="text-[#ff6900]" size={18} fill="currentColor" />
          <h4 className="text-white font-semibold">The Golden Ticket</h4>
        </div>
        <div className="space-y-2">
          <label className="text-sm font-medium text-slate-300 ml-1">Quest Link (Required)</label>
          <input
            required
            type="url"
            placeholder="https://onquest.in/quest/..."
            className="w-full bg-slate-900 border border-slate-700 rounded-xl p-3 text-white focus:outline-none focus:border-[#ff6900] transition-colors placeholder:text-slate-600"
            value={formData.questLink}
            onChange={(e) => setFormData({ ...formData, questLink: e.target.value })}
          />
          <p className="text-xs text-[#ff6900]/80 ml-1">Must be a public link. No Quest = No Selection.</p>
        </div>
      </div>

      <div className="space-y-2">
        <label className="text-sm font-medium text-slate-300 ml-1">Social Handle (Optional)</label>
        <input
          type="text"
          placeholder="@instagram_handle"
          className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 text-white focus:outline-none focus:border-[#ff6900] transition-colors placeholder:text-slate-600"
          value={formData.handle}
          onChange={(e) => setFormData({ ...formData, handle: e.target.value })}
        />
      </div>

      <label className="flex items-start gap-3 p-3 rounded-lg hover:bg-white/5 cursor-pointer transition-colors">
        <input
          type="checkbox"
          required
          className="mt-1 w-4 h-4 rounded border-slate-600 bg-slate-800 text-[#ff6900] focus:ring-[#ff6900]"
          checked={formData.consent}
          onChange={(e) => setFormData({ ...formData, consent: e.target.checked })}
        />
        <span className="text-sm text-slate-400">I confirm I am a college student and the Quest submitted is my original work. I agree to receive updates via WhatsApp.</span>
      </label>

      <button
        disabled={status === 'submitting'}
        className="w-full bg-gradient-to-r from-[#ff6900] to-orange-500 hover:from-orange-500 hover:to-orange-400 text-white py-4 rounded-xl font-bold text-lg shadow-lg shadow-[#ff6900]/20 transition-all active:scale-[0.98] disabled:opacity-70 disabled:cursor-not-allowed flex items-center justify-center gap-2"
      >
        {status === 'submitting' ? (
          <>
            <span className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
            Sending...
          </>
        ) : (
          'Submit Application'
        )}
      </button>
    </form>
  );
};

// --- Main App Component ---

export default function App() {
  const [isModalOpen, setIsModalOpen] = useState(false);

  const scrollToForm = () => {
    const el = document.getElementById('apply-section');
    if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' });
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-50 font-sans selection:bg-[#ff6900]/30 selection:text-orange-100">
      <Navbar onOpenModal={() => setIsModalOpen(true)} onScrollToForm={scrollToForm} />

      <Hero onScrollToForm={scrollToForm} onOpenModal={() => setIsModalOpen(true)} />

      {/* Why Join Section */}
      <section id="how" className="py-24 px-6 relative">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-5xl font-bold mb-4">Why do this?</h2>
            <p className="text-slate-400 text-lg">We pay for the stay, you pay with your stories.</p>
          </div>

          <div className="grid md:grid-cols-3 gap-6">
            <FeatureCard
              icon={GraduationCap}
              title="Real Travel Cred"
              desc="Don't just be a tourist. Build a Quest that helps others navigate the real Banaras. Gain a following."
            />
            <FeatureCard
              icon={Star}
              title="Ambassador Status"
              desc="Top picks get featured across our socials. You become the face of OnQuest for your campus."
            />
            <FeatureCard
              icon={Utensils}
              title="Perks that Matter"
              desc="Free accommodation in curated hostels, local food walks, and a dedicated travel stipend."
            />
          </div>
        </div>
      </section>

      <section id="rule" className="py-12 px-6">
        <div className="max-w-6xl mx-auto">
          <div className="bg-gradient-to-b from-slate-900 to-slate-950 border border-[#ff6900]/30 rounded-3xl p-8 md:p-12 relative overflow-hidden text-center">
            <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-[#ff6900] to-transparent opacity-50"></div>

            <h3 className="text-2xl md:text-3xl font-bold text-white mb-6">
              The Single Requirement
            </h3>
            <p className="text-lg text-slate-300 mb-8 max-w-2xl mx-auto">
              You must publish a <span className="text-[#ff6900] font-semibold">Quest on OnQuest</span> about a recent trip (last 12 months). It should have photos, a route, and 3 real tips.
            </p>

            <div className="flex flex-wrap justify-center gap-4 text-sm font-medium text-slate-400">
              <span className="bg-slate-800/50 px-4 py-2 rounded-full border border-white/5 flex items-center gap-2">
                <CheckCircle2 size={16} className="text-emerald-500" /> Public Link
              </span>
              <span className="bg-slate-800/50 px-4 py-2 rounded-full border border-white/5 flex items-center gap-2">
                <CheckCircle2 size={16} className="text-emerald-500" /> 5+ Photos
              </span>
              <span className="bg-slate-800/50 px-4 py-2 rounded-full border border-white/5 flex items-center gap-2">
                <CheckCircle2 size={16} className="text-emerald-500" /> 3 Tips
              </span>
            </div>

            <button
              onClick={() => setIsModalOpen(true)}
              className="mt-8 text-[#ff6900] hover:text-[#ff6900]/80 underline underline-offset-4 text-sm font-medium"
            >
              See a valid example
            </button>
          </div>
        </div>
      </section>


      {/* Form Section */}
      <section id="apply-section" className="py-24 px-6 relative">
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-[#ff6900]/5 to-transparent pointer-events-none" />
        <div className="max-w-3xl mx-auto relative z-10">
          <div className="bg-slate-900/80 backdrop-blur-xl border border-white/10 rounded-[2rem] p-8 md:p-12 shadow-2xl">
            <div className="mb-10 text-center">
              <h2 className="text-3xl font-bold text-white mb-2">Apply to be a Star</h2>
              <p className="text-slate-400">Takes 3 minutes. Make sure your Quest link is ready.</p>
            </div>

            <ApplicationForm />
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-slate-950 border-t border-white/5 py-12 px-6">
        <div className="max-w-6xl mx-auto grid md:grid-cols-4 gap-8">
          <div className="col-span-2">
            <div className="flex items-center gap-2 mb-4">
              <div className="w-6 h-6 rounded bg-[#ff6900] flex items-center justify-center">
                <MapPin className="text-white w-3 h-3" />
              </div>
              <span className="font-bold text-white">OnQuest</span>
            </div>
            <p className="text-slate-500 text-sm max-w-sm">
              Helping students travel better. We verify every trip so you don't have to.
            </p>
          </div>

          <div>
            <h4 className="font-bold text-white mb-4">FAQ</h4>
            <ul className="space-y-2 text-sm text-slate-500">
              <li>Are tickets included? <span className="text-slate-700 block text-xs mt-0.5">Accommodation only. Travel is on you.</span></li>
              <li className="mt-2">Can I go with friends? <span className="text-slate-700 block text-xs mt-0.5">Yes, but apply individually.</span></li>
            </ul>
          </div>

          <div>
            <h4 className="font-bold text-white mb-4">Legal</h4>
            <p className="text-xs text-slate-600">
              © 2025 OnQuest. All rights reserved.<br />
              By applying you agree to our Terms & Privacy Policy.
            </p>
          </div>
        </div>
      </footer>

      <SampleQuestModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} />
    </div>
  );
}