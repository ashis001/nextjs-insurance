"use client";

import { Tier, Plan } from "@/lib/types";
import { useState } from "react";
import { X, ChevronDown, Edit2, Trash2 } from "lucide-react";
import { useForm } from "react-hook-form";
import clsx from "clsx";

// Type definitions for internal mock data
interface Product {
    id: string;
    name: string;
    category: string;
    hasVariants?: boolean;
    variants?: string[];
}

interface SubCategory {
    id: string;
    name: string;
    products: Product[];
}

interface PlanCategory {
    id: string;
    name: string;
    products: Product[];
    subcategories?: SubCategory[];
}

// Global Products Lists
const MENTAL_HEALTH_PRODUCTS: Product[] = [
    { id: "eap3", name: "GroupBenefitz EAP 3.0", category: "Mental Health" },
    { id: "cw1", name: "Complete Wellness", category: "Mental Health" },
    { id: "dp_core", name: "Dialogue Primary Care", category: "Health" },
    { id: "db_core", name: "Dialogue Basic EAP", category: "Mental Health" },
    { id: "de_core", name: "Dialogue Extended EAP (Mental Health+)", category: "Mental Health" },
    { id: "dm_core", name: "Dialogue Mind & Body (Primary Care + EAP + Mental Health+)", category: "Combined" },
];

const PRIVATE_HEALTH_PRODUCTS: Product[] = [
    { id: "cx1", name: "Complete Executive Care", category: "Health" },
    { id: "myr1", name: "Medcan Year Round Care", category: "Health" },
    { id: "mdc1", name: "Medcan Dedicated Care", category: "Health" },
    { id: "mm1", name: "Medcan Mcare", category: "Health" },
    { id: "lv1", name: "La Vie - Point One Care", category: "Health" },
    { id: "lv2", name: "La Vie - Point One Care + FIT", category: "Health" }
];

const VARIANTS_S_C_F = ["Single", "Couple", "Family"];

