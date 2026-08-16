import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

const eventTypes = {
  esports: {
    label: '🎮 Esports Event',
    description: 'Gaming tournaments, LAN events, esports championships',
    subTypes: [
      { value: 'byoc', label: 'BYOC Tournament', desc: 'Players bring own equipment' },
      { value: 'standard_lan', label: 'Standard LAN Tournament', desc: 'Full equipment provided' },
      { value: 'hybrid', label: 'Hybrid Tournament', desc: 'Online qualifiers + LAN finals' },
      { value: 'arena_scale', label: 'Arena-Scale Spectator Event', desc: 'Major championship with audience' },
      { value: 'corporate_esports', label: 'Corporate Esports Event', desc: 'Brand-focused tournament' }
    ],
    gameOptions: ['PUBG Mobile', 'Free Fire', 'Valorant', 'CS2', 'FIFA', 'Tekken', 'Dota 2', 'LoL', 'Fortnite', 'Other']
  },
  corporate: {
    label: '🏢 Corporate Event',
    description: 'Conferences, AGMs, product launches, team off-sites',
    subTypes: [
      { value: 'conference', label: 'Corporate Conference', desc: 'Multi-speaker business conference' },
      { value: 'agm', label: 'Annual General Meeting', desc: 'Shareholder meeting with AV production' },
      { value: 'product_launch', label: 'Product Launch', desc: 'Brand reveal and demo event' },
      { value: 'team_offsite', label: 'Team Off-Site', desc: 'Company retreat and team building' }
    ],
    gameOptions: []
  },
  hybrid: {
    label: '🌐 Hybrid Event',
    description: 'In-person + virtual audience engagement',
    subTypes: [
      { value: 'hybrid_conference', label: 'Hybrid Conference', desc: 'In-person + virtual attendees' },
      { value: 'hybrid_summit', label: 'Hybrid Summit', desc: 'Multi-day hybrid event' },
      { value: 'hybrid_workshop', label: 'Hybrid Workshop', desc: 'Interactive training sessions' },
      { value: 'hybrid_townhall', label: 'Hybrid Townhall', desc: 'Company-wide broadcast' }
    ],
    gameOptions: []
  },
  expo: {
    label: '🏛️ Expo & Trade Show',
    description: 'B2B/B2C expos, industry trade shows, job fairs',
    subTypes: [
      { value: 'trade_show', label: 'Trade Show', desc: 'B2B industry exhibition' },
      { value: 'consumer_expo', label: 'Consumer Expo', desc: 'B2C public exhibition' },
      { value: 'job_fair', label: 'Job Fair', desc: 'Recruitment and career event' },
      { value: 'education_fair', label: 'Education Fair', desc: 'University and school showcase' }
    ],
    gameOptions: []
  },
  ai_service: {
    label: '🤖 AI & Automation Service',
    description: 'AI development, automation, and consulting',
    subTypes: [
      { value: 'ai_development', label: 'Custom AI Model Development', desc: 'ML, NLP, computer vision' },
      { value: 'ai_strategy', label: 'AI Strategy & Consulting', desc: 'Assessment and roadmap' },
      { value: 'ai_agents', label: 'AI Agents & Workers', desc: 'Support, lead generation, data processing' },
      { value: 'ai_automation', label: 'AI Business Automation', desc: 'RPA and workflow automation' }
    ],
    gameOptions: []
  }
};

const budgetRanges = [
  { value: 'under_500k', label: 'Under PKR 500,000' },
  { value: '500k_1m', label: 'PKR 500,000 – 1,000,000' },
  { value: '1m_2m', label: 'PKR 1,000,000 – 2,000,000' },
  { value: '2m_5m', label: 'PKR 2,000,000 – 5,000,000' },
  { value: '5m_10m', label: 'PKR 5,000,000 – 10,000,000' },
  { value: '10m_20m', label: 'PKR 10,000,000 – 20,000,000' },
  { value: '20m_50m', label: 'PKR 20,000,000 – 50,000,000' },
  { value: '50m_plus', label: 'PKR 50,000,000+' }
];

interface DeepQueryFormProps {
  isModal?: boolean;
  onSuccess?: (quoteId: string, quoteData: any) => void;
  onClose?: () => void;
  initialEventType?: string;
}

