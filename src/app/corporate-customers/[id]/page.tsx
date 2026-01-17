"use client";

import { useCorporateEngine } from "./_components/useCorporateEngine";
import { Sidebar } from "./_components/Sidebar";

// Components for stages
import { CorporateInfoForm } from "./_components/CorporateInfoForm";
import { TierTable } from "./_components/TierTable";
import { SetupStatus } from "./_components/SetupStatus";
import { SubdomainModal } from "./_components/SubdomainModal";
import { AdminInviteModal } from "./_components/AdminInviteModal";
import { CorporateOverview } from "./_components/CorporateOverview";

export default function CorporatePage({ params }: { params: { id: string } }) {
    const engine = useCorporateEngine(params.id);
    const { corporate } = engine;

    return (
        <div className="flex min-h-screen bg-gray-50">
            <Sidebar />

            <main className="flex-1 ml-64">
                {/* Header */}
                <header className="flex h-14 items-center justify-between border-b border-gray-200 bg-white px-6">
                    <div className="flex items-center gap-4">
                        <h1 className="text-lg font-semibold text-gray-900">Corporate Customers</h1>
                        <span className="text-gray-400">›</span>
                        <span className="text-sm text-gray-600">New Corporation</span>
                    </div>
                    <div className="flex items-center gap-4">
                        <select className="rounded border border-gray-300 px-3 py-1 text-sm">
                            <option>English</option>
                        </select>
                        <div className="text-sm">
                            <span className="text-gray-600">Welcome, </span>
                            <span className="font-medium">Ashish Broker</span>
                        </div>
                    </div>
                </header>

                {/* Stage Tabs */}
                <div className="border-b border-gray-200 bg-white">
                    <div className="flex gap-8 px-6">
                        <button className={`border-b-2 px-1 py-3 text-sm font-medium ${corporate.stage === "CORPORATE_INFO" ? "border-blue-600 text-blue-600" : "border-transparent text-gray-500 hover:text-gray-700"}`}>
                            CORPORATE INFO
                        </button>
                        <button className={`border-b-2 px-1 py-3 text-sm font-medium ${corporate.stage === "TIERS" ? "border-blue-600 text-blue-600" : "border-transparent text-gray-500 hover:text-gray-700"}`}>
                            TIERS
                        </button>
                        <button className={`border-b-2 px-1 py-3 text-sm font-medium ${corporate.stage === "SETUP_STATUS" ? "border-blue-600 text-blue-600" : "border-transparent text-gray-500 hover:text-gray-700"}`}>
                            SETUP STATUS
                        </button>
                        <button className={`border-b-2 px-1 py-3 text-sm font-medium ${corporate.stage === "OVERVIEW" ? "border-blue-600 text-blue-600" : "border-transparent text-gray-500 hover:text-gray-700"}`}>
                            OVERVIEW
                        </button>
                    </div>
                </div>

                {/* Content Area - NO WRAPPER, NO PADDING */}
                <div className="bg-gray-50 p-6">
                    {corporate.stage === "CORPORATE_INFO" && (
                        <CorporateInfoForm engine={engine} />
                    )}
                    {corporate.stage === "TIERS" && (
                        <TierTable engine={engine} />
                    )}
                    {corporate.stage === "SETUP_STATUS" && (
                        <SetupStatus engine={engine} />
                    )}
                    {corporate.stage === "SUBDOMAIN" && (
                        <SubdomainModal engine={engine} />
                    )}
                    {corporate.stage === "ADMINS" && (
                        <AdminInviteModal engine={engine} />
                    )}
                    {corporate.stage === "OVERVIEW" && (
                        <CorporateOverview engine={engine} />
                    )}
                </div>
            </main>
        </div>
    );
}
