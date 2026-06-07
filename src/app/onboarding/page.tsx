'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useApp, UserProfile, UserMeasurements } from '@/context/AppContext';

// High-fidelity inline SVGs for body type silhouettes
const SlimMaleSVG = () => (
  <svg viewBox="0 0 100 200" className="w-16 h-32 mx-auto stroke-[#C9B99A] fill-none stroke-[2] transition-colors group-hover:stroke-[#D4A853]">
    <circle cx="50" cy="25" r="12" />
    <path d="M50 37v60M38 52h24M38 52v45M62 52v45M44 97v85M56 97v85" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);

const AverageMaleSVG = () => (
  <svg viewBox="0 0 100 200" className="w-16 h-32 mx-auto stroke-[#C9B99A] fill-none stroke-[2] transition-colors group-hover:stroke-[#D4A853]">
    <circle cx="50" cy="25" r="13" />
    <path d="M50 38v55M35 52h30M35 52v42M65 52v42M42 93v87M58 93v87" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);

const AthleticMaleSVG = () => (
  <svg viewBox="0 0 100 200" className="w-16 h-32 mx-auto stroke-[#C9B99A] fill-none stroke-[2.2] transition-colors group-hover:stroke-[#D4A853]">
    <circle cx="50" cy="25" r="13" />
    <path d="M50 38v55M30 48h40L62 93H38L30 48z M30 48v35M70 48v35M40 93v87M60 93v87" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);

const StoutMaleSVG = () => (
  <svg viewBox="0 0 100 200" className="w-16 h-32 mx-auto stroke-[#C9B99A] fill-none stroke-[2] transition-colors group-hover:stroke-[#D4A853]">
    <circle cx="50" cy="25" r="14" />
    <path d="M50 39v53M32 55h36c4 25 1 38-18 38s-22-13-18-38z M32 55v35M68 55v35M41 93v87M59 93v87" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);

const SlimFemaleSVG = () => (
  <svg viewBox="0 0 100 200" className="w-16 h-32 mx-auto stroke-[#C9B99A] fill-none stroke-[2] transition-colors group-hover:stroke-[#D4A853]">
    <circle cx="50" cy="25" r="11" />
    <path d="M50 36v60M38 50h24M38 50c1 10 3 20 2 35M62 50c-1 10-3 20-2 35M43 96v84M57 96v84" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);

const AverageFemaleSVG = () => (
  <svg viewBox="0 0 100 200" className="w-16 h-32 mx-auto stroke-[#C9B99A] fill-none stroke-[2] transition-colors group-hover:stroke-[#D4A853]">
    <circle cx="50" cy="25" r="12" />
    <path d="M50 37v55M36 50h28c0 10-2 20-5 32c4 5 5 10 5 13H36c0-3 1-8 5-13c-3-12-5-22-5-32z M36 50v30M64 50v30M41 95v85M59 95v85" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);

const HourglassFemaleSVG = () => (
  <svg viewBox="0 0 100 200" className="w-16 h-32 mx-auto stroke-[#C9B99A] fill-none stroke-[2.2] transition-colors group-hover:stroke-[#D4A853]">
    <circle cx="50" cy="25" r="12" />
    <path d="M50 37v53M34 48h32c-2 12-6 20-6 26c0 6 4 14 6 22H34c2-8 6-16 6-22c0-6-4-14-6-26z M34 48v25M66 48v25M40 96v84M60 96v84" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);

const CurvyFemaleSVG = () => (
  <svg viewBox="0 0 100 200" className="w-16 h-32 mx-auto stroke-[#C9B99A] fill-none stroke-[2] transition-colors group-hover:stroke-[#D4A853]">
    <circle cx="50" cy="25" r="13" />
    <path d="M50 38v54M32 52h36c-2 12-5 18-5 24c0 8 4 16 5 24H32c1-8 5-16 5-24c0-6-3-12-5-24z M32 52v20M68 52v20M40 100v80M60 100v80" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);

