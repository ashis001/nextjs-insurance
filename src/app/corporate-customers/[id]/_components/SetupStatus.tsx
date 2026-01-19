"use client";

import { useCorporateEngine } from "./useCorporateEngine";
import { ChevronLeft, ChevronRight, X, Check } from "lucide-react";
import { Tier } from "@/lib/types";
import { useState, useMemo } from "react";

export function SetupStatus({ engine }: { engine: ReturnType<typeof useCorporateEngine> }) {
    const { corporate, attemptAdvance, setSetupStage } = engine;

    const [modalState, setModalState] = useState<'NONE' | 'SELECT_SUBDOMAIN' | 'SELECT_ADMINS' | 'SUCCESS'>('NONE');
    const [selectedSubdomain, setSelectedSubdomain] = useState("");

    // Calculate setup percentage (mock logic based on completed fields or active tiers)
    const hasActiveTiers = corporate.tiers.some((t: Tier) => t.isValid && t.status === "Active");
    const setupPercentage = hasActiveTiers ? 100 : 50;

    const subdomainOptions = useMemo(() => {
        const base = (corporate.name || "Unique").toLowerCase().replace(/\s+/g, '');
        const randomNum = Math.floor(Math.random() * 90) + 10;
        return [
            base,
            `${base}${randomNum}`,
            `${base}-portal`
        ];
    }, [corporate.name]);

    const SemiCircleGauge = ({ value, label, color = "#22c55e", percentage = 0 }: { value: string | number, label: string, color?: string, percentage?: number }) => {
        return (
            <div className="flex flex-col items-center justify-center p-6 bg-white flex-1 min-w-[280px]">
                <div className="relative w-40 h-24 flex items-center justify-center overflow-hidden">
                    <svg viewBox="0 0 100 60" className="w-full h-full transform translate-y-2">
                        {/* Background track (dashed) */}
                        <path
                            d="M 10 50 A 40 40 0 0 1 90 50"
                            fill="none"
                            stroke="#e2e8f0"
                            strokeWidth="10"
                            strokeDasharray="2 1.5"
                            strokeLinecap="round"
                        />
                        {/* Progress track (dashed) */}
                        <path
                            d="M 10 50 A 40 40 0 0 1 90 50"
                            fill="none"
                            stroke={percentage > 0 ? color : "#e2e8f0"}
                            strokeWidth="10"
                            strokeDasharray="2 1.5"
                            strokeDashoffset={percentage > 0 ? (1 - percentage / 100) * 125.6 : 125.6}
                            strokeLinecap="round"
                            className="transition-all duration-1000 ease-out"
                        />
                    </svg>
                    <div className="absolute bottom-2 flex flex-col items-center">
                        <span className="text-xl font-bold text-gray-800">{value}</span>
                        {label === "Status" && <span className="text-[10px] text-gray-400 font-bold -mt-1">%</span>}
                    </div>
                    {/* Scale markers */}
                    <div className="absolute bottom-1 left-4 text-[8px] font-bold text-gray-400">0</div>
                    <div className="absolute bottom-1 right-4 text-[8px] font-bold text-gray-400">{label === "Expected Premium" ? "$ 0" : label === "Status" ? "100" : "0"}</div>
                </div>
                <p className="mt-4 text-[11px] font-bold text-gray-500 uppercase tracking-tight">{label}</p>
            </div>
        );
    };

    return (
        <div className="flex flex-col h-full bg-[#f8fafc]">
            {/* Header Navy Bar */}
            <div className="bg-[#1e3a5f] px-4 py-2 border-b border-[#2d4d75]">
                <h2 className="text-sm font-semibold text-white uppercase tracking-wider">Setup Status</h2>
            </div>

            {/* Content Area */}
            <div className="flex-1 p-8 flex items-center justify-center">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-0 border border-gray-200 rounded overflow-hidden shadow-sm bg-white w-full max-w-5xl divide-x divide-gray-100">
                    <SemiCircleGauge
                        value={setupPercentage}
                        label="Status"
                        percentage={setupPercentage}
                        color="#22c55e"
                    />
                    <SemiCircleGauge
                        value="--"
                        label="Employees Enrolled"
                        percentage={0}
                    />
                    <SemiCircleGauge
                        value="$ 0"
                        label="Expected Premium"
                        percentage={0}
                    />
                </div>
            </div>

            {/* Footer Buttons */}
            <div className="fixed bottom-4 left-64 right-6 px-4 flex justify-between bg-white/50 backdrop-blur-sm py-4 border-t border-transparent">
                <button
                    onClick={() => setSetupStage("TIERS")}
                    className="flex items-center gap-2 rounded bg-[#1e3a5f] px-4 py-2 text-xs font-bold text-white shadow hover:bg-slate-800 transition-all active:scale-95 uppercase tracking-wide"
                >
                    <ChevronLeft className="h-3.5 w-3.5" /> Previous
                </button>
                <button
                    onClick={() => setModalState('SELECT_SUBDOMAIN')}
                    className="flex items-center gap-2 rounded bg-[#1e3a5f] px-4 py-2 text-xs font-bold text-white shadow hover:bg-slate-800 transition-all active:scale-95 uppercase tracking-wide"
                >
                    Next <ChevronRight className="h-3.5 w-3.5" />
                </button>
            </div>

            {/* Modal Step 1: Subdomain Selection */}
            {modalState === 'SELECT_SUBDOMAIN' && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/40 backdrop-blur-[1px]">
                    <div className="w-[500px] bg-white rounded-md shadow-2xl overflow-hidden border border-gray-300">
                        <div className="bg-[#6482a2] px-4 py-2.5 flex items-center justify-center relative">
                            <h4 className="text-[14px] font-bold text-white">Info</h4>
                            <button onClick={() => setModalState('NONE')} className="absolute right-4 text-white hover:text-gray-200">
                                <X size={16} />
                            </button>
                        </div>
                        <div className="p-6 space-y-4">
                            <p className="text-[15px] font-medium text-gray-800">Select a subdomain for the corporate insurance portal</p>
                            <div className="space-y-3 pl-2">
                                {subdomainOptions.map((opt) => (
                                    <label key={opt} className="flex items-center gap-3 cursor-pointer group">
                                        <input
                                            type="radio"
                                            name="subdomain"
                                            checked={selectedSubdomain === opt}
                                            onChange={() => setSelectedSubdomain(opt)}
                                            className="h-4 w-4 border-gray-300 text-blue-600 focus:ring-blue-500"
                                        />
                                        <span className="text-[14px] text-gray-800 group-hover:text-blue-600 transition-colors font-medium">{opt}</span>
                                    </label>
                                ))}
                            </div>
                        </div>
                        <div className="px-6 py-4 flex justify-end bg-white border-t border-gray-100">
                            <button
                                onClick={() => setModalState('SELECT_ADMINS')}
                                className="bg-[#0f2a4a] text-white rounded px-6 py-2 text-[12px] font-bold hover:bg-slate-800 transition-all shadow-sm"
                            >
                                Confirm
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Modal Step 2: Admin Invite Selection */}
            {modalState === 'SELECT_ADMINS' && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/40 backdrop-blur-[1px]">
                    <div className="w-[500px] bg-white rounded-md shadow-2xl overflow-hidden border border-gray-300">
                        <div className="bg-[#6482a2] px-4 py-2.5 flex items-center justify-center relative">
                            <h4 className="text-[14px] font-bold text-white">Info</h4>
                            <button onClick={() => setModalState('NONE')} className="absolute right-4 text-white hover:text-gray-200">
                                <X size={16} />
                            </button>
                        </div>
                        <div className="p-6 space-y-4">
                            <p className="text-[15px] font-medium text-gray-800">Select Group Admins to send invite link:</p>
                            <div className="space-y-3 pl-2">
                                <label className="flex items-start gap-3 cursor-pointer group">
                                    <input
                                        type="checkbox"
                                        defaultChecked
                                        className="mt-1 h-3.5 w-3.5 border-gray-300 rounded text-blue-600 focus:ring-blue-500"
                                    />
                                    <div className="flex flex-col">
                                        <span className="text-[14px] text-gray-800 font-medium">
                                            {corporate.contacts?.[0]
                                                ? `${corporate.contacts[0].firstName} ${corporate.contacts[0].lastName}`
                                                : "Corporate Executive"}
                                        </span>
                                        <span className="text-[14px] text-gray-600 font-medium font-mono">
                                            &#123;{corporate.contacts?.[0]?.email || corporate.contactEmail || "admin@example.com"}&#125;
                                        </span>
                                    </div>
                                </label>
                            </div>
                        </div>
                        <div className="px-6 py-4 flex justify-end bg-white border-t border-gray-100">
                            <button
                                onClick={() => setModalState('SUCCESS')}
                                className="bg-[#74849c] text-white rounded px-6 py-2 text-[12px] font-bold hover:bg-slate-600 transition-all shadow-sm"
                            >
                                Confirm
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Modal Step 3: Success Message */}
            {modalState === 'SUCCESS' && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/40 backdrop-blur-[1px]">
                    <div className="w-[450px] bg-white rounded shadow-2xl overflow-hidden border border-gray-300">
                        <div className="bg-[#1e3a5f] px-4 py-3 flex justify-center">
                            <h4 className="text-[14px] font-bold text-white">Info</h4>
                        </div>
                        <div className="p-10 flex flex-col items-center justify-center space-y-8">
                            <p className="text-[15px] font-bold text-gray-600 text-center leading-relaxed">
                                Corporate Profile created and sent to Corporate <br /> Plan Administrators for approval
                            </p>
                            <button
                                onClick={() => setSetupStage("OVERVIEW")}
                                className="px-6 py-2 bg-[#042c5c] rounded text-[12px] font-black text-white shadow-md hover:bg-slate-800 transition-all uppercase"
                            >
                                OK
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
