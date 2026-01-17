"use client";

import { useCorporateEngine } from "./useCorporateEngine";
import { Edit2, Copy, FileText, Info } from "lucide-react";

export function CorporateOverview({ engine }: { engine: ReturnType<typeof useCorporateEngine> }) {
    const { corporate, setSetupStage } = engine;

    const Card = ({ title, onEdit, children, hasImage, imageUrl }: any) => (
        <div className="flex flex-col rounded border border-gray-300 bg-white overflow-hidden shadow-sm h-full">
            <div className="bg-[#1e3a5f] px-3 py-1.5 flex items-center justify-between">
                <h3 className="text-[11px] font-bold text-white uppercase tracking-wider">{title}</h3>
                {onEdit && (
                    <button onClick={onEdit} className="bg-white/10 p-0.5 rounded hover:bg-white/20 transition-colors">
                        <Edit2 className="h-3 w-3 text-white" />
                    </button>
                )}
            </div>
            <div className="flex-1 p-4 relative min-h-[160px]">
                {hasImage && imageUrl && (
                    <div className="absolute inset-0 z-0 opacity-40">
                        <img src={imageUrl} alt="" className="w-full h-full object-cover" />
                    </div>
                )}
                <div className="relative z-10 h-full flex flex-col">
                    {children}
                </div>
            </div>
        </div>
    );

    return (
        <div className="bg-[#f0f2f5] min-h-screen p-4 space-y-4">
            {/* Main Header */}
            <div className="bg-[#1e3a5f] rounded px-4 py-2 flex items-center justify-between shadow-md">
                <h2 className="text-sm font-semibold text-white uppercase tracking-wider">Overview</h2>
                <button onClick={() => setSetupStage("CORPORATE_INFO")} className="bg-white text-[#1e3a5f] px-3 py-0.5 rounded text-[10px] font-bold hover:bg-gray-100 transition-all uppercase">
                    Edit
                </button>
            </div>

            {/* Grid Layout - 4 columns */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">

                {/* 1. Corporate Information */}
                <Card title="Corporate Information" onEdit={() => setSetupStage("CORPORATE_INFO")} hasImage imageUrl="https://images.unsplash.com/photo-1497366216548-37526070297c?auto=format&fit=crop&q=80&w=400">
                    <div className="space-y-4">
                        <div className="flex items-center gap-2">
                            <a href="#" className="text-blue-600 underline text-[10px] font-bold">Plan Administrator Portal</a>
                            <Copy className="h-3.5 w-3.5 text-gray-500 cursor-pointer" />
                        </div>
                        <div className="space-y-2 mt-2">
                            <div className="flex items-center gap-2 text-gray-600">
                                <div className="p-1 rounded bg-gray-100"><FileText size={12} /></div>
                                <span className="text-[10px] font-medium italic">General Info</span>
                            </div>
                        </div>
                    </div>
                </Card>

                {/* 2. Invoices */}
                <Card title="Invoices" hasImage imageUrl="https://images.unsplash.com/photo-1450101499163-c8848c66ca85?auto=format&fit=crop&q=80&w=400">
                    <div className="h-full flex items-center justify-center">
                        <p className="text-[10px] font-bold text-gray-500 uppercase tracking-tight">No Invoices Available</p>
                    </div>
                </Card>

                {/* 3. Plans */}
                <Card title="Plans" onEdit={() => setSetupStage("TIERS")} hasImage imageUrl="https://images.unsplash.com/photo-1576091160550-217359f41f48?auto=format&fit=crop&q=80&w=400">
                    <div className="space-y-4">
                        <div className="flex items-center gap-2">
                            <a href="#" className="text-blue-600 underline text-[10px] font-bold">Enrollment Link</a>
                            <Copy className="h-3.5 w-3.5 text-gray-500 cursor-pointer" />
                        </div>
                        <div className="mt-2">
                            <p className="text-[10px] font-bold text-gray-600 uppercase">Plans:</p>
                        </div>
                    </div>
                </Card>

                {/* 4. Employees */}
                <Card title="Employees">
                    <div className="h-full flex items-center justify-center">
                        <p className="text-[10px] font-bold text-gray-400 uppercase tracking-tight">No Data Available</p>
                    </div>
                </Card>

                {/* 5. Corporate Tier Plans */}
                <Card title="Corporate Tier Plans">
                    <div className="h-full flex items-center justify-center">
                        <p className="text-[10px] font-bold text-gray-400 uppercase tracking-tight">No Data Available</p>
                    </div>
                </Card>

                {/* 6. Wallet Information */}
                <Card title="Wallet Information">
                    <div className="h-full flex items-center justify-center">
                        <p className="text-[10px] font-bold text-gray-400 uppercase tracking-tight">No Data Available</p>
                    </div>
                </Card>

                {/* 7. Settings */}
                <Card title="Settings" onEdit={() => setSetupStage("CORPORATE_INFO")} hasImage imageUrl="https://images.unsplash.com/photo-1506784919140-505436d9f161?auto=format&fit=crop&q=80&w=400">
                    <div className="space-y-1 mt-auto bg-white/60 p-2 rounded">
                        <div className="flex justify-between text-[9px] font-bold text-gray-700">
                            <span>Wait time</span>
                            <span> Months</span>
                        </div>
                        <div className="flex justify-between text-[9px] font-bold text-gray-700">
                            <span>Wait time for initial enrollment</span>
                            <span>None</span>
                        </div>
                        <div className="flex justify-between text-[9px] font-bold text-gray-700">
                            <span>Payment method</span>
                        </div>
                        <div className="flex justify-between text-[9px] font-bold text-gray-700">
                            <span>Show employer name for enrollment</span>
                            <span>No</span>
                        </div>
                        <div className="flex justify-between text-[9px] font-bold text-gray-700">
                            <span>Create classification tiers of coverage</span>
                            <span>No</span>
                        </div>
                    </div>
                </Card>

                {/* 8. Advisor Information */}
                <Card title="Advisor Information" hasImage imageUrl="https://images.unsplash.com/photo-1551836022-d5d88e9218df?auto=format&fit=crop&q=80&w=400">
                    <div className="h-full flex items-end">
                        {/* This mimics the brochure appearance */}
                        <div className="w-full h-20 bg-gradient-to-r from-blue-100 to-indigo-100 rounded border border-blue-200 flex items-center justify-center text-[10px] font-bold text-blue-800 uppercase italic">
                            Corporate Benefits Brochure
                        </div>
                    </div>
                </Card>
            </div>
        </div>
    );
}
