"use client";

import { Sidebar } from "../corporate-customers/[id]/_components/Sidebar";
import { Search, Filter, Download, Plus, Users, Sparkles } from "lucide-react";
import { useState, useEffect } from "react";
import { useChat } from "@/context/ChatContext";

const ALL_MEMBERS = [
    { id: "MEM-001", name: "John Smith", corporate: "Acme Corp Inc.", plan: "Gold Plan", coverage: "Family", status: "Active", joined: "Oct 12, 2024" },
    { id: "MEM-002", name: "Emily Davis", corporate: "TechFlow Solutions", plan: "Silver Plan", coverage: "Single", status: "Active", joined: "Sep 28, 2024" },
    { id: "MEM-003", name: "Michael Brown", corporate: "Acme Corp Inc.", plan: "Gold Plan", coverage: "Family", status: "Pending", joined: "Oct 25, 2024" },
    { id: "MEM-004", name: "Lisa Wilson", corporate: "Global Logistics", plan: "Platinum Plan", coverage: "Couple", status: "Active", joined: "Aug 15, 2024" },
    { id: "MEM-005", name: "James Taylor", corporate: "TechFlow Solutions", plan: "Silver Plan", coverage: "Single", status: "Suspended", joined: "Jan 10, 2024" },
    { id: "MEM-006", name: "Sophia Martinez", corporate: "Starlight Media", plan: "Basic Plan", coverage: "Single", status: "Active", joined: "Oct 01, 2024" },
];

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

