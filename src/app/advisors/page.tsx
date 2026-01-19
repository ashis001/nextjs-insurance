"use client";

import { Sidebar } from "../corporate-customers/[id]/_components/Sidebar";
import { Mail, Phone, MoreVertical, Plus, Search } from "lucide-react";
import { useState } from "react";

const ALL_ADVISORS = [
    { id: 1, name: "Sarah Johnson", company: "Elite Brokers Inc.", email: "sarah.j@elitebrokers.com", phone: "+1 (555) 123-4567", clients: 24, status: "Active" },
    { id: 2, name: "Mike Peters", company: "Direct Financial", email: "mike.p@directfinancial.ca", phone: "+1 (555) 987-6543", clients: 18, status: "Active" },
    { id: 3, name: "Jessica Wong", company: "Wong & Associates", email: "jessica@wongassociates.com", phone: "+1 (555) 456-7890", clients: 32, status: "Active" },
    { id: 4, name: "David Miller", company: "Secure Future", email: "d.miller@securefuture.org", phone: "+1 (555) 222-3333", clients: 7, status: "Pending" },
    { id: 5, name: "Robert Cheney", company: "Cheney Group", email: "rob@cheneygroup.com", phone: "+1 (555) 111-2222", clients: 45, status: "Active" },
    { id: 6, name: "Emily Blunt", company: "Global Insure", email: "emily@globalinsure.com", phone: "+1 (555) 888-9999", clients: 12, status: "Inactive" },
];

export default function AdvisorsPage() {
    const [searchTerm, setSearchTerm] = useState("");
    const [statusFilter, setStatusFilter] = useState("All");

    // Dynamic Filtering Logic
    const filteredAdvisors = ALL_ADVISORS.filter(advisor => {
        const matchesSearch = advisor.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
            advisor.company.toLowerCase().includes(searchTerm.toLowerCase());
        const matchesStatus = statusFilter === "All" || advisor.status === statusFilter;
        return matchesSearch && matchesStatus;
    });

    return (
        <div className="flex min-h-screen bg-gray-50">
            <Sidebar />
            <main className="flex-1 ml-64">
                {/* Header matching Corporate Page */}
                <header className="flex h-14 items-center justify-between border-b border-gray-200 bg-white px-6">
                    <div className="flex items-center gap-4">
                        <h1 className="text-lg font-semibold text-gray-900">Advisors</h1>
                    </div>
                    <div className="flex items-center gap-4">
                        <div className="text-sm">
                            <span className="text-gray-600">Welcome, </span>
                            <span className="font-medium">John Smith</span>
                        </div>
                    </div>
                </header>

                <div className="p-6 space-y-4">
                    {/* Actions Bar */}
                    <div className="flex justify-between items-center">
                        <div className="flex gap-4">
                            <div className="relative">
                                <Search className="absolute left-3 top-2 h-4 w-4 text-gray-400" />
                                <input
                                    placeholder="Search advisors..."
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                    className="rounded border border-gray-300 pl-9 pr-4 py-1.5 text-sm focus:border-blue-500 focus:outline-none w-64 shadow-sm"
                                />
                            </div>
                            <select
                                value={statusFilter}
                                onChange={(e) => setStatusFilter(e.target.value)}
                                className="rounded border border-gray-300 px-3 py-1.5 text-sm focus:border-blue-500 focus:outline-none shadow-sm"
                            >
                                <option value="All">All Status</option>
                                <option value="Active">Active</option>
                                <option value="Pending">Pending</option>
                                <option value="Inactive">Inactive</option>
                            </select>
                        </div>
                        <button className="flex items-center gap-2 rounded bg-[#1e3a5f] px-4 py-1.5 text-sm font-semibold text-white hover:bg-[#2a4a75] shadow-sm">
                            <Plus className="h-4 w-4" />
                            Add Advisor
                        </button>
                    </div>

                    {/* Advisors Table with Navy Header */}
                    <div>
                        <div className="bg-[#1e3a5f] px-4 py-2 flex justify-between items-center text-white">
                            <h3 className="text-sm font-semibold">Advisors Directory</h3>
                            <span className="text-xs opacity-80">{filteredAdvisors.length} Records</span>
                        </div>
                        <div className="bg-white border border-t-0 border-gray-200">
                            <table className="w-full text-left text-sm">
                                <thead className="bg-gray-50 text-gray-500 border-b border-gray-100">
                                    <tr>
                                        <th className="px-6 py-3 font-medium">Advisor Name</th>
                                        <th className="px-6 py-3 font-medium">Brokerage Info</th>
                                        <th className="px-6 py-3 font-medium">Contact</th>
                                        <th className="px-6 py-3 font-medium">Clients</th>
                                        <th className="px-6 py-3 font-medium">Status</th>
                                        <th className="px-6 py-3 font-medium text-right">Actions</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-100">
                                    {filteredAdvisors.length > 0 ? (
                                        filteredAdvisors.map((advisor) => (
                                            <tr key={advisor.id} className="group hover:bg-gray-50">
                                                <td className="px-6 py-4">
                                                    <div className="flex items-center gap-3">
                                                        <div className="h-8 w-8 rounded-full bg-blue-100 flex items-center justify-center text-blue-700 font-semibold text-xs border border-blue-200">
                                                            {advisor.name.split(" ").map(n => n[0]).join("")}
                                                        </div>
                                                        <span className="font-medium text-gray-900">{advisor.name}</span>
                                                    </div>
                                                </td>
                                                <td className="px-6 py-4 text-gray-600">{advisor.company}</td>
                                                <td className="px-6 py-4">
                                                    <div className="flex flex-col gap-1 text-gray-500 text-xs">
                                                        <div className="flex items-center gap-1"><Mail className="h-3 w-3" /> {advisor.email}</div>
                                                        <div className="flex items-center gap-1"><Phone className="h-3 w-3" /> {advisor.phone}</div>
                                                    </div>
                                                </td>
                                                <td className="px-6 py-4 text-gray-900 font-medium">{advisor.clients}</td>
                                                <td className="px-6 py-4">
                                                    <span className={`inline-flex rounded-full px-2.5 py-0.5 text-xs font-medium border ${advisor.status === "Active" ? "bg-green-50 text-green-700 border-green-200" :
                                                        advisor.status === "Pending" ? "bg-yellow-50 text-yellow-700 border-yellow-200" :
                                                            "bg-gray-50 text-gray-600 border-gray-200"
                                                        }`}>
                                                        {advisor.status}
                                                    </span>
                                                </td>
                                                <td className="px-6 py-4 text-right">
                                                    <button className="text-gray-400 hover:text-gray-600">
                                                        <MoreVertical className="h-4 w-4" />
                                                    </button>
                                                </td>
                                            </tr>
                                        ))
                                    ) : (
                                        <tr>
                                            <td colSpan={6} className="px-6 py-12 text-center text-gray-500">
                                                No advisors found matching your filters.
                                            </td>
                                        </tr>
                                    )}
                                </tbody>
                            </table>
                            {/* Pagination footer simulating dynamic content */}
                            {filteredAdvisors.length > 0 && (
                                <div className="px-6 py-3 border-t border-gray-100 bg-gray-50 flex justify-end gap-2">
                                    <button className="px-3 py-1 text-xs border border-gray-300 bg-white rounded hover:bg-gray-50 disabled:opacity-50" disabled>Previous</button>
                                    <button className="px-3 py-1 text-xs border border-gray-300 bg-white rounded hover:bg-gray-50">Next</button>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </main>
        </div>
    );
}
