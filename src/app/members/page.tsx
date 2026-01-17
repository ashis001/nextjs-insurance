"use client";

import { Sidebar } from "../corporate-customers/[id]/_components/Sidebar";
import { Search, Filter, Download, Plus } from "lucide-react";
import { useState } from "react";

const ALL_MEMBERS = [
    { id: "MEM-001", name: "John Smith", corporate: "Acme Corp Inc.", plan: "Gold Plan", coverage: "Family", status: "Active", joined: "Oct 12, 2024" },
    { id: "MEM-002", name: "Emily Davis", corporate: "TechFlow Solutions", plan: "Silver Plan", coverage: "Single", status: "Active", joined: "Sep 28, 2024" },
    { id: "MEM-003", name: "Michael Brown", corporate: "Acme Corp Inc.", plan: "Gold Plan", coverage: "Family", status: "Pending", joined: "Oct 25, 2024" },
    { id: "MEM-004", name: "Lisa Wilson", corporate: "Global Logistics", plan: "Platinum Plan", coverage: "Couple", status: "Active", joined: "Aug 15, 2024" },
    { id: "MEM-005", name: "James Taylor", corporate: "TechFlow Solutions", plan: "Silver Plan", coverage: "Single", status: "Suspended", joined: "Jan 10, 2024" },
    { id: "MEM-006", name: "Sophia Martinez", corporate: "Starlight Media", plan: "Basic Plan", coverage: "Single", status: "Active", joined: "Oct 01, 2024" },
];

export default function MembersPage() {
    const [searchTerm, setSearchTerm] = useState("");

    // Member Search Logic
    const filteredMembers = ALL_MEMBERS.filter(member =>
        member.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        member.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
        member.corporate.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <div className="flex min-h-screen bg-gray-50">
            <Sidebar />
            <main className="flex-1 ml-64">
                {/* Header matching Corporate Page */}
                <header className="flex h-14 items-center justify-between border-b border-gray-200 bg-white px-6">
                    <div className="flex items-center gap-4">
                        <h1 className="text-lg font-semibold text-gray-900">Members</h1>
                    </div>
                    <div className="flex items-center gap-4">
                        <div className="text-sm">
                            <span className="text-gray-600">Welcome, </span>
                            <span className="font-medium">Ashish Broker</span>
                        </div>
                    </div>
                </header>

                <div className="p-6 space-y-4">
                    {/* Toolbar */}
                    <div className="flex justify-between items-center bg-white p-3 rounded-lg border border-gray-200 shadow-sm">
                        <div className="flex gap-4 flex-1">
                            <div className="relative max-w-md w-full">
                                <Search className="absolute left-3 top-2 h-4 w-4 text-gray-400" />
                                <input
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                    placeholder="Search members by name, ID, or company..."
                                    className="w-full rounded border border-gray-300 pl-9 pr-4 py-1.5 text-sm focus:border-blue-500 focus:outline-none"
                                />
                            </div>
                            <button className="flex items-center gap-2 rounded border border-gray-300 bg-gray-50 px-4 py-1.5 text-sm font-medium text-gray-700 hover:bg-gray-100">
                                <Filter className="h-4 w-4" />
                                Filters
                            </button>
                            <button className="flex items-center gap-2 rounded border border-gray-300 bg-gray-50 px-4 py-1.5 text-sm font-medium text-gray-700 hover:bg-gray-100">
                                <Download className="h-4 w-4" />
                                Export
                            </button>
                        </div>
                        <div>
                            <button className="flex items-center gap-2 rounded bg-[#1e3a5f] px-4 py-1.5 text-sm font-semibold text-white hover:bg-[#2a4a75] shadow-sm">
                                <Plus className="h-4 w-4" />
                                Add Member
                            </button>
                        </div>
                    </div>

                    {/* Table Section with Navy Header */}
                    <div>
                        <div className="bg-[#1e3a5f] px-4 py-2 flex justify-between items-center text-white">
                            <h3 className="text-sm font-semibold">Enrolled Members</h3>
                            <span className="text-xs opacity-80">Total: {filteredMembers.length}</span>
                        </div>
                        <div className="bg-white border border-t-0 border-gray-200">
                            <table className="w-full text-left text-sm">
                                <thead className="bg-gray-50 text-gray-500 border-b border-gray-100">
                                    <tr>
                                        <th className="px-6 py-3 font-medium">Member ID</th>
                                        <th className="px-6 py-3 font-medium">Name</th>
                                        <th className="px-6 py-3 font-medium">Corporation</th>
                                        <th className="px-6 py-3 font-medium">Plan</th>
                                        <th className="px-6 py-3 font-medium">Coverage</th>
                                        <th className="px-6 py-3 font-medium">Joined Date</th>
                                        <th className="px-6 py-3 font-medium">Status</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-100">
                                    {filteredMembers.length > 0 ? (
                                        filteredMembers.map((member) => (
                                            <tr key={member.id} className="group hover:bg-gray-50">
                                                <td className="px-6 py-4 font-mono text-xs text-gray-500">{member.id}</td>
                                                <td className="px-6 py-4 font-medium text-gray-900">
                                                    <div className="flex items-center gap-3">
                                                        <div className="h-8 w-8 rounded-full bg-slate-100 flex items-center justify-center text-slate-600 font-semibold text-xs border border-slate-200">
                                                            {member.name.split(" ").map(n => n[0]).join("")}
                                                        </div>
                                                        {member.name}
                                                    </div>
                                                </td>
                                                <td className="px-6 py-4 text-gray-600">{member.corporate}</td>
                                                <td className="px-6 py-4 text-gray-900">{member.plan}</td>
                                                <td className="px-6 py-4 text-gray-600">{member.coverage}</td>
                                                <td className="px-6 py-4 text-gray-500">{member.joined}</td>
                                                <td className="px-6 py-4">
                                                    <span className={`inline-flex rounded-full px-2.5 py-0.5 text-xs font-medium border
                                    ${member.status === "Active" ? "bg-green-50 text-green-700 border-green-200" :
                                                            member.status === "Pending" ? "bg-yellow-50 text-yellow-700 border-yellow-200" :
                                                                "bg-red-50 text-red-700 border-red-200"}`}>
                                                        {member.status}
                                                    </span>
                                                </td>
                                            </tr>
                                        ))
                                    ) : (
                                        <tr>
                                            <td colSpan={7} className="px-6 py-12 text-center text-gray-500">
                                                No members found.
                                            </td>
                                        </tr>
                                    )}
                                </tbody>
                            </table>
                            <div className="bg-gray-50 px-6 py-4 border-t border-gray-200 text-center text-xs text-gray-500">
                                Showing {filteredMembers.length} records
                            </div>
                        </div>
                    </div>
                </div>
            </main>
        </div>
    );
}