export default function MembersPage() {
    const { toggleChat } = useChat();
    const [searchTerm, setSearchTerm] = useState("");
    const [mounted, setMounted] = useState(false);

    useEffect(() => {
        setMounted(true);
    }, []);

    // Member Search Logic
    const filteredMembers = ALL_MEMBERS.filter(member =>
        member.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        member.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
        member.corporate.toLowerCase().includes(searchTerm.toLowerCase())
    );

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
                        <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Members</h1>
                        <p className="text-xs text-slate-500 font-medium">Employee enrollment & coverage details</p>
                    </div>
                    <div className="flex items-center gap-3">
                        <button
                            onClick={toggleChat}
                            className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-xl shadow-lg shadow-blue-500/20 hover:shadow-blue-500/40 transition-all hover:-translate-y-0.5 font-bold text-xs">
                            <Sparkles className="w-4 h-4" />
                            Ask Max
                        </button>
                    </div>
                </header>

                <div className="relative z-10 p-8 space-y-6 animate-fade-in">
                    {/* Controls Bar */}
                    <div className="flex justify-between items-center bg-white/50 backdrop-blur-sm p-4 rounded-2xl border border-slate-200 shadow-sm">
                        <div className="flex gap-4 flex-1">
                            <div className="relative max-w-md w-full group">
                                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400 group-focus-within:text-blue-600 transition-colors" />
                                <input
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                    placeholder="Search members by name, ID, or company..."
                                    className="w-full rounded-xl border border-slate-300 pl-10 pr-4 py-2 text-sm focus:border-blue-500 focus:outline-none bg-white font-medium placeholder:text-slate-400 focus:ring-4 focus:ring-blue-500/10 transition-all shadow-sm"
                                />
                            </div>
                        </div>
                        <div>
                            <button className="flex items-center gap-2 rounded-xl bg-[#0a1e3b] px-5 py-2.5 text-xs font-bold text-white hover:bg-blue-900 shadow-lg shadow-blue-900/20 hover:shadow-xl hover:-translate-y-0.5 transition-all duration-300">
                                <Plus className="h-4 w-4" />
                                Add Member
                            </button>
                        </div>
                    </div>

                    {/* Main Table Card */}
                    <div className="bg-white/90 backdrop-blur-xl rounded-2xl border border-slate-300 shadow-[0_20px_50px_rgba(0,0,0,0.05)] overflow-hidden">
                        <div className="bg-[#0a1e3b] px-6 py-4 flex justify-between items-center">
                            <div className="flex items-center gap-3">
                                <div className="p-2 bg-white/10 rounded-lg backdrop-blur-md">
                                    <Users className="w-4 h-4 text-blue-400" />
                                </div>
                                <h3 className="text-sm font-bold text-white">Enrolled Members</h3>
                            </div>
                            <span className="text-[10px] font-bold text-blue-200 bg-blue-900/50 px-3 py-1 rounded-full border border-blue-800">{filteredMembers.length} Members</span>
                        </div>
                        <div className="bg-white">
                            <table className="w-full text-left text-sm">
                                <thead>
                                    <tr className="border-b border-slate-100 bg-slate-50/50">
                                        <th className="px-6 py-4 font-bold text-[10px] uppercase tracking-widest text-slate-500">Member ID</th>
                                        <th className="px-6 py-4 font-bold text-[10px] uppercase tracking-widest text-slate-500">Name</th>
                                        <th className="px-6 py-4 font-bold text-[10px] uppercase tracking-widest text-slate-500">Corporation</th>
                                        <th className="px-6 py-4 font-bold text-[10px] uppercase tracking-widest text-slate-500">Plan</th>
                                        <th className="px-6 py-4 font-bold text-[10px] uppercase tracking-widest text-slate-500">Coverage</th>
                                        <th className="px-6 py-4 font-bold text-[10px] uppercase tracking-widest text-slate-500">Joined Date</th>
                                        <th className="px-6 py-4 font-bold text-[10px] uppercase tracking-widest text-slate-500">Status</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-50">
                                    {filteredMembers.length > 0 ? (
                                        filteredMembers.map((member) => (
                                            <tr key={member.id} className="group hover:bg-slate-50 transition-colors duration-200">
                                                <td className="px-6 py-4 font-mono text-[10px] font-bold text-slate-400">{member.id}</td>
                                                <td className="px-6 py-4 font-medium text-slate-900">
                                                    <div className="flex items-center gap-3">
                                                        <div className="h-8 w-8 rounded-lg bg-slate-100 flex items-center justify-center text-slate-600 font-bold text-xs border border-slate-200 group-hover:scale-110 transition-transform duration-300">
                                                            {member.name.split(" ").map(n => n[0]).join("")}
                                                        </div>
                                                        <span className="font-bold group-hover:text-blue-600 transition-colors">{member.name}</span>
                                                    </div>
                                                </td>
                                                <td className="px-6 py-4 text-slate-600 font-medium">{member.corporate}</td>
                                                <td className="px-6 py-4">
                                                    <span className="inline-flex items-center justify-center px-2 py-1 rounded bg-blue-50 text-blue-700 font-bold text-[10px] border border-blue-100 uppercase tracking-wide">
                                                        {member.plan}
                                                    </span>
                                                </td>
                                                <td className="px-6 py-4 text-slate-600 font-medium">{member.coverage}</td>
                                                <td className="px-6 py-4 text-slate-500 font-medium">{member.joined}</td>
                                                <td className="px-6 py-4">
                                                    <span className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider border
                                                    ${member.status === "Active" ? "bg-emerald-50 text-emerald-700 border-emerald-200" :
                                                            member.status === "Pending" ? "bg-amber-50 text-amber-700 border-amber-200" :
                                                                "bg-red-50 text-red-700 border-red-200"}`}>
                                                        <div className={`w-1.5 h-1.5 rounded-full ${member.status === "Active" ? "bg-emerald-500" :
                                                            member.status === "Pending" ? "bg-amber-500" : "bg-red-500"
                                                            }`} />
                                                        {member.status}
                                                    </span>
                                                </td>
                                            </tr>
                                        ))
                                    ) : (
                                        <tr>
                                            <td colSpan={7} className="px-6 py-12 text-center text-slate-400">
                                                <div className="flex flex-col items-center justify-center">
                                                    <Search className="w-8 h-8 mb-3 opacity-50" />
                                                    <p className="text-sm font-medium">No members found.</p>
                                                </div>
                                            </td>
                                        </tr>
                                    )}
                                </tbody>
                            </table>
                            <div className="bg-slate-50/50 px-6 py-4 border-t border-slate-100 text-center text-xs font-bold text-slate-400 uppercase tracking-widest">
                                Showing {filteredMembers.length} records
                            </div>
                        </div>
                    </div>
                </div>
            </main>
            <style jsx global>{`
                @keyframes fade-in {
                  from { opacity: 0; }
                  to { opacity: 1; }
                }
                .animate-fade-in { animation: fade-in 0.6s ease-out forwards; }
            `}</style>
        </div>
    );
}
