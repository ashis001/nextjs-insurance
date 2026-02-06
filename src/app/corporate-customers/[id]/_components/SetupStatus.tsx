"use client";

import { useCorporateEngine } from "./useCorporateEngine";
import { ChevronLeft, ChevronRight, X, Check, MousePointer2 } from "lucide-react";
import { Tier } from "@/lib/types";
import { useState, useMemo, useEffect, useRef } from "react";
import { useChat } from "@/context/ChatContext";
import { speakText } from "@/lib/google-tts";
import clsx from "clsx";

export function SetupStatus({ engine }: { engine: ReturnType<typeof useCorporateEngine> }) {
    const { corporate, attemptAdvance, setSetupStage } = engine;

    const [modalState, setModalState] = useState<'NONE' | 'SELECT_SUBDOMAIN' | 'SELECT_ADMINS' | 'SUCCESS'>('NONE');
    const [selectedSubdomain, setSelectedSubdomain] = useState("");
    const { isWorkflowActive, openChat, setIsWorkflowActive } = useChat();
    const hasStartedRef = useRef(false);
    const [activeFillingField, setActiveFillingField] = useState<string | null>(null);
    const [pointerPos, setPointerPos] = useState<{ top: number, left: number } | null>(null);

    // Helper for guide
    const delay = (ms: number) => new Promise(res => setTimeout(res, ms));

    const fillField = async (id: string, speech: string, action: () => void) => {
        if (!isWorkflowActive) throw new Error("WorkflowCancelled");

        setActiveFillingField(id);
        const el = document.getElementById(id);
        if (el) {
            const rect = el.getBoundingClientRect();
            setPointerPos({
                top: rect.top + window.scrollY + rect.height / 2,
                left: rect.left + window.scrollX + rect.width / 2
            });
            el.scrollIntoView({ behavior: 'smooth', block: 'center' });
        }

        openChat(speech);
        await speakText(speech);
        await delay(800);
        action();
        await delay(1200);
        setActiveFillingField(null);
        setPointerPos(null);
    };

    useEffect(() => {
        const guideStep = localStorage.getItem("max_guide_step");
        if (guideStep === "setup_status" && isWorkflowActive && !hasStartedRef.current) {
            hasStartedRef.current = true;
            const runGuide = async () => {
                try {
                    await delay(1500);

                    // Step 1: Click Next to start finalization
                    await fillField("setup-next-btn", "Excellent. Everything looks perfect. Let's finalize the setup by configuring your corporate portal and admin access.", () => {
                        setModalState('SELECT_SUBDOMAIN');
                    });

                    // Step 2: Select Subdomain
                    await fillField("subdomain-0", "First, let's choose a subdomain for your insurance portal. I'll select the recommended one for you.", () => {
                        setSelectedSubdomain(subdomainOptions[0]);
                    });

                    // Step 3: Confirm Subdomain
                    await fillField("subdomain-confirm-btn", "Confirming the subdomain selection.", () => {
                        setModalState('SELECT_ADMINS');
                    });

                    // Step 4: Confirm Admins
                    await fillField("admins-confirm-btn", "Lastly, we'll send the invite links to the group administrators. Clicking confirm to finish.", () => {
                        setModalState('SUCCESS');
                    });

                    // Step 5: Final OK
                    await fillField("final-ok-btn", "Congratulations! The corporate profile has been successfully created and sent for approval.", () => {
                        setSetupStage("OVERVIEW");
                        localStorage.removeItem("max_guide_step");
                        setIsWorkflowActive(false);
                    });

                } catch (e: any) {
                    if (e.message === "WorkflowCancelled") {
                        console.log("Setup status workflow cancelled");
                    }
                }
            };
            runGuide();
        }
    }, [isWorkflowActive]);

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
                    id="setup-next-btn"
                    onClick={() => setModalState('SELECT_SUBDOMAIN')}
                    className={clsx(
                        "flex items-center gap-2 rounded bg-[#1e3a5f] px-4 py-2 text-xs font-bold text-white shadow transition-all active:scale-95 uppercase tracking-wide",
                        activeFillingField === "setup-next-btn" ? "ring-4 ring-blue-500/50 scale-110 shadow-xl" : "hover:bg-slate-800"
                    )}
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
                                            id={`subdomain-${subdomainOptions.indexOf(opt)}`}
                                            type="radio"
                                            name="subdomain"
                                            checked={selectedSubdomain === opt}
                                            onChange={() => setSelectedSubdomain(opt)}
                                            className={clsx(
                                                "h-4 w-4 border-gray-300 text-blue-600 focus:ring-blue-500 transition-all",
                                                activeFillingField === `subdomain-${subdomainOptions.indexOf(opt)}` && "ring-2 ring-blue-500 scale-125"
                                            )}
                                        />
                                        <span className={clsx(
                                            "text-[14px] transition-colors font-medium",
                                            selectedSubdomain === opt ? "text-blue-600 font-bold" : "text-gray-800 group-hover:text-blue-600"
                                        )}>{opt}</span>
                                    </label>
                                ))}
                            </div>
                        </div>
                        <div className="px-6 py-4 flex justify-end bg-white border-t border-gray-100">
                            <button
                                id="subdomain-confirm-btn"
                                onClick={() => setModalState('SELECT_ADMINS')}
                                className={clsx(
                                    "bg-[#0f2a4a] text-white rounded px-6 py-2 text-[12px] font-bold transition-all shadow-sm",
                                    activeFillingField === "subdomain-confirm-btn" ? "ring-4 ring-blue-500/50 scale-105 shadow-xl" : "hover:bg-slate-800"
                                )}
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
                                id="admins-confirm-btn"
                                onClick={() => setModalState('SUCCESS')}
                                className={clsx(
                                    "bg-[#74849c] text-white rounded px-6 py-2 text-[12px] font-bold transition-all shadow-sm",
                                    activeFillingField === "admins-confirm-btn" ? "ring-4 ring-blue-500/50 scale-105 shadow-xl" : "hover:bg-slate-600"
                                )}
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
                                id="final-ok-btn"
                                onClick={() => setSetupStage("OVERVIEW")}
                                className={clsx(
                                    "px-6 py-2 bg-[#042c5c] rounded text-[12px] font-black text-white shadow-md transition-all uppercase",
                                    activeFillingField === "final-ok-btn" ? "ring-4 ring-blue-500/50 scale-110 shadow-xl" : "hover:bg-slate-800"
                                )}
                            >
                                OK
                            </button>
                        </div>
                    </div>
                </div>
            )}
            {/* Guide Pointer */}
            {pointerPos && (
                <div
                    style={{
                        position: 'fixed',
                        top: pointerPos.top,
                        left: pointerPos.left,
                        transform: 'translate(-50%, -100%)',
                        pointerEvents: 'none',
                        zIndex: 10000
                    }}
                    className="transition-all duration-300 ease-out"
                >
                    <div className="relative flex flex-col items-center animate-nina-pointer-float">
                        <div className="text-red-500 filter drop-shadow-[0_4px_12px_rgba(239,68,68,0.4)] transform rotate-[225deg]">
                            <MousePointer2 className="w-6 h-6 fill-red-500" />
                        </div>
                        <div className="absolute inset-0 -m-1 rounded-full bg-red-500 animate-ping opacity-20 scale-125" />
                    </div>
                </div>
            )}

            <style jsx global>{`
                @keyframes nina-pointer-float {
                  0%, 100% { transform: translateY(0); }
                  50% { transform: translateY(-8px); }
                }
                .animate-nina-pointer-float {
                  animation: nina-pointer-float 1.5s ease-in-out infinite;
                }
            `}</style>
        </div>
    );
}
