"use client";

import { useCorporateEngine } from "./useCorporateEngine";
import { Tier } from "@/lib/types";
import { Trash2, Edit2, Info, Plus, ChevronLeft, ChevronRight, AlertCircle, Copy } from "lucide-react";
import { useState } from "react";
import { TierEditorPanel } from "./TierEditorPanel";
import clsx from "clsx";

export function TierTable({ engine }: { engine: ReturnType<typeof useCorporateEngine> }) {
    const { corporate, attemptAdvance, setSetupStage } = engine;
    const [editingTierId, setEditingTierId] = useState<string | null>(null);

    const hasValidTier = corporate.tiers.some(t => t.isValid && t.status === "Active");
    const editingTier = editingTierId ? corporate.tiers.find(t => t.id === editingTierId) : null;

    const handleAddTier = () => {
        const newId = engine.addTier();
        setEditingTierId(newId);
    };

    return (
        <div className="space-y-0">
            {editingTier && (
                <TierEditorPanel
                    tier={editingTier}
                    onSave={(updates: Partial<Tier>) => {
                        engine.updateTier(editingTier.id, updates);
                        setEditingTierId(null);
                    }}
                    onCancel={() => {
                        // If it's a new empty tier, we might want to remove it if cancelled, 
                        // but for now let's just close as per standard behavior.
                        setEditingTierId(null);
                    }}
                />
            )}
            {/* Header Navy Bar */}
            <div className="bg-[#1e3a5f] px-4 py-2 flex items-center justify-between">
                <h2 className="text-sm font-semibold text-white">Manage Tiers</h2>
                <button
                    onClick={handleAddTier}
                    className="flex items-center gap-1 bg-white text-[#1e3a5f] px-2 py-0.5 rounded text-xs font-bold hover:bg-gray-100 transition-colors"
                >
                    <Plus className="h-3 w-3" /> Add Tier
                </button>
            </div>

            <div className="bg-white p-4">
                {!hasValidTier && (
                    <div className="flex items-center gap-2 rounded bg-red-50 p-3 text-red-600 mb-4">
                        <AlertCircle className="h-4 w-4" />
                        <p className="text-xs font-medium">Please configure at least one active tier with plans to proceed.</p>
                    </div>
                )}

                <div className="border border-gray-200 overflow-hidden">
                    <table className="w-full text-left text-xs bg-white">
                        <thead className="bg-[#1e3a5f] text-white">
                            <tr>
                                <th className="px-3 py-2 border-r border-gray-600 font-medium whitespace-nowrap text-[10px] uppercase tracking-wider">S.no</th>
                                <th className="px-3 py-2 border-r border-gray-600 font-medium text-[10px] uppercase tracking-wider">Tier Name</th>
                                <th className="px-3 py-2 border-r border-gray-600 font-medium whitespace-nowrap text-[10px] uppercase tracking-wider">Time of Service</th>
                                <th className="px-3 py-2 border-r border-gray-600 font-medium whitespace-nowrap text-[10px] uppercase tracking-wider text-center">Member Count</th>
                                <th className="px-3 py-2 border-r border-gray-600 font-medium whitespace-nowrap text-[10px] uppercase tracking-wider text-center">Plans</th>
                                <th className="px-3 py-2 border-r border-gray-600 font-medium whitespace-nowrap text-[10px] uppercase tracking-wider text-center">Link</th>
                                <th className="px-3 py-2 border-r border-gray-600 font-medium whitespace-nowrap text-[10px] uppercase tracking-wider text-center">Wallet</th>
                                <th className="px-3 py-2 border-r border-gray-600 font-medium whitespace-nowrap text-[10px] uppercase tracking-wider text-center">Status</th>
                                <th className="px-3 py-2 font-medium text-[10px] uppercase tracking-wider text-center">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-200 text-gray-700">
                            {corporate.tiers.map((tier, index) => {
                                const allPlans = [
                                    ...tier.plans.corporate,
                                    ...tier.plans.core,
                                    ...tier.plans.upgrade,
                                    ...tier.plans.voluntary
                                ];

                                return (
                                    <tr key={tier.id} className="hover:bg-slate-50 border-b border-gray-200 align-top">
                                        <td className="px-3 py-3 border-r border-gray-200 text-center font-medium">{index + 1}</td>
                                        <td className="px-3 py-3 border-r border-gray-200 font-bold text-gray-800">{tier.name || `Tier${index + 1}`}</td>
                                        <td className="px-3 py-3 border-r border-gray-200">
                                            {tier.lengthOfService === "0 Months" || tier.lengthOfService === "No" ? "None" : tier.lengthOfService}
                                        </td>
                                        <td className="px-3 py-3 border-r border-gray-200 text-center">
                                            <span className="text-blue-600 underline cursor-pointer font-bold">0</span>
                                        </td>
                                        <td className="px-3 py-3 border-r border-gray-200 max-w-[300px]">
                                            {allPlans.length === 0 ? (
                                                <div className="text-center font-medium uppercase text-gray-500">NA</div>
                                            ) : (
                                                <div className="space-y-0.5 text-[11px] leading-tight flex flex-col items-center">
                                                    {allPlans.map((p, idx) => (
                                                        <div key={idx} className="font-medium text-gray-600">
                                                            {p.name} {p.variant && `- ${p.variant}`}
                                                        </div>
                                                    ))}
                                                </div>
                                            )}
                                        </td>
                                        <td className="px-3 py-3 border-r border-gray-200 text-center">
                                            {allPlans.length > 0 ? (
                                                <div className="flex items-center justify-center gap-1.5 group">
                                                    <span className="text-blue-600 underline text-[10px] font-medium cursor-pointer">Enrollment Link</span>
                                                    <div className="h-4 w-4 border border-gray-200 rounded flex items-center justify-center bg-gray-100 shadow-sm cursor-pointer hover:bg-gray-200">
                                                        <Copy size={10} className="text-gray-600" />
                                                    </div>
                                                </div>
                                            ) : (
                                                <div className="font-medium uppercase text-gray-500">NA</div>
                                            )}
                                        </td>
                                        <td className="px-3 py-3 border-r border-gray-200 text-center">
                                            <span className="text-blue-600 underline cursor-pointer font-bold">No</span>
                                        </td>
                                        <td className="px-3 py-3 border-r border-gray-200 text-center">
                                            <span className={clsx(
                                                "font-bold",
                                                tier.status === "Active" ? "text-gray-800" : "text-gray-400"
                                            )}>
                                                {tier.status}
                                            </span>
                                        </td>
                                        <td className="px-3 py-3">
                                            <div className="flex items-center gap-3 justify-center">
                                                <button
                                                    onClick={() => engine.deleteTier(tier.id)}
                                                    className="text-red-500 hover:text-red-700 transition-colors" title="Delete"
                                                >
                                                    <Trash2 className="h-3.5 w-3.5" />
                                                </button>
                                                <button
                                                    onClick={() => setEditingTierId(tier.id)}
                                                    className="text-green-600 hover:text-green-800 transition-colors"
                                                    title="Edit"
                                                >
                                                    <Edit2 className="h-3.5 w-3.5" />
                                                </button>
                                                <button className="text-[#a855f7] hover:text-[#9333ea] transition-colors" title="Info">
                                                    <Info className="h-3.5 w-3.5" />
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                );
                            })}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Footer Buttons */}
            <div className="fixed bottom-4 left-64 right-6 px-4 flex justify-between bg-white/80 backdrop-blur-sm py-2">
                <button
                    onClick={() => setSetupStage("CORPORATE_INFO")}
                    className="flex items-center gap-1 rounded bg-[#1e3a5f] px-3 py-1.5 text-xs font-bold text-white shadow hover:bg-slate-800 transition-all active:scale-95"
                >
                    <ChevronLeft className="h-3 w-3" /> Previous
                </button>
                <button
                    onClick={() => attemptAdvance()}
                    className="flex items-center gap-1 rounded bg-[#1e3a5f] px-3 py-1.5 text-xs font-bold text-white shadow hover:bg-slate-800 transition-all active:scale-95"
                >
                    Next <ChevronRight className="h-3 w-3" />
                </button>
            </div>
        </div>
    );
}
