"use client";

import { Sidebar } from "./[id]/_components/Sidebar";
import { Plus, Info, Trash2, Edit2, Check, AlertTriangle, X } from "lucide-react";
import Link from "next/link";
import { useState, useEffect } from "react";
import { fetchAllCorporates, deleteCorporate } from "@/lib/db";
import { Corporate } from "@/lib/types";

export default function CorporateListingPage() {
    const [searchTerm, setSearchTerm] = useState("");
    const [corporates, setCorporates] = useState<Corporate[]>([]);
    const [deleteId, setDeleteId] = useState<string | null>(null);
    const [isDeleting, setIsDeleting] = useState(false);

    const loadCorporatesList = async () => {
        // 1. Load from Supabase (Cloud)
        const cloudData = await fetchAllCorporates();

        // 2. Load from LocalStorage (Cache)
        const masterList = JSON.parse(localStorage.getItem('corp_master_list') || '[]');
        const cachedData = masterList.map((id: string) => {
            const item = localStorage.getItem(`corp_${id}`);
            return item ? JSON.parse(item) : null;
        }).filter(Boolean) as Corporate[];

        // 3. Merge them (Cloud data takes priority for the same ID)
        const combinedMap = new Map<string, Corporate>();
        cachedData.forEach(c => combinedMap.set(c.id, c));
        cloudData.forEach(c => combinedMap.set(c.id, c));

        setCorporates(Array.from(combinedMap.values()));
    };

    useEffect(() => {
        loadCorporatesList();
    }, []);

    const confirmDelete = async () => {
        if (!deleteId) return;
        try {
            setIsDeleting(true);
            // Delete from Cloud
            await deleteCorporate(deleteId);

            // Delete from Cache
            localStorage.removeItem(`corp_${deleteId}`);
            const masterList = JSON.parse(localStorage.getItem('corp_master_list') || '[]');
            const newList = masterList.filter((mId: string) => mId !== deleteId);
            localStorage.setItem('corp_master_list', JSON.stringify(newList));

            await loadCorporatesList();
            setDeleteId(null);
        } catch (err) {
            alert("Failed to delete corporate.");
        } finally {
            setIsDeleting(false);
        }
    };

    const filtered = corporates.filter(c =>
        (c.name || "Unnamed").toLowerCase().includes(searchTerm.toLowerCase()) ||
        (c.contactEmail || "").toLowerCase().includes(searchTerm.toLowerCase())
    );

    const newId = `corp-${Math.random().toString(36).substr(2, 9)}`;

    return (
        <div className="flex min-h-screen bg-gray-50">
            <Sidebar />
            <main className="flex-1 ml-64 p-6">
                {/* Header matching screenshot */}
                <div className="mb-4 bg-[#1e3a5f] p-1.5 px-4 flex justify-between items-center rounded-t shadow-sm">
                    <div className="flex items-center gap-2">
                        <h2 className="text-white font-bold text-xs uppercase tracking-wider">Corporate Customers</h2>
                        <Info size={14} className="text-white/70" />
                    </div>
                    <Link
                        href={`/corporate-customers/${newId}`}
                        className="bg-white text-[#1e3a5f] px-4 py-1 rounded text-[10px] font-bold uppercase transition-all hover:bg-gray-100 flex items-center gap-1.5"
                    >
                        <Plus size={12} /> Add New Customer
                    </Link>
                </div>

                {/* Table Controls */}
                <div className="bg-white p-4 border border-gray-200 flex justify-between items-center text-[12px] text-gray-600">
                    <div className="flex items-center gap-2">
                        <span>Show</span>
                        <select className="border border-gray-300 rounded px-1 py-0.5 bg-gray-50">
                            <option>10</option>
                            <option>25</option>
                            <option>50</option>
                        </select>
                        <span>entries</span>
                    </div>
                    <div className="flex items-center gap-2">
                        <span>Search:</span>
                        <input
                            type="text"
                            className="border border-gray-300 rounded px-2 py-0.5 outline-none focus:border-blue-400"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                    </div>
                </div>

                {/* Table */}
                <div className="bg-white border-x border-b border-gray-200 overflow-hidden">
                    <table className="w-full text-left text-xs">
                        <thead>
                            <tr className="bg-gray-100/80 text-gray-600 font-bold border-b border-gray-200">
                                <th className="px-4 py-3 w-8"></th>
                                <th className="px-4 py-3 border-r border-gray-200">Name</th>
                                <th className="px-4 py-3 border-r border-gray-200">Broker/Advisor Name</th>
                                <th className="px-4 py-3 border-r border-gray-200 text-center">Employer profiles</th>
                                <th className="px-4 py-3 border-r border-gray-200 text-center">Plan Headcount</th>
                                <th className="px-4 py-3 border-r border-gray-200">Corporate admin email</th>
                                <th className="px-4 py-3 border-r border-gray-200 text-center">Admin Approved</th>
                                <th className="px-4 py-3 text-center">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100">
                            {filtered.length === 0 ? (
                                <tr>
                                    <td colSpan={8} className="px-4 py-16 text-center">
                                        <div className="flex flex-col items-center justify-center text-gray-400">
                                            <p className="text-sm font-medium">No records found</p>
                                            <p className="text-[10px]">Click "Add New" to create your first corporate customer</p>
                                        </div>
                                    </td>
                                </tr>
                            ) : filtered.map((corp) => (
                                <tr key={corp.id} className="hover:bg-gray-50 transition-colors group">
                                    <td className="px-4 py-2">
                                        <div className={`w-2 h-2 rounded-full ${corp.corporateInfoCompleted ? 'bg-green-500' : 'bg-gray-300'}`}></div>
                                    </td>
                                    <td className="px-4 py-2 font-medium text-blue-600 hover:underline cursor-pointer">
                                        <Link href={`/corporate-customers/${corp.id}?view=overview`}>
                                            {corp.name || "(Empty Name)"}
                                        </Link>
                                    </td>
                                    <td className="px-4 py-2 text-gray-700 text-[10px] uppercase font-bold">{corp.broker || "-"}</td>
                                    <td className="px-4 py-2 text-center font-bold text-blue-600">
                                        <span className="underline cursor-pointer">{0}</span>
                                    </td>
                                    <td className="px-4 py-2 text-center font-bold text-blue-600">
                                        <span className="underline cursor-pointer tracking-tighter">
                                            {corp.tiers?.reduce((acc, t) => acc + (t.status === "Active" ? 1 : 0), 0) || 0}
                                        </span>
                                    </td>
                                    <td className="px-4 py-2 text-gray-500 text-[10px] font-medium">{corp.contactEmail || "-"}</td>
                                    <td className="px-4 py-2 text-center">
                                        <button className="bg-[#1e3a5f] text-white px-3 py-0.5 rounded text-[8px] font-black uppercase shadow-sm hover:bg-slate-800 transition-all">
                                            Approve
                                        </button>
                                    </td>
                                    <td className="px-4 py-2">
                                        <div className="flex items-center justify-center gap-3">
                                            <button
                                                onClick={() => setDeleteId(corp.id)}
                                                className="text-red-400 hover:text-red-600 transition-colors"
                                            >
                                                <Trash2 size={13} />
                                            </button>
                                            <Link href={`/corporate-customers/${corp.id}`} className="text-blue-400 hover:text-blue-600 transition-colors">
                                                <Edit2 size={13} />
                                            </Link>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>

                {/* Pagination */}
                <div className="mt-4 flex justify-between items-center text-[12px] text-gray-500 font-medium">
                    <p>Showing 1 to {filtered.length} of {filtered.length} entries</p>
                    <div className="flex gap-px shadow-sm rounded overflow-hidden">
                        <button className="bg-[#1e3a5f] text-white px-3 py-1 hover:bg-slate-800 transition-all font-bold">Previous</button>
                        <button className="bg-blue-600 text-white px-4 py-1 font-bold">1</button>
                        <button className="bg-[#1e3a5f] text-white px-3 py-1 hover:bg-slate-800 transition-all font-bold">Next</button>
                    </div>
                </div>
            </main>

            {/* Delete Confirmation Modal */}
            {deleteId && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
                    <div className="w-full max-w-md scale-100 transform rounded-xl bg-white p-6 shadow-2xl transition-all">
                        <div className="mb-4 flex items-center justify-center">
                            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-red-100">
                                <AlertTriangle className="h-6 w-6 text-red-600" />
                            </div>
                        </div>
                        <div className="text-center">
                            <h3 className="text-lg font-bold text-gray-900">Confirm Deletion</h3>
                            <p className="mt-2 text-sm text-gray-500">
                                Are you sure you want to delete this corporate customer? This action will permanently remove all data from both the local cache and the cloud database.
                            </p>
                        </div>
                        <div className="mt-6 flex gap-3">
                            <button
                                onClick={() => setDeleteId(null)}
                                className="flex-1 rounded-lg border border-gray-300 bg-white px-4 py-2 text-sm font-semibold text-gray-700 hover:bg-gray-50 transition-colors"
                                disabled={isDeleting}
                            >
                                Cancel
                            </button>
                            <button
                                onClick={confirmDelete}
                                className="flex-1 rounded-lg bg-red-600 px-4 py-2 text-sm font-semibold text-white hover:bg-red-700 shadow-sm transition-colors flex items-center justify-center gap-2"
                                disabled={isDeleting}
                            >
                                {isDeleting ? (
                                    <>
                                        <div className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
                                        Deleting...
                                    </>
                                ) : (
                                    "Delete Customer"
                                )}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