// Default measurements based on gender & body type
const MEASUREMENT_DEFAULTS: Record<'male' | 'female', Record<string, UserMeasurements>> = {
  male: {
    Slim: { chest: 36, waist: 29, hips: 36, height: 69, inseam: 30 },
    Average: { chest: 40, waist: 34, hips: 40, height: 70, inseam: 30 },
    Athletic: { chest: 42, waist: 32, hips: 41, height: 71, inseam: 32 },
    'Plus Size': { chest: 46, waist: 40, hips: 46, height: 70, inseam: 29 },
  },
  female: {
    Slim: { chest: 32, waist: 24, hips: 34, height: 63, inseam: 28 },
    Average: { chest: 35, waist: 28, hips: 38, height: 64, inseam: 29 },
    Hourglass: { chest: 37, waist: 26, hips: 38, height: 65, inseam: 30 },
    'Plus Size': { chest: 42, waist: 35, hips: 44, height: 65, inseam: 29 },
  },
};

export default function OnboardingPage() {
  const router = useRouter();
  const { userProfile, saveProfile } = useApp();

  const [step, setStep] = useState<number>(1);
  const [name, setName] = useState<string>('');
  const [gender, setGender] = useState<'male' | 'female'>('male');
  const [bodyType, setBodyType] = useState<string>('Average');
  const [measurements, setMeasurements] = useState<UserMeasurements>({
    chest: 40,
    waist: 34,
    hips: 40,
    height: 70,
    inseam: 30,
  });

  // Redirect if profile already exists
  useEffect(() => {
    if (userProfile) {
      router.push('/');
    }
  }, [userProfile, router]);

  // Update measurements when gender or body type changes
  useEffect(() => {
    const defaults = MEASUREMENT_DEFAULTS[gender][bodyType] || MEASUREMENT_DEFAULTS[gender]['Average'];
    setMeasurements(defaults);
  }, [gender, bodyType]);

  const handleNextStep = () => {
    if (step === 1) {
      if (!name.trim()) return;
      // Pre-set a reasonable default body type for women as "Average" as well
      setStep(2);
    } else if (step === 2) {
      setStep(3);
    } else if (step === 3) {
      // Complete Onboarding
      const profile: UserProfile = {
        name: name.trim(),
        gender,
        bodyType,
        measurements,
      };
      saveProfile(profile);
      router.push('/');
    }
  };

  const handlePrevStep = () => {
    if (step > 1) {
      setStep(step - 1);
    }
  };

  const updateMeasurementField = (field: keyof UserMeasurements, delta: number) => {
    setMeasurements((prev) => ({
      ...prev,
      [field]: Math.max(10, prev[field] + delta),
    }));
  };

  return (
    <div className="flex-1 flex flex-col justify-between px-6 py-8 min-h-screen bg-[#111111] overflow-y-auto no-scrollbar">
      
      {/* Top Header */}
      <div>
        <div className="flex justify-between items-center mb-8">
          {step > 1 ? (
            <button
              onClick={handlePrevStep}
              className="text-[#C9B99A] hover:text-[#FAF0E6] flex items-center gap-1.5 text-sm font-medium transition-colors"
            >
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="2.5" stroke="currentColor" className="w-4 h-4">
                <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 19.5L8.25 12l7.5-7.5" />
              </svg>
              Back
            </button>
          ) : (
            <div className="w-12 h-6" /> // spacer
          )}
          
          <div className="flex flex-col items-center">
            <span className="text-sm font-bold tracking-[0.2em] text-[#D4A853] uppercase">Phashion Sense</span>
            <span className="text-[8px] tracking-[0.1em] text-[#C9B99A]">ONBOARDING</span>
          </div>

          <div className="w-12 h-6" /> // spacer
        </div>

        {/* Dynamic Step Content */}
        <div className="animate-slide-up">
          {step === 1 && (
            <div className="space-y-6">
              <div className="space-y-2">
                <h1 className="text-2xl font-bold tracking-tight text-[#FAF0E6]">Welcome to Phashion Sense</h1>
                <p className="text-sm text-[#C9B99A]">Let's setup your tailored fitting room profile in under a minute.</p>
              </div>

              <div className="space-y-4 pt-4">
                <div className="space-y-2">
                  <label htmlFor="fullname" className="text-xs font-semibold uppercase tracking-wider text-[#C9B99A]">Your Full Name</label>
                  <input
                    id="fullname"
                    type="text"
                    placeholder="Enter your name"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="w-full bg-[#0A0A0A] border border-[#1F1C1A] rounded-xl px-4 py-3.5 text-[#FAF0E6] placeholder-[#C9B99A]/40 focus:outline-none focus:border-[#D4A853] focus:ring-1 focus:ring-[#D4A853] transition-all"
                  />
                </div>

                <div className="space-y-2">
                  <span className="text-xs font-semibold uppercase tracking-wider text-[#C9B99A]">Your Gender Identity</span>
                  <div className="grid grid-cols-2 gap-4">
                    <button
                      type="button"
                      onClick={() => {
                        setGender('male');
                        setBodyType('Average');
                      }}
                      className={`py-4 rounded-xl font-semibold tracking-wide border transition-all duration-300 flex flex-col items-center justify-center gap-2 ${
                        gender === 'male'
                          ? 'border-[#D4A853] bg-[#D4A853]/10 text-[#D4A853] shadow-[0_0_15px_rgba(212,168,83,0.15)]'
                          : 'border-[#1F1C1A] bg-[#0A0A0A] text-[#C9B99A] hover:border-[#FAF0E6]/30'
                      }`}
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="2" stroke="currentColor" className="w-5 h-5">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 6a3.75 3.75 0 1 1-7.5 0 3.75 3.75 0 0 1 7.5 0ZM4.501 20.118a7.5 7.5 0 0 1 14.998 0A17.933 17.933 0 0 1 12 21.75c-2.676 0-5.216-.584-7.499-1.632Z" />
                      </svg>
                      Gentleman
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setGender('female');
                        setBodyType('Average');
                      }}
                      className={`py-4 rounded-xl font-semibold tracking-wide border transition-all duration-300 flex flex-col items-center justify-center gap-2 ${
                        gender === 'female'
                          ? 'border-[#D4A853] bg-[#D4A853]/10 text-[#D4A853] shadow-[0_0_15px_rgba(212,168,83,0.15)]'
                          : 'border-[#1F1C1A] bg-[#0A0A0A] text-[#C9B99A] hover:border-[#FAF0E6]/30'
                      }`}
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="2" stroke="currentColor" className="w-5 h-5">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 6a3.75 3.75 0 1 1-7.5 0 3.75 3.75 0 0 1 7.5 0ZM4.501 20.118a7.5 7.5 0 0 1 14.998 0A17.933 17.933 0 0 1 12 21.75c-2.676 0-5.216-.584-7.499-1.632Z" />
                      </svg>
                      Lady
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}

          {step === 2 && (
            <div className="space-y-6">
              <div className="space-y-2">
                <h1 className="text-2xl font-bold tracking-tight text-[#FAF0E6]">Select Silhouette</h1>
                <p className="text-sm text-[#C9B99A]">Choose the body structure that best matches yours to pre-fill fittings.</p>
              </div>

              <div className="grid grid-cols-2 gap-4 pt-2">
                {gender === 'male' ? (
                  <>
                    <button
                      onClick={() => setBodyType('Slim')}
                      className={`group p-4 rounded-xl border flex flex-col items-center justify-center gap-3 transition-all duration-300 ${
                        bodyType === 'Slim'
                          ? 'border-[#D4A853] bg-[#D4A853]/10 text-[#D4A853] shadow-[0_0_15px_rgba(212,168,83,0.1)]'
                          : 'border-[#1F1C1A] bg-[#0A0A0A] text-[#C9B99A] hover:border-[#FAF0E6]/20'
                      }`}
                    >
                      <SlimMaleSVG />
                      <span className="text-sm font-semibold tracking-wide">Slim Fit</span>
                    </button>

                    <button
                      onClick={() => setBodyType('Average')}
                      className={`group p-4 rounded-xl border flex flex-col items-center justify-center gap-3 transition-all duration-300 ${
                        bodyType === 'Average'
                          ? 'border-[#D4A853] bg-[#D4A853]/10 text-[#D4A853] shadow-[0_0_15px_rgba(212,168,83,0.1)]'
                          : 'border-[#1F1C1A] bg-[#0A0A0A] text-[#C9B99A] hover:border-[#FAF0E6]/20'
                      }`}
                    >
                      <AverageMaleSVG />
                      <span className="text-sm font-semibold tracking-wide">Regular Fit</span>
                    </button>

                    <button
                      onClick={() => setBodyType('Athletic')}
                      className={`group p-4 rounded-xl border flex flex-col items-center justify-center gap-3 transition-all duration-300 ${
                        bodyType === 'Athletic'
                          ? 'border-[#D4A853] bg-[#D4A853]/10 text-[#D4A853] shadow-[0_0_15px_rgba(212,168,83,0.1)]'
                          : 'border-[#1F1C1A] bg-[#0A0A0A] text-[#C9B99A] hover:border-[#FAF0E6]/20'
                      }`}
                    >
                      <AthleticMaleSVG />
                      <span className="text-sm font-semibold tracking-wide">V-Taper/Athletic</span>
                    </button>

                    <button
                      onClick={() => setBodyType('Plus Size')}
                      className={`group p-4 rounded-xl border flex flex-col items-center justify-center gap-3 transition-all duration-300 ${
                        bodyType === 'Plus Size'
                          ? 'border-[#D4A853] bg-[#D4A853]/10 text-[#D4A853] shadow-[0_0_15px_rgba(212,168,83,0.1)]'
                          : 'border-[#1F1C1A] bg-[#0A0A0A] text-[#C9B99A] hover:border-[#FAF0E6]/20'
                      }`}
                    >
                      <StoutMaleSVG />
                      <span className="text-sm font-semibold tracking-wide">Broad / Stout</span>
                    </button>
                  </>
                ) : (
                  <>
                    <button
                      onClick={() => setBodyType('Slim')}
                      className={`group p-4 rounded-xl border flex flex-col items-center justify-center gap-3 transition-all duration-300 ${
                        bodyType === 'Slim'
                          ? 'border-[#D4A853] bg-[#D4A853]/10 text-[#D4A853] shadow-[0_0_15px_rgba(212,168,83,0.1)]'
                          : 'border-[#1F1C1A] bg-[#0A0A0A] text-[#C9B99A] hover:border-[#FAF0E6]/20'
                      }`}
                    >
                      <SlimFemaleSVG />
                      <span className="text-sm font-semibold tracking-wide">Petite / Slim</span>
                    </button>

                    <button
                      onClick={() => setBodyType('Average')}
                      className={`group p-4 rounded-xl border flex flex-col items-center justify-center gap-3 transition-all duration-300 ${
                        bodyType === 'Average'
                          ? 'border-[#D4A853] bg-[#D4A853]/10 text-[#D4A853] shadow-[0_0_15px_rgba(212,168,83,0.1)]'
                          : 'border-[#1F1C1A] bg-[#0A0A0A] text-[#C9B99A] hover:border-[#FAF0E6]/20'
                      }`}
                    >
                      <AverageFemaleSVG />
                      <span className="text-sm font-semibold tracking-wide">Regular Fit</span>
                    </button>

                    <button
                      onClick={() => setBodyType('Hourglass')}
                      className={`group p-4 rounded-xl border flex flex-col items-center justify-center gap-3 transition-all duration-300 ${
                        bodyType === 'Hourglass'
                          ? 'border-[#D4A853] bg-[#D4A853]/10 text-[#D4A853] shadow-[0_0_15px_rgba(212,168,83,0.1)]'
                          : 'border-[#1F1C1A] bg-[#0A0A0A] text-[#C9B99A] hover:border-[#FAF0E6]/20'
                      }`}
                    >
                      <HourglassFemaleSVG />
                      <span className="text-sm font-semibold tracking-wide">Hourglass</span>
                    </button>

                    <button
                      onClick={() => setBodyType('Plus Size')}
                      className={`group p-4 rounded-xl border flex flex-col items-center justify-center gap-3 transition-all duration-300 ${
                        bodyType === 'Plus Size'
                          ? 'border-[#D4A853] bg-[#D4A853]/10 text-[#D4A853] shadow-[0_0_15px_rgba(212,168,83,0.1)]'
                          : 'border-[#1F1C1A] bg-[#0A0A0A] text-[#C9B99A] hover:border-[#FAF0E6]/20'
                      }`}
                    >
                      <CurvyFemaleSVG />
                      <span className="text-sm font-semibold tracking-wide">Curvy / Plus</span>
                    </button>
                  </>
                )}
              </div>
            </div>
          )}

          {step === 3 && (
            <div className="space-y-6">
              <div className="space-y-2">
                <h1 className="text-2xl font-bold tracking-tight text-[#FAF0E6]">Refine Fittings</h1>
                <p className="text-sm text-[#C9B99A]">Adjust values (in inches) to ensure precise digital fitting recommendations.</p>
              </div>

              <div className="bg-[#0A0A0A] border border-[#1F1C1A] rounded-2xl p-4 divide-y divide-[#1F1C1A] space-y-4">
                {/* Chest Field */}
                <div className="flex items-center justify-between pt-2">
                  <div className="flex flex-col">
                    <span className="text-sm font-semibold text-[#FAF0E6] capitalize">Chest / Bust</span>
                    <span className="text-[10px] text-[#C9B99A]">Widest circumference</span>
                  </div>
                  <div className="flex items-center gap-4">
                    <button
                      onClick={() => updateMeasurementField('chest', -1)}
                      className="w-8 h-8 rounded-full border border-[#1F1C1A] bg-[#111111] hover:border-[#D4A853] flex items-center justify-center text-lg font-bold text-[#C9B99A] hover:text-[#D4A853] transition-colors"
                    >
                      −
                    </button>
                    <span className="w-12 text-center text-lg font-bold text-[#D4A853]">{measurements.chest}"</span>
                    <button
                      onClick={() => updateMeasurementField('chest', 1)}
                      className="w-8 h-8 rounded-full border border-[#1F1C1A] bg-[#111111] hover:border-[#D4A853] flex items-center justify-center text-lg font-bold text-[#C9B99A] hover:text-[#D4A853] transition-colors"
                    >
                      +
                    </button>
                  </div>
                </div>

                {/* Waist Field */}
                <div className="flex items-center justify-between pt-4">
                  <div className="flex flex-col">
                    <span className="text-sm font-semibold text-[#FAF0E6] capitalize">Waist</span>
                    <span className="text-[10px] text-[#C9B99A]">Narrowest circumference</span>
                  </div>
                  <div className="flex items-center gap-4">
                    <button
                      onClick={() => updateMeasurementField('waist', -1)}
                      className="w-8 h-8 rounded-full border border-[#1F1C1A] bg-[#111111] hover:border-[#D4A853] flex items-center justify-center text-lg font-bold text-[#C9B99A] hover:text-[#D4A853] transition-colors"
                    >
                      −
                    </button>
                    <span className="w-12 text-center text-lg font-bold text-[#D4A853]">{measurements.waist}"</span>
                    <button
                      onClick={() => updateMeasurementField('waist', 1)}
                      className="w-8 h-8 rounded-full border border-[#1F1C1A] bg-[#111111] hover:border-[#D4A853] flex items-center justify-center text-lg font-bold text-[#C9B99A] hover:text-[#D4A853] transition-colors"
                    >
                      +
                    </button>
                  </div>
                </div>

                {/* Hips Field */}
                <div className="flex items-center justify-between pt-4">
                  <div className="flex flex-col">
                    <span className="text-sm font-semibold text-[#FAF0E6] capitalize">Hips</span>
                    <span className="text-[10px] text-[#C9B99A]">Widest hip point</span>
                  </div>
                  <div className="flex items-center gap-4">
                    <button
                      onClick={() => updateMeasurementField('hips', -1)}
                      className="w-8 h-8 rounded-full border border-[#1F1C1A] bg-[#111111] hover:border-[#D4A853] flex items-center justify-center text-lg font-bold text-[#C9B99A] hover:text-[#D4A853] transition-colors"
                    >
                      −
                    </button>
                    <span className="w-12 text-center text-lg font-bold text-[#D4A853]">{measurements.hips}"</span>
                    <button
                      onClick={() => updateMeasurementField('hips', 1)}
                      className="w-8 h-8 rounded-full border border-[#1F1C1A] bg-[#111111] hover:border-[#D4A853] flex items-center justify-center text-lg font-bold text-[#C9B99A] hover:text-[#D4A853] transition-colors"
                    >
                      +
                    </button>
                  </div>
                </div>

                {/* Height Field */}
                <div className="flex items-center justify-between pt-4">
                  <div className="flex flex-col">
                    <span className="text-sm font-semibold text-[#FAF0E6] capitalize">Height</span>
                    <span className="text-[10px] text-[#C9B99A]">Barefoot height</span>
                  </div>
                  <div className="flex items-center gap-4">
                    <button
                      onClick={() => updateMeasurementField('height', -1)}
                      className="w-8 h-8 rounded-full border border-[#1F1C1A] bg-[#111111] hover:border-[#D4A853] flex items-center justify-center text-lg font-bold text-[#C9B99A] hover:text-[#D4A853] transition-colors"
                    >
                      −
                    </button>
                    <span className="w-12 text-center text-lg font-bold text-[#D4A853]">{measurements.height}"</span>
                    <button
                      onClick={() => updateMeasurementField('height', 1)}
                      className="w-8 h-8 rounded-full border border-[#1F1C1A] bg-[#111111] hover:border-[#D4A853] flex items-center justify-center text-lg font-bold text-[#C9B99A] hover:text-[#D4A853] transition-colors"
                    >
                      +
                    </button>
                  </div>
                </div>

                {/* Inseam Field */}
                <div className="flex items-center justify-between pt-4">
                  <div className="flex flex-col">
                    <span className="text-sm font-semibold text-[#FAF0E6] capitalize">Inseam</span>
                    <span className="text-[10px] text-[#C9B99A]">Crotch to ankle bone</span>
                  </div>
                  <div className="flex items-center gap-4">
                    <button
                      onClick={() => updateMeasurementField('inseam', -1)}
                      className="w-8 h-8 rounded-full border border-[#1F1C1A] bg-[#111111] hover:border-[#D4A853] flex items-center justify-center text-lg font-bold text-[#C9B99A] hover:text-[#D4A853] transition-colors"
                    >
                      −
                    </button>
                    <span className="w-12 text-center text-lg font-bold text-[#D4A853]">{measurements.inseam}"</span>
                    <button
                      onClick={() => updateMeasurementField('inseam', 1)}
                      className="w-8 h-8 rounded-full border border-[#1F1C1A] bg-[#111111] hover:border-[#D4A853] flex items-center justify-center text-lg font-bold text-[#C9B99A] hover:text-[#D4A853] transition-colors"
                    >
                      +
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Bottom Action Footer */}
      <div className="space-y-6">
        
        {/* Step Indicator Dots */}
        <div className="flex items-center justify-center gap-2">
          <span className={`w-2 h-2 rounded-full transition-all duration-300 ${step === 1 ? 'w-6 bg-[#D4A853]' : 'bg-[#C9B99A]/30'}`} />
          <span className={`w-2 h-2 rounded-full transition-all duration-300 ${step === 2 ? 'w-6 bg-[#D4A853]' : 'bg-[#C9B99A]/30'}`} />
          <span className={`w-2 h-2 rounded-full transition-all duration-300 ${step === 3 ? 'w-6 bg-[#D4A853]' : 'bg-[#C9B99A]/30'}`} />
        </div>

        {/* CTA Button */}
        <button
          type="button"
          onClick={handleNextStep}
          disabled={step === 1 && !name.trim()}
          className={`w-full py-4 rounded-xl font-bold tracking-wider text-sm transition-all duration-300 shadow-[0_4px_16px_rgba(0,0,0,0.2)] uppercase ${
            step === 1 && !name.trim()
              ? 'bg-[#1F1C1A] text-[#C9B99A]/40 cursor-not-allowed border border-transparent'
              : 'bg-[#D4A853] hover:bg-[#C29642] text-[#0A0A0A] border border-[#D4A853] hover:shadow-[0_0_20px_rgba(212,168,83,0.3)] font-black'
          }`}
        >
          {step === 3 ? 'Finish & Start Shopping' : 'Continue'}
        </button>
      </div>

    </div>
  );
}