const PLAN_CATEGORIES = {
    CORPORATE: [
        {
            id: "cm1",
            name: "Mental Health & Wellbeing",
            products: [
                { id: "eap2", name: "EAP 2.0", category: "Mental Health" },
                { id: "mb1", name: "Mind & Body", category: "Mental Health" },
                ...MENTAL_HEALTH_PRODUCTS
            ]
        },
        {
            id: "cm2", name: "Emergency Travel Protection", products: [
                { id: "tr1", name: "GroupBenefitz Travel", category: "Travel", hasVariants: true, variants: VARIANTS_S_C_F }
            ]
        }
    ],
    CORE: [
        { id: "cr1", name: "Private Health", products: PRIVATE_HEALTH_PRODUCTS },
        {
            id: "cr2",
            name: "Health & Dental Insurance",
            products: [],
            subcategories: [
                {
                    id: "sub_gateway", name: "Gateway (Flex)", products: [
                        { id: "gb1", name: "Gateway Bronze", category: "Insurance", hasVariants: true, variants: VARIANTS_S_C_F },
                        { id: "gs1", name: "Gateway Silver", category: "Insurance", hasVariants: true, variants: VARIANTS_S_C_F },
                        { id: "gg1", name: "Gateway Gold", category: "Insurance", hasVariants: true, variants: VARIANTS_S_C_F }
                    ]
                },
                {
                    id: "sub_classic", name: "Classic", products: [
                        { id: "cb1", name: "Classic Bronze", category: "Insurance", hasVariants: true, variants: VARIANTS_S_C_F },
                        { id: "cs1", name: "Classic Silver", category: "Insurance", hasVariants: true, variants: VARIANTS_S_C_F },
                        { id: "cg1", name: "Classic Gold", category: "Insurance", hasVariants: true, variants: VARIANTS_S_C_F }
                    ]
                },
                { id: "sub_teap", name: "Test EAP 4", products: [{ id: "teap4", name: "Test EAP 4", category: "EAP" }] },
                { id: "sub_prov", name: "Provincial Health Replacement Plan", products: [{ id: "phrp", name: "Provincial Health Replacement Plan", category: "Health" }] },
                { id: "sub_cat", name: "Catastrophic Medication", products: [{ id: "hcd_core", name: "High-Cost Drugs", category: "Drugs", hasVariants: true, variants: ["Single", "Family"] }] },
                { id: "sub_trav", name: "Emergency Travel Protection", products: [{ id: "gt_core", name: "GroupBenefitz Travel", category: "Travel" }] }
            ]
        },
        { id: "cr3", name: "Mental Health & Wellbeing", products: MENTAL_HEALTH_PRODUCTS },
        {
            id: "cr4",
            name: "Life & Disability Protection",
            products: [
                { id: "p100", name: "Protect 100", category: "Life" },
                { id: "p200", name: "Protect 200", category: "Life" }
            ]
        }
    ],
    VOLUNTARY: [
        {
            id: "vl1",
            name: "Private Health",
            products: [],
            subcategories: [
                {
                    id: "vlsub_ph", name: "Private Health", products: PRIVATE_HEALTH_PRODUCTS
                },
                {
                    id: "vlsub_mh", name: "Mental Health & Wellbeing", products: MENTAL_HEALTH_PRODUCTS
                }
            ]
        },
        {
            id: "vl2", name: "Health & Dental Insurance", subcategories: [
                {
                    id: "vsc1", name: "Catastrophic Medication", products: [
                        { id: "vhcd1", name: "High-Cost Drugs", category: "Drugs", hasVariants: true, variants: ["Single", "Family"] }
                    ]
                }
            ], products: []
        }
    ],
    UPGRADE: [
        {
            id: "ug1",
            name: "Private Health",
            products: [],
            subcategories: [
                {
                    id: "ugsub_ph", name: "Private Health", products: [
                        { id: "ug_cx1", name: "Complete Executive Care", category: "Health" },
                        { id: "ug_mdc1", name: "Medcan Dedicated Care", category: "Health" },
                        { id: "ug_mm1", name: "Medcan Mcare", category: "Health" },
                        { id: "ug_lv1", name: "La Vie - Point One Care", category: "Health" },
                        { id: "ug_lv2", name: "La Vie - Point One Care + FIT", category: "Health" }
                    ]
                }
            ]
        },
        {
            id: "ug2",
            name: "Health & Dental Insurance",
            products: [],
            subcategories: [
                {
                    id: "ugsub_gateway", name: "Gateway (Flex)", products: [
                        { id: "ug_gs1", name: "Gateway Silver", category: "Insurance" },
                        { id: "ug_gg1", name: "Gateway Gold", category: "Insurance" }
                    ]
                },
                {
                    id: "ugsub_classic", name: "Classic", products: [
                        { id: "ug_cb1", name: "Classic Bronze", category: "Insurance" },
                        { id: "ug_cs1", name: "Classic Silver", category: "Insurance", hasVariants: true, variants: VARIANTS_S_C_F },
                        { id: "ug_cg1", name: "Classic Gold", category: "Insurance" }
                    ]
                },
                {
                    id: "ugsub_prov", name: "Provincial Health Replacement Plan", products: [
                        { id: "ug_phrp", name: "Provincial Health Replacement Plan", category: "Health" }
                    ]
                }
            ]
        }
    ]
};

