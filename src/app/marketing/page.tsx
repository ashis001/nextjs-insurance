"use client";

import { Sidebar } from "../corporate-customers/[id]/_components/Sidebar";
import { Download, Share2, FileText, Calendar, Filter } from "lucide-react";
import { useState } from "react";

const MATERIALS = [
    { title: "2024 Benefits Guide", category: "Brochure", size: "2.4 MB", date: "Jan 10, 2024", type: "PDF" },
    { title: "Employee Enrollment Kit", category: "Kit", size: "15 MB", date: "Dec 15, 2023", type: "ZIP" },
    { title: "Health Plan Overview", category: "One-pager", size: "1.1 MB", date: "Jan 05, 2024", type: "PDF" },
    { title: "Mental Wellness Flyer", category: "Flyer", size: "850 KB", date: "Nov 20, 2023", type: "PDF" },
    { title: "Q1 Campaign Assets", category: "Social Media", size: "45 MB", date: "Jan 12, 2024", type: "ZIP" },
    { title: "Manager Training Deck", category: "Presentation", size: "5.2 MB", date: "Oct 30, 2023", type: "PPTX" },
    { title: "Generic Plan Summary", category: "Brochure", size: "3.2 MB", date: "Oct 15, 2023", type: "PDF" },
    { title: "Instagram Stories Pack", category: "Social Media", size: "12 MB", date: "Jan 02, 2024", type: "ZIP" },
];

export default function MarketingPage() {
    const [categoryFilter, setCategoryFilter] = useState("All Categories");

    const filteredMaterials = categoryFilter === "All Categories"
        ? MATERIALS
        : MATERIALS.filter(m => m.category === categoryFilter);

    return (
        <div className="flex min-h-screen bg-gray-50">
            <Sidebar />
            <main className="flex-1 ml-64">
                {/* Header matching Corporate Page */}
                <header className="flex h-14 items-center justify-between border-b border-gray-200 bg-white px-6">
                    <div className="flex items-center gap-4">
                        <h1 className="text-lg font-semibold text-gray-900">Marketing Center</h1>
                    </div>
                    <div className="flex items-center gap-4">
                        <div className="text-sm">
                            <span className="text-gray-600">Welcome, </span>
                            <span className="font-medium">John Smith</span>
                        </div>
                    </div>
                </header>

                <div className="p-6 space-y-6">
                    {/* Filter Bar */}
                    <div className="flex justify-between items-center bg-white p-3 rounded-lg border border-gray-200 shadow-sm">
                        <div className="flex items-center gap-2">
                            <Filter className="h-4 w-4 text-gray-500" />
                            <span className="text-sm font-medium text-gray-700">Filter Assets:</span>
                            <select
                                value={categoryFilter}
                                onChange={(e) => setCategoryFilter(e.target.value)}
                                className="rounded border border-gray-300 bg-gray-50 px-3 py-1.5 text-sm focus:border-blue-500 focus:outline-none"
                            >
                                <option>All Categories</option>
                                <option>Brochure</option>
                                <option>Kit</option>
                                <option>Social Media</option>
                                <option>Presentation</option>
                            </select>
                        </div>
                        <div className="text-xs text-gray-500">
                            Showing {filteredMaterials.length} results
                        </div>
                    </div>

                    {/* Grid with Navy Header Wrapper? Or just cards. 
                Given the card grid nature, a wrapping Navy Header might look odd unless it wraps the WHOLE grid area.
                Let's wrap the Grid Container using the same pattern.
            */}
                    <div>
                        <div className="bg-[#1e3a5f] px-4 py-2 flex justify-between items-center text-white rounded-t-lg">
                            <h3 className="text-sm font-semibold">Asset Library</h3>
                        </div>
                        <div className="bg-gray-100 p-6 border border-gray-200 rounded-b-lg">
                            {filteredMaterials.length > 0 ? (
                                <div className="grid grid-cols-4 gap-6">
                                    {filteredMaterials.map((item, idx) => (
                                        <div key={idx} className="group overflow-hidden rounded-lg border border-gray-200 bg-white shadow-sm transition-all hover:shadow-md hover:-translate-y-1">
                                            <div className="aspect-[4/3] bg-gray-50 flex items-center justify-center border-b border-gray-100 group-hover:bg-blue-50 transition-colors relative">
                                                <FileText className="h-10 w-10 text-gray-300 group-hover:text-blue-500 transition-colors" />
                                                <div className="absolute top-2 right-2">
                                                    <span className="text-[10px] font-mono text-gray-400 border border-gray-200 bg-white rounded px-1">{item.type}</span>
                                                </div>
                                            </div>
                                            <div className="p-4">
                                                <div className="mb-2">
                                                    <span className="inline-flex rounded bg-blue-50 px-2 py-0.5 text-[10px] uppercase font-bold text-blue-700 tracking-wide">
                                                        {item.category}
                                                    </span>
                                                </div>
                                                <h3 className="font-semibold text-gray-900 text-sm mb-1 leading-tight">{item.title}</h3>
                                                <div className="flex items-center gap-3 text-xs text-gray-400 mt-2">
                                                    <div className="flex items-center gap-1">
                                                        <Download className="h-3 w-3" /> {item.size}
                                                    </div>
                                                    <div className="flex items-center gap-1">
                                                        <Calendar className="h-3 w-3" /> {item.date}
                                                    </div>
                                                </div>

                                                <div className="mt-4 flex gap-2">
                                                    <button className="flex-1 rounded border border-gray-200 py-1.5 text-xs font-medium text-gray-600 hover:bg-gray-50 hover:text-gray-900 transition-colors">
                                                        Preview
                                                    </button>
                                                    <button className="flex-1 rounded bg-[#1e3a5f] py-1.5 text-xs font-medium text-white hover:bg-[#2a4a75] shadow-sm flex items-center justify-center gap-2 transition-colors">
                                                        <Download className="h-3 w-3" /> Get
                                                    </button>
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                <div className="flex flex-col items-center justify-center h-64 text-gray-500">
                                    <FileText className="h-12 w-12 text-gray-300 mb-4" />
                                    <p>No assets found in this category.</p>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </main>
        </div>
    );
}
