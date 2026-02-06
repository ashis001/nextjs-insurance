"use client";

import { useCorporateEngine } from "./useCorporateEngine";
import { ChevronLeft, ChevronRight, X, Check, MousePointer2, Info } from "lucide-react";
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

    // Calculate setup percentage
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

    useEffect(() => {
        const guideStep = localStorage.getItem("max_guide_step");

        if (guideStep === "setup_status" && isWorkflowActive && !hasStartedRef.current) {
            hasStartedRef.current = true;

            const runGuide = async () => {
                try {
                    console.log("🚀 Starting Setup Status workflow");
                    await delay(2000);

                    // ========== STEP 1: Indicate and Click "Next" Button ==========
                    console.log("Step 1: Indicating Next button");
                    setActiveFillingField("setup-next-btn");

                    await delay(800);
                    const nextBtn = document.getElementById("setup-next-btn");
                    if (nextBtn) {
                        const rect = nextBtn.getBoundingClientRect();
                        setPointerPos({
                            top: rect.top + rect.height / 2 - 40,
                            left: rect.left + rect.width / 2
                        });
                    }

                    const msg1 = "Excellent. Everything looks perfect. Now, please click the Next button to finalize the setup.";
                    openChat(msg1);
                    await speakText(msg1);
                    await delay(1800);

                    // Click Next button
                    console.log("Clicking Next button");
                    setModalState('SELECT_SUBDOMAIN');
                    setActiveFillingField(null);
                    setPointerPos(null);
                    await delay(1200);

                    // ========== STEP 2: Indicate and Select Subdomain ==========
                    console.log("Step 2: Indicating subdomain radio");
                    setActiveFillingField("subdomain-0");

                    await delay(800);
                    const subdomainRadio = document.getElementById("subdomain-0");
                    if (subdomainRadio) {
                        const rect = subdomainRadio.getBoundingClientRect();
                        setPointerPos({
                            top: rect.top + rect.height / 2 - 40,
                            left: rect.left + rect.width / 2
                        });
                    }

                    const msg2 = "Here you can see the list of available subdomains. I'll select the recommended one for your insurance portal.";
                    openChat(msg2);
                    await speakText(msg2);
                    await delay(1800);

                    // Select subdomain
                    console.log("Selecting subdomain");
                    setSelectedSubdomain(subdomainOptions[0]);
                    setActiveFillingField(null);
                    setPointerPos(null);
                    await delay(1200);

                    // ========== STEP 3: Indicate and Click "Confirm" Button (Subdomain) ==========
                    console.log("Step 3: Indicating Confirm button for subdomain");
                    setActiveFillingField("subdomain-confirm-btn");

                    await delay(800);
                    const confirmBtn1 = document.getElementById("subdomain-confirm-btn");
                    if (confirmBtn1) {
                        const rect = confirmBtn1.getBoundingClientRect();
                        setPointerPos({
                            top: rect.top + rect.height / 2 - 40,
                            left: rect.left + rect.width / 2
                        });
                    }

                    const msg3 = "Perfect. Now I'll click the Confirm button to save this subdomain selection.";
                    openChat(msg3);
                    await speakText(msg3);
                    await delay(1800);

                    // Click Confirm
                    console.log("Clicking Confirm button");
                    setModalState('SELECT_ADMINS');
                    setActiveFillingField(null);
                    setPointerPos(null);
                    await delay(1200);

                    // ========== STEP 4: Indicate and Click "Confirm" Button (Admins) ==========
                    console.log("Step 4: Indicating Confirm button for admins");
                    setActiveFillingField("admins-confirm-btn");

                    await delay(800);
                    const confirmBtn2 = document.getElementById("admins-confirm-btn");
                    if (confirmBtn2) {
                        const rect = confirmBtn2.getBoundingClientRect();
                        setPointerPos({
                            top: rect.top + rect.height / 2 - 40,
                            left: rect.left + rect.width / 2
                        });
                    }

                    const msg4 = "Now I'll send the invite links to the group administrators by clicking Confirm.";
                    openChat(msg4);
                    await speakText(msg4);
                    await delay(1800);

                    // Click Confirm
                    console.log("Clicking Confirm button for admins");
                    setModalState('SUCCESS');
                    setActiveFillingField(null);
                    setPointerPos(null);
                    await delay(1200);

                    // ========== STEP 5: Indicate and Click "OK" Button ==========
                    console.log("Step 5: Indicating OK button");
                    setActiveFillingField("final-ok-btn");

                    await delay(800);
                    const okBtn = document.getElementById("final-ok-btn");
                    if (okBtn) {
                        const rect = okBtn.getBoundingClientRect();
                        setPointerPos({
                            top: rect.top + rect.height / 2 - 40,
                            left: rect.left + rect.width / 2
                        });
                    }

                    const msg5 = "Congratulations! The corporate profile has been successfully created and sent for approval. I'll click OK to proceed.";
                    openChat(msg5);
                    await speakText(msg5);
                    await delay(2000);

                    // Click OK and navigate
                    console.log("✅ Setup Status workflow complete - navigating to Overview");
                    localStorage.removeItem("max_guide_step");
                    setIsWorkflowActive(false);
                    setActiveFillingField(null);
                    setPointerPos(null);
                    setSetupStage("OVERVIEW");

                } catch (e: any) {
                    console.error("❌ Setup status workflow error:", e);
                    if (e.message === "WorkflowCancelled") {
                        console.log("Setup status workflow cancelled");
                    }
                    hasStartedRef.current = false;
                }
            };

            runGuide();
        }
    }, [isWorkflowActive, subdomainOptions, openChat, setIsWorkflowActive, setSetupStage]);

    const SemiCircleGauge = ({ value, label, color = "#22c55e", percentage = 0 }: { value: string | number, label: string, color?: string, percentage?: number }) => {
        return (
            <div className="flex flex-col items-center justify-center p-10 bg-white flex-1 transition-all hover:bg-slate-50 relative group">
                <div className="relative w-56 h-32 flex items-center justify-center overflow-hidden">
                    <svg viewBox="0 0 100 60" className="w-full h-full transform translate-y-4">
                        <path
                            d="M 10 50 A 40 40 0 0 1 90 50"
                            fill="none"
                            stroke="#f1f5f9"
                            strokeWidth="10"
                            strokeLinecap="round"
                        />
                        <path
                            d="M 10 50 A 40 40 0 0 1 90 50"
                            fill="none"
                            stroke={color}
                            strokeWidth="10"
                            strokeDasharray="125.6"
                            strokeDashoffset={125.6 * (1 - percentage / 100)}
                            strokeLinecap="round"
                            className="transition-all duration-1000 ease-out"
                        />
                    </svg>
                    <div className="absolute bottom-4 flex flex-col items-center">
                        <span className="text-4xl font-black text-[#0a1e3b]">{value}</span>
                        {label === "Overall Status" && <span className="text-[10px] text-gray-400 font-black -mt-1">%</span>}
                    </div>
                </div>
                <p className="mt-8 text-[11px] font-black text-slate-400 uppercase tracking-[0.2em]">{label}</p>
                <div className="absolute top-4 right-4 text-slate-200">
                    <Info size={16} />
                </div>
            </div>
        );
    };

    return (
        <div className="space-y-0 relative">
            {/* Guidance Progress Bar */}
            {isWorkflowActive && (
                <div className="absolute top-0 left-0 w-full h-1 bg-gray-100 rounded-t-xl overflow-hidden z-[100]">
                    <div
                        className="h-full bg-blue-500 transition-all duration-1000 ease-out"
                        style={{
                            width: activeFillingField === "final-ok-btn" ? "100%" :
                                activeFillingField === "admins-confirm-btn" ? "80%" :
                                    activeFillingField === "subdomain-confirm-btn" ? "60%" :
                                        activeFillingField && activeFillingField.startsWith("subdomain-") ? "40%" :
                                            activeFillingField === "setup-next-btn" ? "20%" : "0%"
                        }}
                    />
                </div>
            )}
            {/* Header Navy Bar */}
            <div className="bg-[#0a1e3b] px-4 py-2.5 rounded-t-xl flex items-center justify-between">
                <h2 className="text-xs font-black uppercase tracking-widest text-white/90">Setup Status</h2>
            </div>

            {/* Content Area - White background with padding to match other pages */}
            <div className="bg-white p-6 border-x border-b border-gray-100 min-h-[400px] flex items-center justify-center">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-8 w-full max-w-6xl">
                    <div className="bg-white rounded-2xl shadow-xl shadow-slate-200/50 border border-slate-100 overflow-hidden transform transition-all hover:scale-[1.02]">
                        <SemiCircleGauge
                            value={setupPercentage}
                            label="Overall Status"
                            percentage={setupPercentage}
                            color="#10b981"
                        />
                    </div>
                    <div className="bg-white rounded-2xl shadow-xl shadow-slate-200/50 border border-slate-100 overflow-hidden transform transition-all hover:scale-[1.02]">
                        <SemiCircleGauge
                            value="--"
                            label="Employees Enrolled"
                            percentage={0}
                            color="#3b82f6"
                        />
                    </div>
                    <div className="bg-white rounded-2xl shadow-xl shadow-slate-200/50 border border-slate-100 overflow-hidden transform transition-all hover:scale-[1.02]">
                        <SemiCircleGauge
                            value="$ 0"
                            label="Expected Premium"
                            percentage={0}
                            color="#8b5cf6"
                        />
                    </div>
                </div>
            </div>

            {/* Footer Buttons */}
            <div className="flex justify-between pt-8">
                <button
                    onClick={() => setSetupStage("TIERS")}
                    className="flex items-center gap-1.5 rounded-xl border border-slate-200 bg-white px-6 py-2.5 text-xs font-bold text-slate-700 hover:bg-slate-50 transition-all hover:-translate-y-0.5"
                >
                    <ChevronLeft className="h-4 w-4" /> Previous
                </button>
                <button
                    id="setup-next-btn"
                    onClick={() => setModalState('SELECT_SUBDOMAIN')}
                    className={clsx(
                        "flex items-center gap-2 rounded-xl bg-[#0a1e3b] px-8 py-2.5 text-xs font-bold text-white shadow-lg shadow-blue-900/20 transition-all uppercase tracking-wide",
                        activeFillingField === "setup-next-btn" ? "ring-4 ring-blue-500/50 scale-105 shadow-2xl z-50" : "hover:bg-blue-900 hover:-translate-y-0.5"
                    )}
                >
                    Next <ChevronRight className="h-4 w-4" />
                </button>
            </div>

            {modalState === 'SELECT_SUBDOMAIN' && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/40 backdrop-blur-[1px]">
                    <div className="w-[500px] bg-white rounded-xl shadow-2xl overflow-hidden border border-gray-200">
                        <div className="bg-[#0a1e3b] px-4 py-3 flex items-center justify-center relative">
                            <h4 className="text-xs font-bold text-white uppercase tracking-widest">Info</h4>
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

            {modalState === 'SELECT_ADMINS' && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/40 backdrop-blur-[1px]">
                    <div className="w-[500px] bg-white rounded-xl shadow-2xl overflow-hidden border border-gray-200">
                        <div className="bg-[#0a1e3b] px-4 py-3 flex items-center justify-center relative">
                            <h4 className="text-xs font-bold text-white uppercase tracking-widest">Info</h4>
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

            {modalState === 'SUCCESS' && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/40 backdrop-blur-[1px]">
                    <div className="w-[480px] bg-white rounded-xl shadow-2xl overflow-hidden border border-gray-200">
                        <div className="bg-[#0a1e3b] px-4 py-3 flex items-center justify-center relative">
                            <h4 className="text-xs font-bold text-white uppercase tracking-widest">Info</h4>
                        </div>
                        <div className="p-10 flex flex-col items-center justify-center space-y-8">
                            <p className="text-[15px] font-bold text-gray-600 text-center leading-relaxed">
                                Corporate Profile created and sent to Corporate <br /> Plan Administrators for approval
                            </p>
                            <button
                                id="final-ok-btn"
                                onClick={() => {
                                    setSetupStage("OVERVIEW");
                                    localStorage.removeItem("max_guide_step");
                                    setIsWorkflowActive(false);
                                }}
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
