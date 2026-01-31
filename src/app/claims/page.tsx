"use client";

import { Sidebar } from "../corporate-customers/[id]/_components/Sidebar";
import {
    FileText, CheckCircle, Clock, Shield, DollarSign, Calendar,
    Heart, Stethoscope, Eye, Activity, UploadCloud, ChevronRight, ChevronLeft, ArrowRight, Sparkles
} from "lucide-react";
import { useState, useEffect } from "react";
import { useChat } from "@/context/ChatContext";

const AnimatedGrid = () => (
    <div className="absolute inset-0 overflow-hidden pointer-events-none opacity-20">
        <div
            className="absolute inset-0"
            style={{
                backgroundImage: `radial-gradient(circle at 2px 2px, rgba(10, 30, 59, 0.15) 1px, transparent 0)`,
                backgroundSize: '40px 40px',
            }}
        />
    </div>
);

// Claim Types
const INSURANCE_TYPES = [
    { id: 'health', title: 'Medical Health', icon: Heart, description: 'Doctor visits, hospital stays, and surgery', color: 'rose' },
    { id: 'dental', title: 'Dental Care', icon: Activity, description: 'Checkups, cleanings, and dental surgery', color: 'blue' },
    { id: 'vision', title: 'Vision Coverage', icon: Eye, description: 'Eye exams, glasses, and contact lenses', color: 'emerald' },
    { id: 'wellness', title: 'Wellness', icon: Stethoscope, description: 'Preventive care and wellness programs', color: 'amber' },
];