export function TierEditorPanel({
    tier,
    onSave,
    onCancel,
}: {
    tier: Tier;
    onSave: (updates: Partial<Tier>) => void;
    onCancel: () => void;
}) {
    const { register, handleSubmit } = useForm({
        defaultValues: {
            name: tier.name,
            description: tier.description,
            status: tier.status,
            effectiveDate: tier.effectiveDate ? new Date(tier.effectiveDate).toISOString().split('T')[0] : "",
            lengthOfService: tier.lengthOfService === "None" ? "No" : tier.lengthOfService,
        },
    });

    const [plans, setPlans] = useState(tier.plans);
    const [enableUpgrade, setEnableUpgrade] = useState(!!tier.enableUpgradePlans);
    const [enableVoluntary, setEnableVoluntary] = useState(!!tier.enableVoluntaryPlans);

    const [openCats, setOpenCats] = useState<Record<string, boolean>>({
        "ug1": true,
        "ug2": true
    });
    const [openSubCats, setOpenSubCats] = useState<Record<string, boolean>>({
        "sub_gateway": true,
        "sub_classic": true,
        "sub_teap": true,
        "sub_prov": true,
        "sub_cat": true,
        "sub_trav": true,
        "ugsub_gateway": true,
        "ugsub_classic": true,
        "ugsub_prov": true,
        "ugsub_ph": true,
        "vlsub_ph": true,
        "vlsub_mh": true,
        "vsc1": true
    });
    const [showHeadCountModal, setShowHeadCountModal] = useState<{ section: keyof Tier['plans']; product: Product; variant: string } | null>(null);
    const [showInfoModal, setShowInfoModal] = useState(false);

    const toggleCat = (id: string) => {
        setOpenCats(prev => ({ ...prev, [id]: !prev[id] }));
    };

    const toggleSubCat = (id: string) => {
        setOpenSubCats(prev => ({ ...prev, [id]: !prev[id] }));
    };

    const togglePlan = (section: keyof Tier['plans'], product: Product, variant: string = "Single") => {
        setPlans((prev) => {
            const list = prev[section] as Plan[];
            const exists = list.find((p) => p.id === product.id && p.variant === variant);

            if (exists) {
                return { ...prev, [section]: list.filter((p) => !(p.id === product.id && p.variant === variant)) };
            } else {
                const newPlan: Plan = {
                    id: product.id,
                    name: product.name,
                    category: product.category,
                    type: section.toUpperCase() as any,
                    variant: variant as any,
                    headcount: 1
                };

                if (section === "corporate") {
                    setTimeout(() => {
                        setShowHeadCountModal({ section, product, variant });
                    }, 50);
                }

                return { ...prev, [section]: [...list, newPlan] };
            }
        });
    };

    const isSelected = (section: keyof Tier['plans'], productId: string, variant?: string) => {
        if (variant) {
            return (plans[section] as Plan[]).some(p => p.id === productId && p.variant === variant);
        }
        return (plans[section] as Plan[]).some(p => p.id === productId);
    };

    const updateHeadCount = (count: number) => {
        if (!showHeadCountModal) return;
        const { section, product, variant } = showHeadCountModal;
        setPlans(prev => ({
            ...prev,
            [section]: (prev[section] as Plan[]).map(p =>
                (p.id === product.id && p.variant === variant) ? { ...p, headcount: count } : p
            )
        }));
        setShowHeadCountModal(null);
    };

    const onFormSubmit = (data: Partial<Tier>) => {
        if (plans.core.length === 0) {
            setShowInfoModal(true);
            return;
        }

        onSave({
            ...data,
            status: "Active",
            effectiveDate: data.effectiveDate ? new Date(data.effectiveDate).toISOString() : null,
            plans,
            isValid: true,
            enableUpgradePlans: enableUpgrade,
            enableVoluntaryPlans: enableVoluntary
        });
    };

    // Helper to render products within a category/subcategory
    const renderProducts = (section: keyof Tier['plans'], products: Product[]) => {
        return products.map(p => {
            const selected = (plans[section] as Plan[]).find(item => item.id === p.id);
            return (
                <div key={p.id} className="rounded border border-gray-200 bg-white shadow-[0_1px_4px_rgba(0,0,0,0.05)] p-2">
                    <div className="flex items-center justify-between">
                        <span className="text-[10px] font-bold text-gray-700">{p.name}</span>
                        <input
                            type="checkbox"
                            checked={isSelected(section, p.id)}
                            onChange={() => togglePlan(section, p)}
                            className="h-3.5 w-3.5 rounded border-gray-300 text-blue-600 focus:ring-0 cursor-pointer"
                        />
                    </div>
                    {p.hasVariants && (
                        <div className="flex gap-4 mt-1.5 ml-0.5">
                            {p.variants?.map(v => (
                                <label key={v} className="flex items-center gap-1.5 cursor-pointer group">
                                    <input
                                        type="checkbox"
                                        checked={isSelected(section, p.id, v)}
                                        onChange={() => togglePlan(section, p, v)}
                                        className="h-3 w-3 rounded border-gray-300 text-blue-600 focus:ring-0"
                                    />
                                    <span className="text-[9px] font-bold text-slate-500 group-hover:text-blue-700 transition-colors uppercase">{v}</span>
                                </label>
                            ))}
                        </div>
                    )}
                    {selected && section === "corporate" && (
                        <div className="pt-2 space-y-2">
                            <div className="space-y-1">
                                <p className="text-[8px] font-extrabold text-[#1e3a5f] uppercase tracking-tighter">HEAD COUNT</p>
                                <input type="number" value={selected.headcount} readOnly className="w-10 h-5 border border-gray-300 rounded text-[10px] px-1 bg-white outline-none font-bold text-gray-700" />
                            </div>
                            <div className="flex gap-2.5 items-center">
                                <Edit2 className="h-3.5 w-3.5 text-red-500 cursor-pointer hover:text-red-700" onClick={() => setShowHeadCountModal({ section, product: p, variant: 'Single' })} />
                                <Trash2 className="h-3.5 w-3.5 text-red-500 cursor-pointer hover:text-red-700" />
                                <div className="h-3 w-3 rounded-full border border-red-500 flex items-center justify-center text-[7px] text-red-500 font-black cursor-pointer hover:bg-red-50">i</div>
                            </div>
                        </div>
                    )}
                </div>
            );
        });
    };

    return (
        <div className="fixed inset-0 z-[60] flex items-center justify-center overflow-y-auto bg-slate-900/60 p-4">
            <div className="w-full max-w-[1400px] bg-[#f8fafc] rounded-md shadow-2xl overflow-hidden border border-gray-300 relative">

                {/* 1. Header */}
                <div className="bg-white border-b border-gray-200 px-4 py-1.5 flex items-center justify-between">
                    <span className="text-[11px] font-bold text-gray-800">{tier.name ? "Edit Tier" : "Add Tier"}</span>
                    <button onClick={onCancel} className="text-gray-400 hover:text-black">
                        <X size={14} />
                    </button>
                </div>

                <div className="p-4 space-y-4 max-h-[88vh] overflow-y-auto">

                    {/* 2. Tier Configuration */}
                    <div className="border border-gray-300 rounded bg-white overflow-hidden">
                        <div className="bg-[#1e3a5f] px-3 py-1.5">
                            <h3 className="text-[11px] font-bold text-white uppercase tracking-wider">Tier Configuration</h3>
                        </div>
                        <div className="p-4 grid grid-cols-5 gap-4 items-end">
                            <div className="space-y-1">
                                <label className="text-[10px] font-bold text-gray-700 text-nowrap">Tier Name<span className="text-red-600">*</span></label>
                                <input {...register("name")} className="w-full border border-gray-300 rounded px-2 py-1.5 text-xs bg-gray-50 focus:bg-white transition-colors" />
                            </div>
                            <div className="space-y-1">
                                <label className="text-[10px] font-bold text-gray-700">Description<span className="text-red-600">*</span></label>
                                <input {...register("description")} className="w-full border border-gray-300 rounded px-2 py-1.5 text-xs bg-gray-50 focus:bg-white transition-colors" />
                            </div>
                            <div className="space-y-1">
                                <label className="text-[10px] font-bold text-gray-700">Status<span className="text-red-600">*</span></label>
                                <input {...register("status")} className="w-full border border-gray-300 rounded px-2 py-1.5 text-xs bg-gray-100" readOnly />
                            </div>
                            <div className="space-y-1">
                                <label className="text-[10px] font-bold text-gray-700">Effective Date<span className="text-red-600">*</span></label>
                                <input type="date" {...register("effectiveDate")} className="w-full border border-gray-300 rounded px-2 py-1.5 text-xs" />
                            </div>
                            <div className="flex gap-2">
                                <div className="flex-1 space-y-1">
                                    <label className="text-[10px] font-bold text-gray-700">Length of Service<span className="text-red-600">*</span></label>
                                    <select {...register("lengthOfService")} className="w-full border border-gray-300 rounded px-2 py-1.5 text-xs bg-gray-50">
                                        <option value="No">No</option>
                                        <option value="3 Months">3 Months</option>
                                        <option value="6 Months">6 Months</option>
                                    </select>
                                </div>
                                <button onClick={handleSubmit(onFormSubmit)} className="bg-[#1e3a5f] text-white px-4 py-1.5 rounded text-[11px] font-bold self-end h-[30px] hover:bg-slate-800 transition-colors shadow-sm">Save</button>
                            </div>
                        </div>
                    </div>

                    {/* 3. Corporate Level Plans */}
                    <div className="border border-gray-300 rounded-sm bg-white p-4 space-y-4 shadow-sm">
                        <p className="text-[10px] text-gray-500 font-bold uppercase tracking-tight">Corporate Level Group Plans</p>
                        <div className="flex gap-4 items-start">
                            {PLAN_CATEGORIES.CORPORATE.map(cat => (
                                <div key={cat.id} className="w-72 space-y-2">
                                    <button onClick={() => toggleCat(cat.id)} className="w-full flex items-center justify-between border border-gray-300 rounded px-3 py-1.5 text-xs text-gray-700 font-bold bg-white hover:bg-gray-50 transition-colors shadow-sm">
                                        <span className="truncate">{cat.name}</span>
                                        <ChevronDown size={14} className={clsx("text-gray-400 Transition-transform", openCats[cat.id] && "rotate-180")} />
                                    </button>
                                    {openCats[cat.id] && (
                                        <div className="border border-gray-200 rounded p-2 bg-gray-50/50 space-y-2 max-h-96 overflow-y-auto">
                                            {renderProducts("corporate", cat.products)}
                                        </div>
                                    )}
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* 4. Core Plans */}
                    <div className="border border-gray-300 rounded-sm bg-white p-4 space-y-4 shadow-sm">
                        <p className="text-[10px] text-gray-500 font-bold uppercase tracking-tight">Core Plans (100% premium paid directly by employer)</p>
                        <div className="flex gap-4 items-start overflow-x-auto pb-4 scrollbar-thin scrollbar-thumb-gray-300">
                            {PLAN_CATEGORIES.CORE.map(cat => (
                                <div key={cat.id} className="min-w-[320px] max-w-[350px] space-y-3">
                                    <button onClick={() => toggleCat(cat.id)} className="w-full flex items-center justify-between border border-gray-300 rounded px-3 py-1.5 text-xs text-[#1e3a5f] font-bold bg-white hover:bg-blue-50/30 transition-colors shadow-sm">
                                        <span className="truncate">{cat.name}</span>
                                        <ChevronDown size={14} className={clsx("text-gray-400 Transition-transform", openCats[cat.id] && "rotate-180")} />
                                    </button>
                                    {openCats[cat.id] && (
                                        <div className="space-y-3">
                                            {cat.subcategories ? cat.subcategories.map(sub => (
                                                <div key={sub.id} className="border border-slate-300 rounded-md overflow-hidden bg-slate-50 shadow-sm">
                                                    <button onClick={() => toggleSubCat(sub.id)} className="w-full flex items-center justify-between bg-[#2d4d75] px-3 py-2 text-[11px] font-bold text-white uppercase tracking-wider hover:bg-[#1e3a5f] transition-colors">
                                                        {sub.name} <ChevronDown size={14} className={clsx("transition-transform", openSubCats[sub.id] && "rotate-180")} />
                                                    </button>
                                                    {openSubCats[sub.id] && (
                                                        <div className="bg-[#f0f4f8] p-2 space-y-2">
                                                            {renderProducts("core", sub.products)}
                                                        </div>
                                                    )}
                                                </div>
                                            )) : (
                                                <div className="border border-gray-200 rounded p-2 bg-gray-50/50 space-y-2 max-h-[500px] overflow-y-auto">
                                                    {renderProducts("core", cat.products)}
                                                </div>
                                            )}
                                        </div>
                                    )}
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* 5. Upgrade Plans Bar */}
                    <div className="border border-gray-300 rounded-sm bg-white overflow-hidden shadow-sm">
                        <div className="p-3 border-b border-gray-100 flex items-center justify-between">
                            <p className="text-[10px] text-gray-500 font-bold uppercase tracking-tight">Upgrade Plans (Premium difference paid by employee through payroll deduction).</p>
                            <div className="flex items-center gap-4 text-[11px] font-bold text-[#1e3a5f]">
                                <span>Enabled?</span>
                                <div className="flex gap-3">
                                    <label className="flex items-center gap-1.5 cursor-pointer hover:text-blue-700 transition-colors">
                                        <input
                                            type="radio"
                                            checked={enableUpgrade}
                                            onChange={() => {
                                                if (plans.core.length === 0) {
                                                    setShowInfoModal(true);
                                                    return;
                                                }
                                                setEnableUpgrade(true);
                                            }}
                                            className="h-3.5 w-3.5 border-gray-300 text-blue-600"
                                        /> Yes
                                    </label>
                                    <label className="flex items-center gap-1.5 cursor-pointer hover:text-blue-700 transition-colors">
                                        <input
                                            type="radio"
                                            checked={!enableUpgrade}
                                            onChange={() => setEnableUpgrade(false)}
                                            className="h-3.5 w-3.5 border-gray-300 text-blue-600"
                                        /> No
                                    </label>
                                </div>
                            </div>
                        </div>
                        {enableUpgrade && (
                            <div className="p-4 flex gap-4 overflow-x-auto pb-4 scrollbar-thin scrollbar-thumb-gray-300 bg-gray-50/20">
                                {PLAN_CATEGORIES.UPGRADE.map(cat => (
                                    <div key={cat.id} className="min-w-[320px] max-w-[350px] space-y-3">
                                        <button onClick={() => toggleCat(cat.id)} className="w-full flex items-center justify-between border border-gray-300 rounded px-3 py-1.5 text-xs text-[#1e3a5f] font-bold bg-white hover:bg-blue-50/30 transition-colors shadow-sm">
                                            <span className="truncate">{cat.name}</span>
                                            <ChevronDown size={14} className={clsx("text-gray-400 Transition-transform", openCats[cat.id] && "rotate-180")} />
                                        </button>
                                        {openCats[cat.id] && (
                                            <div className="space-y-3">
                                                {cat.subcategories ? cat.subcategories.map(sub => (
                                                    <div key={sub.id} className="border border-slate-300 rounded-md overflow-hidden bg-slate-50 shadow-sm">
                                                        <button onClick={() => toggleSubCat(sub.id)} className="w-full flex items-center justify-between bg-[#2d4d75] px-3 py-2 text-[11px] font-bold text-white uppercase tracking-wider hover:bg-[#1e3a5f] transition-colors">
                                                            {sub.name} <ChevronDown size={14} className={clsx("transition-transform", openSubCats[sub.id] && "rotate-180")} />
                                                        </button>
                                                        {openSubCats[sub.id] && (
                                                            <div className="bg-[#f0f4f8] p-2 space-y-2">
                                                                {renderProducts("upgrade", sub.products)}
                                                            </div>
                                                        )}
                                                    </div>
                                                )) : (
                                                    <div className="border border-gray-200 rounded p-2 bg-gray-50/50 space-y-2 max-h-[500px] overflow-y-auto">
                                                        {renderProducts("upgrade", cat.products)}
                                                    </div>
                                                )}
                                            </div>
                                        )}
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>

                    {/* 6. Voluntary Plans */}
                    <div className="border border-gray-300 rounded-sm bg-white overflow-hidden shadow-sm">
                        <div className="p-3 border-b border-gray-100 flex items-center justify-between">
                            <p className="text-[10px] text-gray-500 font-bold uppercase tracking-tight">Voluntary Plans (100% Premium paid directly by employee)</p>
                            <div className="flex items-center gap-4 text-[11px] font-bold text-[#1e3a5f]">
                                <span>Enabled?</span>
                                <div className="flex gap-3">
                                    <label className="flex items-center gap-1.5 cursor-pointer hover:text-blue-700 transition-colors">
                                        <input
                                            type="radio"
                                            checked={enableVoluntary}
                                            onChange={() => setEnableVoluntary(true)}
                                            className="h-3.5 w-3.5 border-gray-300 text-blue-600"
                                        /> Yes
                                    </label>
                                    <label className="flex items-center gap-1.5 cursor-pointer hover:text-blue-700 transition-colors">
                                        <input
                                            type="radio"
                                            checked={!enableVoluntary}
                                            onChange={() => setEnableVoluntary(false)}
                                            className="h-3.5 w-3.5 border-gray-300 text-blue-600"
                                        /> No
                                    </label>
                                </div>
                            </div>
                        </div>
                        {enableVoluntary && (
                            <div className="p-4 flex gap-4 overflow-x-auto pb-4 scrollbar-thin scrollbar-thumb-gray-300 bg-gray-50/20">
                                {PLAN_CATEGORIES.VOLUNTARY.map(cat => (
                                    <div key={cat.id} className="min-w-[320px] max-w-[350px] space-y-3">
                                        <button onClick={() => toggleCat(cat.id)} className="w-full flex items-center justify-between border border-gray-300 rounded px-3 py-1.5 text-xs text-[#1e3a5f] font-bold bg-white hover:bg-blue-50/30 transition-colors shadow-sm">
                                            <span className="truncate">{cat.name}</span>
                                            <ChevronDown size={14} className={clsx("text-gray-400 Transition-transform", openCats[cat.id] && "rotate-180")} />
                                        </button>
                                        {openCats[cat.id] && (
                                            <div className="space-y-3">
                                                {cat.subcategories ? cat.subcategories.map(sub => (
                                                    <div key={sub.id} className="border border-slate-300 rounded-md overflow-hidden bg-slate-50 shadow-sm">
                                                        <button onClick={() => toggleSubCat(sub.id)} className="w-full flex items-center justify-between bg-[#2d4d75] px-3 py-2 text-[11px] font-bold text-white uppercase tracking-wider hover:bg-[#1e3a5f] transition-colors">
                                                            {sub.name} <ChevronDown size={14} className={clsx("transition-transform", openSubCats[sub.id] && "rotate-180")} />
                                                        </button>
                                                        {openSubCats[sub.id] && (
                                                            <div className="bg-[#f0f4f8] p-2 space-y-2">
                                                                {renderProducts("voluntary", sub.products)}
                                                            </div>
                                                        )}
                                                    </div>
                                                )) : (
                                                    <div className="border border-gray-200 rounded p-2 bg-gray-50/50 space-y-2 max-h-[500px] overflow-y-auto">
                                                        {renderProducts("voluntary", cat.products)}
                                                    </div>
                                                )}
                                            </div>
                                        )}
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                </div>

                {/* Sticky Footer */}
                <div className="bg-white px-6 py-3 flex justify-end gap-3 border-t border-gray-200 sticky bottom-0 z-50 shadow-[0_-4px_10px_rgba(0,0,0,0.03)]">
                    <button onClick={handleSubmit(onFormSubmit)} className="bg-[#1e3a5f] rounded px-8 py-2 text-[11px] font-black text-white hover:bg-slate-800 transition-all shadow-md uppercase tracking-wide">Save</button>
                    <button onClick={onCancel} className="bg-white border border-slate-300 rounded px-8 py-2 text-[11px] font-black text-[#1e3a5f] hover:bg-slate-50 hover:border-slate-400 transition-all shadow-sm uppercase tracking-wide">Close</button>
                </div>

                {/* Edit Head Count Modal */}
                {showHeadCountModal && (
                    <div className="absolute inset-0 z-[70] flex items-center justify-center bg-black/40 backdrop-blur-[2px]">
                        <div className="w-[450px] bg-white rounded-lg shadow-2xl overflow-hidden border border-gray-300">
                            <div className="bg-[#1e3a5f] px-4 py-2 flex items-center justify-between">
                                <h4 className="text-[13px] font-bold text-white">Edit Head Count</h4>
                                <button onClick={() => setShowHeadCountModal(null)} className="text-white hover:text-gray-300"><X size={16} /></button>
                            </div>
                            <div className="p-8 space-y-6">
                                <div className="grid grid-cols-2 gap-y-4 items-center">
                                    <span className="text-xs font-bold text-gray-600">Current Head Count:</span>
                                    <input type="text" value={plans[showHeadCountModal.section].find((px: any) => px.id === showHeadCountModal.product.id && px.variant === showHeadCountModal.variant)?.headcount || 1} readOnly className="w-16 border border-gray-300 rounded px-2 py-1 text-xs bg-gray-100 text-center outline-none" />
                                    <span className="text-xs font-bold text-gray-600">New Head Count:</span>
                                    <input type="number" id="new-hc-input" defaultValue={1} className="w-16 border border-gray-300 rounded px-2 py-1 text-xs text-center focus:border-blue-500 focus:ring-1 focus:ring-blue-100 outline-none" />
                                    <span className="text-xs font-bold text-gray-600">Effective Date:</span>
                                    <select className="border border-gray-300 rounded px-2 py-1 text-xs w-36 font-bold text-slate-700 bg-gray-50 outline-none">
                                        <option>Jan-01-2026</option>
                                        <option selected>Feb-01-2026</option>
                                        <option>Mar-01-2026</option>
                                        <option>Apr-01-2026</option>
                                    </select>
                                </div>
                            </div>
                            <div className="bg-gray-50 px-4 py-3 border-t border-gray-200 flex justify-center gap-3">
                                <button onClick={() => setShowHeadCountModal(null)} className="px-6 py-1.5 border border-gray-300 rounded bg-white text-xs font-bold text-[#1e3a5f] hover:bg-gray-50">Close</button>
                                <button onClick={() => {
                                    const input = document.getElementById('new-hc-input') as HTMLInputElement;
                                    updateHeadCount(Number(input?.value || 1));
                                }} className="px-6 py-1.5 bg-[#1e3a5f] rounded text-xs font-bold text-white shadow-sm hover:bg-slate-800 transition-colors">Update</button>
                            </div>
                        </div>
                    </div>
                )}

                {/* Info Modal */}
                {showInfoModal && (
                    <div className="absolute inset-0 z-[80] flex items-center justify-center bg-black/40 backdrop-blur-[1px]">
                        <div className="w-[480px] bg-white rounded shadow-2xl overflow-hidden border border-gray-300">
                            <div className="bg-[#1e3a5f] px-4 py-2 flex justify-center">
                                <h4 className="text-[14px] font-bold text-white">Info</h4>
                            </div>
                            <div className="p-10 flex flex-col items-center justify-center space-y-8">
                                <p className="text-[15px] font-medium text-gray-700 text-center">Please select one core plan from above</p>
                                <button
                                    onClick={() => setShowInfoModal(false)}
                                    className="px-8 py-1.5 bg-[#1e3a5f] rounded text-xs font-bold text-white shadow hover:bg-slate-800 transition-colors min-w-[80px]"
                                >
                                    OK
                                </button>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}