export function DeepQueryForm({ isModal = false, onSuccess, onClose, initialEventType }: DeepQueryFormProps) {
  const navigate = useNavigate();
  const [step, setStep] = useState(1);
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [quoteId, setQuoteId] = useState('');
  const [quoteData, setQuoteData] = useState<any>(null);

  const [formData, setFormData] = useState({
    eventType: initialEventType || 'esports',
    eventSubType: '',
    gameTitles: [] as string[],
    otherGameTitle: '',
    expectedParticipants: '',
    expectedAudience: '',
    duration: '',
    venueRequirement: 'dedicated_venue',
    venueCity: 'Lahore',
    internetRequirement: 'dedicated_fiber',
    powerRequirement: 'standard',
    equipmentRequirement: 'standard',
    budgetRange: '',
    prizePool: '',
    fullName: '',
    companyName: '',
    email: '',
    phone: '',
    city: '',
    preferredContact: 'email',
    additionalInfo: '',
  });

  const handleChange = (field: string, value: any) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleGameToggle = (game: string) => {
    setFormData((prev) => {
      const titles = prev.gameTitles.includes(game)
        ? prev.gameTitles.filter((g) => g !== game)
        : [...prev.gameTitles, game];
      return { ...prev, gameTitles: titles };
    });
  };

  const nextStep = () => {
    if (step < 5) setStep(step + 1);
    if (!isModal) {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  const prevStep = () => {
    if (step > 1) setStep(step - 1);
    if (!isModal) {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  const generateQuote = () => {
    const baseData = {
      esports: { min: 850000, max: 4250000 },
      corporate: { min: 150000, max: 2500000 },
      hybrid: { min: 200000, max: 3500000 },
      expo: { min: 250000, max: 4000000 },
      ai_service: { min: 150000, max: 4000000 }
    };

    const multiplier = {
      byoc: 1,
      standard_lan: 2,
      hybrid: 2.5,
      arena_scale: 5,
      corporate_esports: 3
    };

    const participants = {
      '1-50': 1,
      '51-200': 2,
      '201-500': 3.5,
      '501-1000': 5,
      '1000+': 8
    };

    const durationMultiplier = {
      '1-day': 1,
      '2-days': 1.8,
      '3-days': 2.5,
      '4-days': 3.2,
      '5-days': 4
    };

    const base = baseData[formData.eventType as keyof typeof baseData] || baseData.esports;
    const typeMult = multiplier[formData.eventSubType as keyof typeof multiplier] || 1;
    const participantMult = participants[formData.expectedParticipants as keyof typeof participants] || 1;
    const durationMult = durationMultiplier[formData.duration as keyof typeof durationMultiplier] || 1;

    const estimatedMin = base.min * typeMult * participantMult * durationMult;
    const estimatedMax = base.max * typeMult * participantMult * durationMult;

    const prize = parseInt(formData.prizePool) || 0;
    const totalMin = estimatedMin + prize;
    const totalMax = estimatedMax + prize;

    return {
      range: `${Math.round(totalMin / 1000) * 1000} – ${Math.round(totalMax / 1000) * 1000}`,
      breakdown: {
        venue: `${Math.round(totalMin * 0.15 / 1000) * 1000} – ${Math.round(totalMax * 0.15 / 1000) * 1000}`,
        equipment: `${Math.round(totalMin * 0.3 / 1000) * 1000} – ${Math.round(totalMax * 0.3 / 1000) * 1000}`,
        broadcast: `${Math.round(totalMin * 0.15 / 1000) * 1000} – ${Math.round(totalMax * 0.15 / 1000) * 1000}`,
        staff: `${Math.round(totalMin * 0.1 / 1000) * 1000} – ${Math.round(totalMax * 0.1 / 1000) * 1000}`,
        prizePool: prize > 0 ? `${prize}` : '0',
        marketing: `${Math.round(totalMin * 0.08 / 1000) * 1000} – ${Math.round(totalMax * 0.08 / 1000) * 1000}`,
        logistics: `${Math.round(totalMin * 0.1 / 1000) * 1000} – ${Math.round(totalMax * 0.1 / 1000) * 1000}`,
      },
      totalMin: Math.round(totalMin / 1000) * 1000,
      totalMax: Math.round(totalMax / 1000) * 1000,
    };
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setQuoteData(null);

    const generatedId = `QT-${Date.now()}`;
    setQuoteId(generatedId);

    try {
      const quote = generateQuote();
      setQuoteData(quote);

      const eventSubTypeLabel = eventTypes[formData.eventType as keyof typeof eventTypes]
        ?.subTypes.find(s => s.value === formData.eventSubType)?.label || formData.eventSubType;

      // Construct a unified nested + flat data payload
      const clientInfo = {
        fullName: formData.fullName,
        companyName: formData.companyName,
        email: formData.email,
        phone: formData.phone,
        city: formData.city,
        preferredContact: formData.preferredContact,
      };

      const eventInfo = {
        eventType: formData.eventType,
        eventSubType: formData.eventSubType,
        eventSubTypeLabel,
        gameTitles: formData.gameTitles,
        otherGameTitle: formData.otherGameTitle,
        expectedParticipants: formData.expectedParticipants,
        expectedAudience: formData.expectedAudience,
        duration: formData.duration,
      };

      const logistics = {
        venueRequirement: formData.venueRequirement,
        venueCity: formData.venueCity,
        internetRequirement: formData.internetRequirement,
        powerRequirement: formData.powerRequirement,
        equipmentRequirement: formData.equipmentRequirement,
      };

      const budget = {
        budgetRange: formData.budgetRange,
        prizePool: formData.prizePool,
        estimatedMin: quote.totalMin,
        estimatedMax: quote.totalMax,
        estimatedRange: quote.range,
        breakdown: quote.breakdown,
      };

      const submissionData = {
        quoteId: generatedId,
        status: 'new',
        // Nested properties (for standard query display)
        clientInfo,
        eventInfo,
        logistics,
        budget,
        additionalInfo: formData.additionalInfo,

        // Flat properties (for robust backward compatibility/search)
        fullName: formData.fullName,
        email: formData.email,
        phone: formData.phone,
        eventType: formData.eventType,
        eventSubType: formData.eventSubType,
        eventSubTypeLabel,
        gameTitles: formData.gameTitles,
        otherGameTitle: formData.otherGameTitle,
        expectedParticipants: formData.expectedParticipants,
        expectedAudience: formData.expectedAudience,
        duration: formData.duration,
        venueRequirement: formData.venueRequirement,
        venueCity: formData.venueCity,
        internetRequirement: formData.internetRequirement,
        powerRequirement: formData.powerRequirement,
        equipmentRequirement: formData.equipmentRequirement,
        budgetRange: formData.budgetRange,
        prizePool: formData.prizePool,
        estimatedMin: quote.totalMin,
        estimatedMax: quote.totalMax,
        estimatedRange: quote.range,
        breakdown: quote.breakdown,
        companyName: formData.companyName,
        city: formData.city,
        preferredContact: formData.preferredContact,
      };

      const response = await fetch('/api/event-quote', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(submissionData),
      });

      if (!response.ok) {
        throw new Error('Failed to submit quote');
      }

      setSubmitted(true);
      if (onSuccess) {
        onSuccess(generatedId, quote);
      }
    } catch (error) {
      console.error('Error submitting form:', error);
      alert('There was an error submitting your request. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  const isStepValid = () => {
    switch (step) {
      case 1:
        return formData.eventType && formData.eventSubType;
      case 2:
        return formData.expectedParticipants && formData.duration;
      case 3:
        return formData.venueCity;
      case 4:
        return formData.budgetRange;
      case 5:
        return formData.fullName && formData.email && formData.phone;
      default:
        return false;
    }
  };

  const ProgressIndicator = () => {
    const steps = [
      { number: 1, label: 'Event Type' },
      { number: 2, label: 'Details' },
      { number: 3, label: 'Logistics' },
      { number: 4, label: 'Budget' },
      { number: 5, label: 'Contact' }
    ];

    return (
      <div className="relative mb-6">
        <div className="flex items-center justify-between">
          {steps.map((s, idx) => (
            <div key={s.number} className="flex flex-col items-center flex-1 relative">
              <div className={`w-8 h-8 rounded-full flex items-center justify-center text-white font-bold text-xs z-10 transition ${
                step === s.number ? 'bg-[#00B4D8] ring-4 ring-[#00B4D8]/25' :
                step > s.number ? 'bg-green-500' :
                'bg-gray-200'
              }`}>
                {step > s.number ? '✓' : s.number}
              </div>
              <span className={`text-[9px] uppercase tracking-wider mt-1.5 text-center hidden sm:block font-black ${
                step === s.number ? 'text-[#00B4D8]' :
                step > s.number ? 'text-green-600' :
                'text-gray-400'
              }`}>
                {s.label}
              </span>
              {idx < steps.length - 1 && (
                <div className={`absolute top-4 left-1/2 w-full h-0.5 transition ${
                  step > s.number ? 'bg-green-500' :
                  step > idx + 1 ? 'bg-[#00B4D8]/50' :
                  'bg-gray-200'
                }`} />
              )}
            </div>
          ))}
        </div>
      </div>
    );
  };

  return (
    <div className="w-full">
      {submitted ? (
        <div className="text-center py-8 animate-in fade-in">
          <div className="text-5xl mb-4">🎉</div>
          <h2 className="text-2xl font-black text-[#1A2B4C] mb-2">Quote Request Submitted!</h2>
          <p className="text-gray-500 text-sm mt-1 max-w-md mx-auto mb-6">
            We've received your details and will get back to you with a highly customized proposal within 24 hours.
          </p>
          <div className="bg-gray-50 p-4 rounded-xl max-w-xs mx-auto mb-6 border border-gray-100">
            <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1">Your Reference Number</p>
            <p className="text-lg font-mono text-[#00B4D8] font-black">{quoteId}</p>
          </div>
          {quoteData && (
            <div className="bg-[#00B4D8]/5 border border-[#00B4D8]/20 rounded-xl p-4 max-w-sm mx-auto mb-6 text-left">
              <h4 className="font-bold text-[#1A2B4C] text-xs uppercase tracking-wider mb-2">Estimated Budget range</h4>
              <p className="text-lg font-black text-[#00B4D8]">PKR {quoteData.range}</p>
              <p className="text-[10px] text-gray-500 mt-1">Our consultant will reach out shortly to refine this estimate based on your custom requirements.</p>
            </div>
          )}
          <div className="flex gap-3 justify-center">
            {onClose && (
              <button
                onClick={onClose}
                className="bg-gray-100 text-gray-600 px-6 py-2.5 rounded-full font-bold text-xs uppercase tracking-widest hover:bg-gray-200 transition-all"
              >
                Close Window
              </button>
            )}
            {!isModal && (
              <button
                onClick={() => navigate('/')}
                className="bg-[#00B4D8] text-white px-6 py-2.5 rounded-full font-bold text-xs uppercase tracking-widest hover:bg-[#1A2B4C] transition-all"
              >
                Back to Homepage
              </button>
            )}
          </div>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="bg-gray-50/50 p-4 rounded-2xl border border-gray-100">
            <ProgressIndicator />
          </div>

          {step === 1 && (
            <div className="space-y-6 animate-in fade-in duration-300">
              <h3 className="text-lg font-black text-[#1A2B4C] mb-2">1. Select Your Event Type</h3>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {Object.entries(eventTypes).map(([key, type]) => (
                  <button
                    key={key}
                    type="button"
                    onClick={() => {
                      handleChange('eventType', key);
                      handleChange('eventSubType', '');
                    }}
                    className={`p-4 border-2 rounded-xl text-left transition-all ${
                      formData.eventType === key
                        ? 'border-[#00B4D8] bg-[#00B4D8]/5 shadow-sm'
                        : 'border-gray-100 hover:border-[#00B4D8]/30 hover:bg-gray-50'
                    }`}
                  >
                    <div className="text-2xl mb-1.5">{type.label.split(' ')[0]}</div>
                    <h4 className="font-bold text-[#1A2B4C] text-xs mb-0.5">{type.label.substring(type.label.indexOf(' ') + 1)}</h4>
                    <p className="text-[10px] text-gray-500 leading-normal">{type.description}</p>
                  </button>
                ))}
              </div>

              {formData.eventType && (
                <div className="pt-4 border-t border-gray-100">
                  <label className="text-[9px] font-black text-gray-400 uppercase tracking-widest block mb-2 ml-1">
                    Specific Sub-Type *
                  </label>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    {eventTypes[formData.eventType as keyof typeof eventTypes]?.subTypes.map((sub) => (
                      <button
                        key={sub.value}
                        type="button"
                        onClick={() => handleChange('eventSubType', sub.value)}
                        className={`p-3 border-2 rounded-xl text-left transition-all ${
                          formData.eventSubType === sub.value
                            ? 'border-[#00B4D8] bg-[#00B4D8]/5'
                            : 'border-gray-100 hover:border-[#00B4D8]/30'
                        }`}
                      >
                        <div className="font-bold text-[#1A2B4C] text-xs mb-0.5">{sub.label}</div>
                        <div className="text-[10px] text-gray-500 leading-normal">{sub.desc}</div>
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {formData.eventType === 'esports' && (
                <div className="pt-4 border-t border-gray-100">
                  <label className="text-[9px] font-black text-gray-400 uppercase tracking-widest block mb-2 ml-1">
                    Game Titles
                  </label>
                  <div className="flex flex-wrap gap-1.5">
                    {eventTypes.esports.gameOptions.map((game) => (
                      <button
                        key={game}
                        type="button"
                        onClick={() => handleGameToggle(game)}
                        className={`px-3 py-1.5 rounded-full text-[10px] font-bold transition-all ${
                          formData.gameTitles.includes(game)
                            ? 'bg-[#00B4D8] text-white shadow-sm'
                            : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                        }`}
                      >
                        {game}
                      </button>
                    ))}
                    <input
                      type="text"
                      placeholder="Other..."
                      value={formData.otherGameTitle}
                      onChange={(e) => handleChange('otherGameTitle', e.target.value)}
                      className="px-3 py-1 border border-gray-200 rounded-full text-[10px] focus:outline-none focus:border-[#00B4D8] focus:ring-1 focus:ring-[#00B4D8] w-24"
                    />
                  </div>
                </div>
              )}

              <div className="flex justify-end pt-4 border-t border-gray-100">
                <button
                  type="button"
                  onClick={nextStep}
                  disabled={!isStepValid()}
                  className="bg-[#1A2B4C] text-white px-6 py-3 rounded-full font-black text-xs uppercase tracking-widest hover:bg-[#00B4D8] transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Next Step
                </button>
              </div>
            </div>
          )}

          {step === 2 && (
            <div className="space-y-6 animate-in fade-in duration-300">
              <h3 className="text-lg font-black text-[#1A2B4C] mb-2">2. Event Details</h3>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="text-[9px] font-black text-gray-400 uppercase tracking-widest block mb-2.5 ml-1">
                    Expected Participants *
                  </label>
                  <select
                    value={formData.expectedParticipants}
                    onChange={(e) => handleChange('expectedParticipants', e.target.value)}
                    className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 focus:outline-none focus:border-[#00B4D8] focus:ring-1 focus:ring-[#00B4D8] font-medium text-[#1A2B4C] transition-all text-xs"
                    required
                  >
                    <option value="">Select...</option>
                    <option value="1-50">1 – 50</option>
                    <option value="51-200">51 – 200</option>
                    <option value="201-500">201 – 500</option>
                    <option value="501-1000">501 – 1,000</option>
                    <option value="1000+">1,000+</option>
                  </select>
                </div>

                <div>
                  <label className="text-[9px] font-black text-gray-400 uppercase tracking-widest block mb-2.5 ml-1">
                    Expected Audience Size *
                  </label>
                  <select
                    value={formData.expectedAudience}
                    onChange={(e) => handleChange('expectedAudience', e.target.value)}
                    className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 focus:outline-none focus:border-[#00B4D8] focus:ring-1 focus:ring-[#00B4D8] font-medium text-[#1A2B4C] transition-all text-xs"
                    required
                  >
                    <option value="">Select...</option>
                    <option value="1-100">1 – 100</option>
                    <option value="101-500">101 – 500</option>
                    <option value="501-1000">501 – 1,000</option>
                    <option value="1000+">1,000+</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="text-[9px] font-black text-gray-400 uppercase tracking-widest block mb-2.5 ml-1">
                  Event Duration *
                </label>
                <select
                  value={formData.duration}
                  onChange={(e) => handleChange('duration', e.target.value)}
                  className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 focus:outline-none focus:border-[#00B4D8] focus:ring-1 focus:ring-[#00B4D8] font-medium text-[#1A2B4C] transition-all text-xs"
                  required
                >
                  <option value="">Select...</option>
                  <option value="1-day">1 Day</option>
                  <option value="2-days">2 Days</option>
                  <option value="3-days">3 Days</option>
                  <option value="4-days">4 Days</option>
                  <option value="5-days">5 Days</option>
                  <option value="5+days">5+ Days</option>
                </select>
              </div>

              <div className="flex justify-between pt-4 border-t border-gray-100">
                <button
                  type="button"
                  onClick={prevStep}
                  className="px-6 py-3 rounded-full font-black text-xs uppercase tracking-widest text-gray-500 hover:bg-gray-100 transition-colors"
                >
                  Back
                </button>
                <button
                  type="button"
                  onClick={nextStep}
                  disabled={!isStepValid()}
                  className="bg-[#1A2B4C] text-white px-6 py-3 rounded-full font-black text-xs uppercase tracking-widest hover:bg-[#00B4D8] transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Next Step
                </button>
              </div>
            </div>
          )}

          {step === 3 && (
            <div className="space-y-6 animate-in fade-in duration-300">
              <h3 className="text-lg font-black text-[#1A2B4C] mb-2">3. Logistics & Infrastructure</h3>

              <div>
                <label className="text-[9px] font-black text-gray-400 uppercase tracking-widest block mb-2.5 ml-1">
                  Venue Requirement
                </label>
                <select
                  value={formData.venueRequirement}
                  onChange={(e) => handleChange('venueRequirement', e.target.value)}
                  className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 focus:outline-none focus:border-[#00B4D8] focus:ring-1 focus:ring-[#00B4D8] font-medium text-[#1A2B4C] transition-all text-xs"
                >
                  <option value="dedicated_venue">Dedicated Event Venue (AV Live Arranges)</option>
                  <option value="client_venue">Client-Provided Venue</option>
                  <option value="virtual_only">Virtual Only (No Physical Venue)</option>
                </select>
              </div>

              <div>
                <label className="text-[9px] font-black text-gray-400 uppercase tracking-widest block mb-2.5 ml-1">
                  Venue City *
                </label>
                <input
                  type="text"
                  value={formData.venueCity}
                  onChange={(e) => handleChange('venueCity', e.target.value)}
                  className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 focus:outline-none focus:border-[#00B4D8] focus:ring-1 focus:ring-[#00B4D8] font-medium text-[#1A2B4C] transition-all text-xs"
                  placeholder="e.g., Lahore"
                  required
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="text-[9px] font-black text-gray-400 uppercase tracking-widest block mb-2.5 ml-1">
                    Internet Requirement
                  </label>
                  <select
                    value={formData.internetRequirement}
                    onChange={(e) => handleChange('internetRequirement', e.target.value)}
                    className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 focus:outline-none focus:border-[#00B4D8] focus:ring-1 focus:ring-[#00B4D8] font-medium text-[#1A2B4C] transition-all text-xs"
                  >
                    <option value="dedicated_fiber">Dedicated Fiber (1 Gbps+)</option>
                    <option value="standard_fiber">Standard Fiber (100 Mbps)</option>
                    <option value="client_provided">Client-Provided Internet</option>
                  </select>
                </div>

                <div>
                  <label className="text-[9px] font-black text-gray-400 uppercase tracking-widest block mb-2.5 ml-1">
                    Power Requirement
                  </label>
                  <select
                    value={formData.powerRequirement}
                    onChange={(e) => handleChange('powerRequirement', e.target.value)}
                    className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 focus:outline-none focus:border-[#00B4D8] focus:ring-1 focus:ring-[#00B4D8] font-medium text-[#1A2B4C] transition-all text-xs"
                  >
                    <option value="standard">Standard Power (Venue Provided)</option>
                    <option value="ups">UPS + Backup Power</option>
                    <option value="generator">Generator Backup</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="text-[9px] font-black text-gray-400 uppercase tracking-widest block mb-2.5 ml-1">
                  Equipment Requirement
                </label>
                <select
                  value={formData.equipmentRequirement}
                  onChange={(e) => handleChange('equipmentRequirement', e.target.value)}
                  className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 focus:outline-none focus:border-[#00B4D8] focus:ring-1 focus:ring-[#00B4D8] font-medium text-[#1A2B4C] transition-all text-xs"
                >
                  <option value="standard">Standard (Gaming PCs, Monitors, Peripherals)</option>
                  <option value="full_production">Full Production (SMD Walls, Broadcast Studio)</option>
                  <option value="premium">Premium (High-End Equipment, Multiple Stages)</option>
                  <option value="client_provided">Client-Provided Equipment</option>
                </select>
              </div>

              <div className="flex justify-between pt-4 border-t border-gray-100">
                <button
                  type="button"
                  onClick={prevStep}
                  className="px-6 py-3 rounded-full font-black text-xs uppercase tracking-widest text-gray-500 hover:bg-gray-100 transition-colors"
                >
                  Back
                </button>
                <button
                  type="button"
                  onClick={nextStep}
                  disabled={!isStepValid()}
                  className="bg-[#1A2B4C] text-white px-6 py-3 rounded-full font-black text-xs uppercase tracking-widest hover:bg-[#00B4D8] transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Next Step
                </button>
              </div>
            </div>
          )}

          {step === 4 && (
            <div className="space-y-6 animate-in fade-in duration-300">
              <h3 className="text-lg font-black text-[#1A2B4C] mb-2">4. Budget Range</h3>

              <div>
                <label className="text-[9px] font-black text-gray-400 uppercase tracking-widest block mb-2.5 ml-1">
                  Overall Budget Range *
                </label>
                <select
                  value={formData.budgetRange}
                  onChange={(e) => handleChange('budgetRange', e.target.value)}
                  className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 focus:outline-none focus:border-[#00B4D8] focus:ring-1 focus:ring-[#00B4D8] font-medium text-[#1A2B4C] transition-all text-xs"
                  required
                >
                  <option value="">Select your estimated budget...</option>
                  {budgetRanges.map((range) => (
                    <option key={range.value} value={range.value}>
                      {range.label}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="text-[9px] font-black text-gray-400 uppercase tracking-widest block mb-2.5 ml-1">
                  Prize Pool / Event Budget (PKR)
                </label>
                <input
                  type="number"
                  value={formData.prizePool}
                  onChange={(e) => handleChange('prizePool', e.target.value)}
                  className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 focus:outline-none focus:border-[#00B4D8] focus:ring-1 focus:ring-[#00B4D8] font-medium text-[#1A2B4C] transition-all text-xs"
                  placeholder="e.g., 500000"
                  min="0"
                />
              </div>

              {formData.eventType && formData.eventSubType && formData.budgetRange && (
                <div className="bg-[#00B4D8]/5 border border-[#00B4D8]/20 rounded-xl p-4">
                  <h4 className="font-bold text-[#1A2B4C] text-xs mb-2">Estimated Budget Preview</h4>
                  <div className="space-y-1 text-xs text-gray-600">
                    <p><strong className="text-[#1A2B4C]">Event Type:</strong> {eventTypes[formData.eventType as keyof typeof eventTypes]?.label}</p>
                    <p><strong className="text-[#1A2B4C]">Sub-Type:</strong> {eventTypes[formData.eventType as keyof typeof eventTypes]?.subTypes.find(s => s.value === formData.eventSubType)?.label}</p>
                    <p><strong className="text-[#1A2B4C]">Participants:</strong> {formData.expectedParticipants}</p>
                    <p><strong className="text-[#1A2B4C]">Duration:</strong> {formData.duration}</p>
                  </div>
                </div>
              )}

              <div className="flex justify-between pt-4 border-t border-gray-100">
                <button
                  type="button"
                  onClick={prevStep}
                  className="px-6 py-3 rounded-full font-black text-xs uppercase tracking-widest text-gray-500 hover:bg-gray-100 transition-colors"
                >
                  Back
                </button>
                <button
                  type="button"
                  onClick={nextStep}
                  disabled={!isStepValid()}
                  className="bg-[#1A2B4C] text-white px-6 py-3 rounded-full font-black text-xs uppercase tracking-widest hover:bg-[#00B4D8] transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Next Step
                </button>
              </div>
            </div>
          )}

          {step === 5 && (
            <div className="space-y-6 animate-in fade-in duration-300">
              <h3 className="text-lg font-black text-[#1A2B4C] mb-2">5. Contact Information</h3>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="text-[9px] font-black text-gray-400 uppercase tracking-widest block mb-2.5 ml-1">
                    Full Name *
                  </label>
                  <input
                    type="text"
                    value={formData.fullName}
                    onChange={(e) => handleChange('fullName', e.target.value)}
                    className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 focus:outline-none focus:border-[#00B4D8] focus:ring-1 focus:ring-[#00B4D8] font-medium text-[#1A2B4C] transition-all text-xs"
                    required
                  />
                </div>

                <div>
                  <label className="text-[9px] font-black text-gray-400 uppercase tracking-widest block mb-2.5 ml-1">
                    Company/Organization
                  </label>
                  <input
                    type="text"
                    value={formData.companyName}
                    onChange={(e) => handleChange('companyName', e.target.value)}
                    className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 focus:outline-none focus:border-[#00B4D8] focus:ring-1 focus:ring-[#00B4D8] font-medium text-[#1A2B4C] transition-all text-xs"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="text-[9px] font-black text-gray-400 uppercase tracking-widest block mb-2.5 ml-1">
                    Email Address *
                  </label>
                  <input
                    type="email"
                    value={formData.email}
                    onChange={(e) => handleChange('email', e.target.value)}
                    className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 focus:outline-none focus:border-[#00B4D8] focus:ring-1 focus:ring-[#00B4D8] font-medium text-[#1A2B4C] transition-all text-xs"
                    required
                  />
                </div>

                <div>
                  <label className="text-[9px] font-black text-gray-400 uppercase tracking-widest block mb-2.5 ml-1">
                    Phone Number *
                  </label>
                  <input
                    type="tel"
                    value={formData.phone}
                    onChange={(e) => handleChange('phone', e.target.value)}
                    className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 focus:outline-none focus:border-[#00B4D8] focus:ring-1 focus:ring-[#00B4D8] font-medium text-[#1A2B4C] transition-all text-xs"
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="text-[9px] font-black text-gray-400 uppercase tracking-widest block mb-2.5 ml-1">
                    City
                  </label>
                  <input
                    type="text"
                    value={formData.city}
                    onChange={(e) => handleChange('city', e.target.value)}
                    className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 focus:outline-none focus:border-[#00B4D8] focus:ring-1 focus:ring-[#00B4D8] font-medium text-[#1A2B4C] transition-all text-xs"
                    placeholder="e.g., Lahore"
                  />
                </div>

                <div>
                  <label className="text-[9px] font-black text-gray-400 uppercase tracking-widest block mb-2.5 ml-1">
                    Preferred Contact Method
                  </label>
                  <select
                    value={formData.preferredContact}
                    onChange={(e) => handleChange('preferredContact', e.target.value)}
                    className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 focus:outline-none focus:border-[#00B4D8] focus:ring-1 focus:ring-[#00B4D8] font-medium text-[#1A2B4C] transition-all text-xs"
                  >
                    <option value="email">Email</option>
                    <option value="phone">Phone Call</option>
                    <option value="whatsapp">WhatsApp</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="text-[9px] font-black text-gray-400 uppercase tracking-widest block mb-2.5 ml-1">
                  Additional Information
                </label>
                <textarea
                  value={formData.additionalInfo}
                  onChange={(e) => handleChange('additionalInfo', e.target.value)}
                  rows={3}
                  className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 focus:outline-none focus:border-[#00B4D8] focus:ring-1 focus:ring-[#00B4D8] font-medium text-[#1A2B4C] transition-all text-xs resize-none"
                  placeholder="Tell us about special requirements..."
                />
              </div>

              <div className="flex justify-between pt-4 border-t border-gray-100">
                <button
                  type="button"
                  onClick={prevStep}
                  className="px-6 py-3 rounded-full font-black text-xs uppercase tracking-widest text-gray-500 hover:bg-gray-100 transition-colors"
                >
                  Back
                </button>
                <button
                  type="submit"
                  disabled={!isStepValid() || submitting}
                  className="bg-[#00B4D8] text-white px-8 py-3 rounded-full font-black text-xs uppercase tracking-widest hover:bg-[#1A2B4C] transition-all flex items-center gap-2"
                >
                  {submitting ? (
                    <>
                      <div className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                      Submitting...
                    </>
                  ) : (
                    'Get My Quote'
                  )}
                </button>
              </div>
            </div>
          )}
        </form>
      )}
    </div>
  );
}