export default function ClaimsPage() {
    const { toggleChat } = useChat();
    const [step, setStep] = useState(1);
    const [selectedType, setSelectedType] = useState<string | null>(null);
    const [mounted, setMounted] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);

    // Mock Form Data State
    const [formData, setFormData] = useState({
        provider: "",
        date: "",
        amount: "",
        diagnosis: ""
    });

    useEffect(() => {
        setMounted(true);
    }, []);

    const handleNext = () => {
        if (step === 4) {
            handleSubmit();
        } else {
            setStep(s => s + 1);
        }
    };

    const handleBack = () => setStep(s => s - 1);

    const handleSubmit = () => {
        setIsSubmitting(true);
        // Simulate API call
        setTimeout(() => {
            setIsSubmitting(false);
            setStep(5); // Success/Tracking View
        }, 2000);
    };

    if (!mounted) return null;

    return (
        <div className="flex min-h-screen bg-gradient-to-tr from-slate-200 via-indigo-50 to-blue-100 font-sans selection:bg-blue-600/10">
            <Sidebar />
            <main className="flex-1 ml-64 relative overflow-hidden flex flex-col">
                <AnimatedGrid />

                {/* Dynamic Background Accents */}
                <div className="absolute top-[-10%] left-[-5%] w-[400px] h-[400px] bg-blue-400/10 rounded-full blur-[100px] pointer-events-none animate-pulse" />
                <div className="absolute bottom-[-5%] right-[-5%] w-[400px] h-[400px] bg-indigo-400/10 rounded-full blur-[100px] pointer-events-none animate-pulse" />

                {/* Premium Header */}
                <header className="relative z-20 flex h-20 items-center justify-between border-b border-slate-200/60 bg-white/70 backdrop-blur-md px-8">
                    <div className="flex flex-col">
                        <h1 className="text-2xl font-bold text-slate-900 tracking-tight">New Claim Request</h1>
                        <p className="text-xs text-slate-500 font-medium">Submit and track reimbursement requests</p>
                    </div>

                    <div className="flex items-center gap-6">
                        {step < 5 && (
                            <div className="flex items-center gap-2 mr-4">
                                {[1, 2, 3, 4].map((s) => (
                                    <div key={s} className="flex items-center">
                                        <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold transition-all duration-300 ${step >= s ? 'bg-[#0a1e3b] text-white shadow-lg shadow-blue-900/20' : 'bg-white text-slate-300 border border-slate-200'
                                            }`}>
                                            {step > s ? <CheckCircle className="w-4 h-4" /> : s}
                                        </div>
                                        {s < 4 && <div className={`w-8 h-1 rounded-full mx-1 transition-colors duration-300 ${step > s ? 'bg-blue-600' : 'bg-slate-200'}`} />}
                                    </div>
                                ))}
                            </div>
                        )}

                        <div className="flex items-center gap-3">
                            <button
                                onClick={toggleChat}
                                className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-xl shadow-lg shadow-blue-500/20 hover:shadow-blue-500/40 transition-all hover:-translate-y-0.5 font-bold text-xs">
                                <Sparkles className="w-4 h-4" />
                                Ask Max
                            </button>
                        </div>
                    </div>
                </header>

                <div className="relative z-10 p-8 flex-1 flex flex-col items-center justify-center overflow-y-auto animate-fade-in">

                    {/* STEP 1: Select Insurance Type */}
                    {step === 1 && (
                        <div className="w-full max-w-5xl animate-slide-up">
                            <h2 className="text-3xl font-black text-slate-900 text-center mb-2">What are you claiming for?</h2>
                            <p className="text-slate-500 text-center mb-10 font-medium">Select the category that best fits your medical service</p>

                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                                {INSURANCE_TYPES.map((type) => (
                                    <div
                                        key={type.id}
                                        onClick={() => { setSelectedType(type.id); setStep(2); }}
                                        className="group bg-white/80 backdrop-blur-xl p-6 rounded-3xl border border-slate-200 shadow-sm hover:shadow-2xl hover:scale-105 transition-all duration-300 cursor-pointer relative overflow-hidden"
                                    >
                                        <div className={`absolute top-0 left-0 w-full h-1 bg-${type.color}-500 transform origin-left scale-x-0 group-hover:scale-x-100 transition-transform duration-500`} />

                                        <div className={`w-14 h-14 rounded-2xl bg-${type.color}-50 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-500`}>
                                            <type.icon className={`w-7 h-7 text-${type.color}-600`} />
                                        </div>

                                        <h3 className="text-lg font-bold text-slate-900 mb-2">{type.title}</h3>
                                        <p className="text-xs text-slate-500 font-medium leading-relaxed">{type.description}</p>

                                        <div className="mt-6 flex items-center text-blue-600 font-bold text-xs opacity-0 group-hover:opacity-100 transition-opacity duration-300 -translate-x-2 group-hover:translate-x-0">
                                            Select Category <ArrowRight className="w-3 h-3 ml-1" />
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* STEP 2: Claim Details Form */}
                    {step === 2 && (
                        <div className="w-full max-w-2xl bg-white/90 backdrop-blur-xl p-8 rounded-3xl border border-slate-300 shadow-2xl animate-slide-up">
                            <div className="flex items-center gap-4 mb-8">
                                <button onClick={handleBack} className="p-2 hover:bg-slate-100 rounded-full transition-colors"><ChevronLeft className="w-5 h-5 text-slate-500" /></button>
                                <div>
                                    <h2 className="text-xl font-black text-slate-900">Provider & Service Details</h2>
                                    <p className="text-xs text-slate-500 font-medium">Please provide the details from your invoice</p>
                                </div>
                            </div>

                            <div className="space-y-5">
                                <div className="grid grid-cols-2 gap-5">
                                    <div className="space-y-1.5">
                                        <label className="text-xs font-bold text-slate-700 uppercase tracking-wide">Provider Name</label>
                                        <div className="relative">
                                            <FileText className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                                            <input
                                                type="text"
                                                className="w-full pl-10 pr-4 py-3 rounded-xl border border-slate-300 focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 outline-none text-sm font-medium transition-all"
                                                placeholder="e.g. City General Hospital"
                                                value={formData.provider}
                                                onChange={(e) => setFormData({ ...formData, provider: e.target.value })}
                                            />
                                        </div>
                                    </div>
                                    <div className="space-y-1.5">
                                        <label className="text-xs font-bold text-slate-700 uppercase tracking-wide">Date of Service</label>
                                        <div className="relative">
                                            <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                                            <input
                                                type="date"
                                                className="w-full pl-10 pr-4 py-3 rounded-xl border border-slate-300 focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 outline-none text-sm font-medium transition-all text-slate-600"
                                                value={formData.date}
                                                onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                                            />
                                        </div>
                                    </div>
                                </div>

                                <div className="space-y-1.5">
                                    <label className="text-xs font-bold text-slate-700 uppercase tracking-wide">Total Amount</label>
                                    <div className="relative">
                                        <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                                        <input
                                            type="number"
                                            className="w-full pl-10 pr-4 py-3 rounded-xl border border-slate-300 focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 outline-none text-sm font-medium transition-all"
                                            placeholder="0.00"
                                            value={formData.amount}
                                            onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
                                        />
                                    </div>
                                </div>

                                <div className="space-y-1.5">
                                    <label className="text-xs font-bold text-slate-700 uppercase tracking-wide">Reason / Diagnosis</label>
                                    <textarea
                                        className="w-full p-4 rounded-xl border border-slate-300 focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 outline-none text-sm font-medium transition-all min-h-[100px]"
                                        placeholder="Describe the reason for the visit..."
                                        value={formData.diagnosis}
                                        onChange={(e) => setFormData({ ...formData, diagnosis: e.target.value })}
                                    />
                                </div>
                            </div>

                            <button onClick={handleNext} className="w-full mt-8 bg-[#0a1e3b] text-white py-4 rounded-xl font-bold text-sm shadow-xl shadow-blue-900/20 hover:shadow-2xl hover:-translate-y-1 transition-all duration-300 flex items-center justify-center gap-2">
                                Continue to Uploads <ArrowRight className="w-4 h-4" />
                            </button>
                        </div>
                    )}

                    {/* STEP 3: Document Upload */}
                    {step === 3 && (
                        <div className="w-full max-w-2xl bg-white/90 backdrop-blur-xl p-8 rounded-3xl border border-slate-300 shadow-2xl animate-slide-up">
                            <div className="flex items-center gap-4 mb-8">
                                <button onClick={handleBack} className="p-2 hover:bg-slate-100 rounded-full transition-colors"><ChevronLeft className="w-5 h-5 text-slate-500" /></button>
                                <div>
                                    <h2 className="text-xl font-black text-slate-900">Upload Documents</h2>
                                    <p className="text-xs text-slate-500 font-medium">Attach receipts, invoices, and medical reports</p>
                                </div>
                            </div>

                            <div className="border-2 border-dashed border-blue-200 rounded-2xl bg-blue-50/50 p-12 flex flex-col items-center justify-center text-center group hover:border-blue-400 hover:bg-blue-50 transition-all duration-300 cursor-pointer">
                                <div className="w-16 h-16 rounded-full bg-white shadow-sm flex items-center justify-center text-blue-500 mb-4 group-hover:scale-110 transition-transform duration-300">
                                    <UploadCloud className="w-8 h-8" />
                                </div>
                                <h3 className="text-slate-900 font-bold mb-1">Click to upload or drag and drop</h3>
                                <p className="text-xs text-slate-500 font-medium">SVG, PNG, JPG or PDF (max. 10MB)</p>
                            </div>

                            <div className="mt-8 space-y-3">
                                <div className="flex items-center justify-between p-3 rounded-xl border border-slate-200 bg-white">
                                    <div className="flex items-center gap-3">
                                        <div className="w-8 h-8 rounded-lg bg-red-50 flex items-center justify-center text-red-500">
                                            <FileText className="w-4 h-4" />
                                        </div>
                                        <div>
                                            <p className="text-xs font-bold text-slate-800">Hospital_Invoice_001.pdf</p>
                                            <p className="text-[10px] text-slate-400 font-bold">2.4 MB • Just now</p>
                                        </div>
                                    </div>
                                    <button className="text-slate-400 hover:text-red-500 transition-colors"><ChevronRight className="w-4 h-4 rotate-90" /></button>
                                </div>
                            </div>

                            <button onClick={handleNext} className="w-full mt-8 bg-[#0a1e3b] text-white py-4 rounded-xl font-bold text-sm shadow-xl shadow-blue-900/20 hover:shadow-2xl hover:-translate-y-1 transition-all duration-300 flex items-center justify-center gap-2">
                                Review Claim <ArrowRight className="w-4 h-4" />
                            </button>
                        </div>
                    )}

                    {/* STEP 4: Review */}
                    {step === 4 && (
                        <div className="w-full max-w-2xl bg-white/90 backdrop-blur-xl p-8 rounded-3xl border border-slate-300 shadow-2xl animate-slide-up">
                            <div className="flex items-center gap-4 mb-8">
                                <button onClick={handleBack} className="p-2 hover:bg-slate-100 rounded-full transition-colors"><ChevronLeft className="w-5 h-5 text-slate-500" /></button>
                                <div>
                                    <h2 className="text-xl font-black text-slate-900">Review & Submit</h2>
                                    <p className="text-xs text-slate-500 font-medium">Please review all details before submitting</p>
                                </div>
                            </div>

                            <div className="bg-slate-50 rounded-2xl p-6 space-y-4 border border-slate-200">
                                <div className="flex justify-between items-center pb-4 border-b border-slate-200">
                                    <span className="text-xs font-bold text-slate-500 uppercase">Insurance Type</span>
                                    <span className="text-sm font-bold text-slate-900 capitalize">{INSURANCE_TYPES.find(t => t.id === selectedType)?.title}</span>
                                </div>
                                <div className="flex justify-between items-center pb-4 border-b border-slate-200">
                                    <span className="text-xs font-bold text-slate-500 uppercase">Provider</span>
                                    <span className="text-sm font-bold text-slate-900">{formData.provider || "City General Hospital"}</span>
                                </div>
                                <div className="flex justify-between items-center pb-4 border-b border-slate-200">
                                    <span className="text-xs font-bold text-slate-500 uppercase">Service Date</span>
                                    <span className="text-sm font-bold text-slate-900">{formData.date || "2024-10-24"}</span>
                                </div>
                                <div className="flex justify-between items-center">
                                    <span className="text-xs font-bold text-slate-500 uppercase">Total Claim Amount</span>
                                    <span className="text-lg font-black text-blue-600">${formData.amount || "245.00"}</span>
                                </div>
                            </div>

                            <button
                                onClick={handleNext}
                                disabled={isSubmitting}
                                className="w-full mt-8 bg-blue-600 text-white py-4 rounded-xl font-bold text-sm shadow-xl shadow-blue-600/30 hover:shadow-2xl hover:bg-blue-500 hover:-translate-y-1 transition-all duration-300 flex items-center justify-center gap-2"
                            >
                                {isSubmitting ? (
                                    <>Processing <Activity className="w-4 h-4 animate-spin" /></>
                                ) : (
                                    <>Submit Claim Request <CheckCircle className="w-4 h-4" /></>
                                )}
                            </button>
                        </div>
                    )}

                    {/* STEP 5: Success & Tracking Overview (The original UI) */}
                    {step === 5 && (
                        <div className="w-full max-w-5xl animate-fade-in">
                            <div className="text-center mb-10">
                                <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4 animate-card-entrance">
                                    <CheckCircle className="w-8 h-8 text-green-600" />
                                </div>
                                <h2 className="text-3xl font-black text-slate-900">Claim Submitted Successfully!</h2>
                                <p className="text-slate-500 font-medium mt-2">Your claim ID is <span className="text-blue-600 font-mono font-bold">#CLM-89210</span>. Track the status below.</p>
                            </div>

                            {/* Process Visualizer Card (Reused from previous code) */}
                            <div className="bg-white/90 backdrop-blur-xl rounded-3xl border border-slate-300 shadow-[0_20px_50px_rgba(0,0,0,0.05)] overflow-hidden">
                                <div className="bg-[#0a1e3b] px-8 py-6 flex justify-between items-center">
                                    <div className="flex items-center gap-4">
                                        <div className="p-3 bg-white/10 rounded-xl backdrop-blur-md border border-white/10">
                                            <Activity className="w-6 h-6 text-blue-400" />
                                        </div>
                                        <div>
                                            <h3 className="text-lg font-black text-white tracking-wide">Live Adjudication Status</h3>
                                            <p className="text-xs text-blue-200 font-medium mt-1">Real-time automated processing</p>
                                        </div>
                                    </div>
                                    <span className="px-4 py-1.5 bg-blue-500/20 text-blue-200 border border-blue-500/30 rounded-lg text-[10px] font-bold uppercase tracking-wider animate-pulse">
                                        Processing
                                    </span>
                                </div>

                                <div className="p-12">
                                    <div className="relative">
                                        <div className="absolute top-1/2 left-0 w-full h-1 bg-slate-100 -translate-y-1/2 rounded-full" />
                                        {/* Animation starting... */}
                                        <div className="absolute top-1/2 left-0 w-[15%] h-1 bg-gradient-to-r from-blue-600 to-indigo-500 -translate-y-1/2 rounded-full transition-all duration-[3000ms] shadow-[0_0_20px_rgba(79,70,229,0.5)] animate-grow-bar" />

                                        <div className="relative flex justify-between w-full">
                                            {[
                                                { title: "Submitted", status: "completed", date: "Just now", icon: FileText },
                                                { title: "Verification", status: "processing", date: "In Progress", icon: CheckCircle },
                                                { title: "Adjudication", status: "pending", date: "Est. 10m", icon: Activity },
                                                { title: "Approval", status: "pending", date: "Est. 1h", icon: Shield },
                                                { title: "Payment", status: "pending", date: "Est. 24h", icon: DollarSign },
                                            ].map((s, i) => (
                                                <div key={i} className="flex flex-col items-center relative z-10">
                                                    <div className={`w-14 h-14 rounded-full flex items-center justify-center border-4 transition-all duration-500 ${i === 0 ? 'bg-white border-blue-600 text-blue-600' :
                                                        i === 1 ? 'bg-white border-indigo-500 text-indigo-600 animate-pulse' :
                                                            'bg-white border-slate-200 text-slate-300'
                                                        }`}>
                                                        <s.icon className="w-6 h-6" />
                                                    </div>
                                                    <div className="mt-4 text-center">
                                                        <h4 className="text-xs font-bold uppercase tracking-wider text-slate-900 mb-1">{s.title}</h4>
                                                        <span className="text-[9px] font-bold text-slate-400 bg-slate-50 px-2 py-0.5 rounded">{s.date}</span>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <button onClick={() => setStep(1)} className="mt-8 mx-auto block text-slate-400 hover:text-slate-600 text-xs font-bold uppercase tracking-wider transition-colors">
                                Start Another Claim
                            </button>
                        </div>
                    )}

                </div>
            </main>
            <style jsx global>{`
                @keyframes fade-in { from { opacity: 0; } to { opacity: 1; } }
                @keyframes slide-up { from { opacity: 0; transform: translateY(20px); } to { opacity: 1; transform: translateY(0); } }
                @keyframes card-entrance { from { opacity: 0; transform: scale(0.9); } to { opacity: 1; transform: scale(1); } }
                @keyframes grow-bar { from { width: 0%; } to { width: 35%; } }
                .animate-fade-in { animation: fade-in 0.6s ease-out forwards; }
                .animate-slide-up { animation: slide-up 0.5s cubic-bezier(0.16, 1, 0.3, 1) forwards; }
                .animate-card-entrance { animation: card-entrance 0.5s cubic-bezier(0.16, 1, 0.3, 1) forwards; }
                .animate-grow-bar { animation: grow-bar 2s ease-out forwards; }
            `}</style>
        </div>
    );
}
