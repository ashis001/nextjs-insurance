"use client";

import React, { useMemo } from "react";
import { useForm, useFieldArray, SubmitHandler } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Corporate } from "@/lib/types";
import { useCorporateEngine } from "./useCorporateEngine";
import { Loader2, UploadCloud, Send } from "lucide-react";
import { speakText } from "@/lib/google-tts";
import { useEffect, useState, useRef } from "react";
import clsx from "clsx";
import { SAMPLE_CORPORATE_1 } from "@/lib/sample-data";
import { useChat } from "@/context/ChatContext";

// Define the schema
const corporateSchema = z.object({
    broker: z.string().optional(),
    selectProfile: z.string().optional(),
    paymentPlatform: z.string().optional(),

    name: z.string().min(2, "Company name is required"),
    provincialOffices: z.string().min(1, "Provincial office required"),

    policyStartDate: z.string().refine((val) => !isNaN(Date.parse(val)), "Invalid date"),
    contactEmail: z.string().email("Invalid email"),
    address: z.object({
        street1: z.string().min(5, "Street address required"),
        street2: z.string().optional(),
        unit: z.string().optional(),
        city: z.string().min(2, "City required"),
        province: z.string().min(2, "Province required"),
        country: z.string().min(2, "Country required"),
        postalCode: z.string().min(5, "Postal code required"),
    }),

    contacts: z.array(z.object({
        firstName: z.string().min(1, "First name required"),
        lastName: z.string().min(1, "Last name required"),
        phone: z.string().min(10, "Phone required"),
        email: z.string().email("Invalid email"),
        role: z.string().min(1, "Role required"),
    })).min(1, "At least one contact required"),

    waitingPeriodInitial: z.string().min(1, "Selection required"),
    waitingPeriodNewHires: z.string().min(1, "Selection required"),
    defineCoverageTiers: z.string().min(1, "Selection required"),
    paymentMethod: z.string().min(1, "Selection required"),
    showEmployerName: z.string().min(1, "Selection required"),
    employeeCount: z.union([z.coerce.number(), z.string(), z.null()]).optional(),
});

export type FormValues = z.infer<typeof corporateSchema>;

export function CorporateInfoForm({ engine }: { engine: ReturnType<typeof useCorporateEngine> }) {
    const { corporate, updateCorporateInfo, isSaving } = engine;

    const defaultValues: FormValues = useMemo(() => ({
        broker: corporate.broker || "",
        selectProfile: corporate.selectProfile || "",
        paymentPlatform: corporate.paymentPlatform || "AuthorizeNet",

        name: corporate.name || "",
        provincialOffices: corporate.provincialOffices || "",

        policyStartDate: corporate.policyStartDate ? new Date(corporate.policyStartDate).toISOString().split('T')[0] : "",
        contactEmail: corporate.contactEmail || "",

        address: corporate.address || { street1: "", city: "", province: "", country: "Canada", postalCode: "" },

        contacts: corporate.contacts && corporate.contacts.length > 0
            ? corporate.contacts.map(c => ({
                firstName: c.firstName || "",
                lastName: c.lastName || "",
                phone: c.phone || "",
                email: c.email || "",
                role: c.role || "Select"
            }))
            : [{ firstName: "", lastName: "", phone: "", email: "", role: "Select" }],

        waitingPeriodInitial: corporate.waitingPeriodInitial === null ? "" : (corporate.waitingPeriodInitial ? "yes" : "no"),
        waitingPeriodNewHires: corporate.waitingPeriodNewHires || "",
        defineCoverageTiers: corporate.defineCoverageTiers === null ? "" : (corporate.defineCoverageTiers ? "yes" : "no"),
        paymentMethod: corporate.paymentMethod || "",
        showEmployerName: corporate.showEmployerName === null ? "" : (corporate.showEmployerName ? "yes" : "no"),
        employeeCount: corporate.employeeCount === null ? "" : corporate.employeeCount,
    }), [corporate]);

    const { register, control, handleSubmit, watch, setValue, formState: { errors } } = useForm<FormValues>({
        resolver: zodResolver(corporateSchema) as any,
        defaultValues
    });

    const selectedBroker = watch("broker");
    const profileOptions = [
        "Corporate Insurance",
        "Health Insurance",
        "Dental Insurance",
        "All of Them"
    ];

    const { fields } = useFieldArray({
        control,
        name: "contacts"
    });

    const selectedCountry = watch("address.country");

    const CANADA_PROVINCES = [
        "Alberta", "British Columbia", "Manitoba", "New Brunswick",
        "Newfoundland and Labrador", "Nova Scotia", "Ontario",
        "Prince Edward Island", "Quebec", "Saskatchewan",
        "Northwest Territories", "Nunavut", "Yukon"
    ];

    const US_STATES = [
        "Alabama", "Alaska", "Arizona", "Arkansas", "California", "Colorado", "Connecticut", "Delaware", "Florida", "Georgia",
        "Hawaii", "Idaho", "Illinois", "Indiana", "Iowa", "Kansas", "Kentucky", "Louisiana", "Maine", "Maryland",
        "Massachusetts", "Michigan", "Minnesota", "Mississippi", "Missouri", "Montana", "Nebraska", "Nevada", "New Hampshire", "New Jersey",
        "New Mexico", "New York", "North Carolina", "North Dakota", "Ohio", "Oklahoma", "Oregon", "Pennsylvania", "Rhode Island", "South Carolina",
        "South Dakota", "Tennessee", "Texas", "Utah", "Vermont", "Virginia", "Washington", "West Virginia", "Wisconsin", "Wyoming"
    ];

    // --- GUIDE LOGIC ---
    const [isEmailHighlighted, setIsEmailHighlighted] = useState(false);
    const hasSpokenEmailRef = useRef(false);
    const hasSpokenRoleRef = useRef(false);
    const emailValue = watch("contacts.0.email");

    const { openChat, isMuted } = useChat();
    const [activeFillingField, setActiveFillingField] = useState<string | null>(null);
    const [isSubmittingHighlighted, setIsSubmittingHighlighted] = useState(false);
    const [countdown, setCountdown] = useState<number | null>(null);
    const timerRef = useRef<NodeJS.Timeout | null>(null);
    const [pointerPos, setPointerPos] = useState<{ top: number, left: number } | null>(null);

    const VOICE_MESSAGES: Record<string, string> = {
        "broker": "Please select the correct broker to manage your account effectively.",
        "selectProfile": "Choosing the right insurance type is critical to ensure proper coverage for your group.",
        "paymentPlatform": "We'll configure your preferred payment gateway for secure and seamless transactions.",
        "name": "Let's capture the correct legal name of your corporation.",
        "provincialOffices": "Indicating your primary office location allows us to apply regional benefit standards.",
        "policyStartDate": "The policy start date determines exactly when your benefits and coverage will go live.",
        "contactEmail": "A valid email is vital for all future policy updates and certificates.",
        "address.street1": "Please type your address.",
        "address.unit": "Please include any suite or unit numbers.",
        "address.city": "Please type your city.",
        "address.province": "Please select your province.",
        "address.country": "Please select your country.",
        "address.postalCode": "Finally, enter your postal code to complete the address.",
        "contacts.0.firstName": "Please enter the first name of your primary contact.",
        "contacts.0.lastName": "Please enter the last name.",
        "contacts.0.phone": "Please enter a valid phone number.",
        "waitingPeriodInitial": "Please select the waiting period for initial enrollment.",
        "waitingPeriodNewHires": "Please specify the waiting period for new hires.",
        "defineCoverageTiers": "Choose whether you want to define specific coverage tiers.",
        "paymentMethod": "Please select your preferred payment method.",
        "showEmployerName": "Would you like to display the employer name on member portals?",
        "employeeCount": "Please enter the approximate number of employees."
    };

    useEffect(() => {
        return () => {
            if (timerRef.current) clearInterval(timerRef.current);
        };
    }, []);

    useEffect(() => {
        const guideStep = localStorage.getItem("max_guide_step");

        if (guideStep === "add_customer") {
            const runGuide = async () => {
                // Helper for natural delay
                const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

                // 1. Auto-fill data sequentially (Simulating user input)
                const fillField = async (field: any, value: any) => {
                    if (value !== undefined && value !== null) {
                        const el = document.getElementById(field) as HTMLElement | null;
                        if (el) {
                            el.scrollIntoView({ behavior: 'smooth', block: 'center' });
                            // Wait for scroll to finish
                            await delay(600);
                            const updatePos = () => {
                                const rect = el.getBoundingClientRect();
                                setPointerPos({ top: rect.top, left: rect.left });
                            };
                            updatePos();
                            el.focus();
                        }

                        setActiveFillingField(field);

                        // Professional Voice-Over - AWAIT completion
                        await speakText(VOICE_MESSAGES[field]);

                        // Re-sync position before action
                        if (el) {
                            const rect = el.getBoundingClientRect();
                            setPointerPos({ top: rect.top, left: rect.left });
                        }

                        // If it's a dropdown or radio, simulate selection pause
                        const isSelect = el?.tagName === 'SELECT';
                        const isRadio = field.includes('waitingPeriod') || field.includes('defineCoverage') || field.includes('paymentMethod') || field.includes('showEmployer');

                        if (isSelect) {
                            const selectEl = el as HTMLSelectElement;
                            const originalBackground = selectEl.style.backgroundColor;
                            selectEl.style.backgroundColor = '#f0f9ff'; // Gentle highlight
                            await delay(500);
                            setValue(field, value);
                            await delay(800);
                            selectEl.style.backgroundColor = originalBackground;
                        } else if (isRadio) {
                            await delay(500);
                            setValue(field, value);
                            await delay(800);
                        } else {
                            // Realistic character-by-character typing
                            await delay(300);
                            const textValue = String(value);
                            let currentText = "";
                            for (let i = 0; i < textValue.length; i++) {
                                currentText += textValue[i];
                                setValue(field, currentText);
                                await delay(Math.random() * 30 + 20);
                            }
                            await delay(500);
                        }

                        setActiveFillingField(null);
                        setPointerPos(null);
                        if (el) el.blur();
                    }
                };

                await delay(500);
                await fillField("broker", SAMPLE_CORPORATE_1.broker);
                await fillField("selectProfile", SAMPLE_CORPORATE_1.selectProfile);
                await fillField("paymentPlatform", SAMPLE_CORPORATE_1.paymentPlatform);

                await delay(300);
                await fillField("name", SAMPLE_CORPORATE_1.name || "TechFlow Solutions Inc.");
                await fillField("provincialOffices", SAMPLE_CORPORATE_1.provincialOffices);

                await delay(300);
                if (SAMPLE_CORPORATE_1.policyStartDate) {
                    await fillField("policyStartDate", new Date(SAMPLE_CORPORATE_1.policyStartDate).toISOString().split('T')[0]);
                }
                await fillField("contactEmail", SAMPLE_CORPORATE_1.contactEmail);

                await delay(300);
                if (SAMPLE_CORPORATE_1.address) {
                    await fillField("address.street1", SAMPLE_CORPORATE_1.address.street1);
                    if (SAMPLE_CORPORATE_1.address.unit) await fillField("address.unit", SAMPLE_CORPORATE_1.address.unit);

                    await fillField("address.city", SAMPLE_CORPORATE_1.address.city);
                    await fillField("address.country", SAMPLE_CORPORATE_1.address.country);
                    await fillField("address.province", SAMPLE_CORPORATE_1.address.province);
                    await fillField("address.postalCode", SAMPLE_CORPORATE_1.address.postalCode);
                }

                await delay(300);
                // HR Contact Info (Name & Phone only)
                if (SAMPLE_CORPORATE_1.contacts && SAMPLE_CORPORATE_1.contacts.length > 0) {
                    const contact = SAMPLE_CORPORATE_1.contacts[0];
                    await fillField("contacts.0.firstName", contact.firstName);
                    await fillField("contacts.0.lastName", contact.lastName);
                    await fillField("contacts.0.phone", contact.phone);
                }

                await fillField("waitingPeriodInitial", SAMPLE_CORPORATE_1.waitingPeriodInitial ? "yes" : "no");
                await fillField("waitingPeriodNewHires", SAMPLE_CORPORATE_1.waitingPeriodNewHires);
                await fillField("defineCoverageTiers", SAMPLE_CORPORATE_1.defineCoverageTiers ? "yes" : "no");
                await fillField("paymentMethod", SAMPLE_CORPORATE_1.paymentMethod);
                await fillField("showEmployerName", SAMPLE_CORPORATE_1.showEmployerName ? "yes" : "no");
                await fillField("employeeCount", SAMPLE_CORPORATE_1.employeeCount || 150);

                // 2. Speak Feedback & Show in Chat
                await delay(500);
                const msg = "I’ve filled sample company details for you. Please enter the HR contact email.";
                openChat(msg); // This displays text AND speaks it (via ChatContext logic if implemented, or we speak manually)
                // ChatContext openChat usually sets externalMessage. RightChatPanel receives it and calls speakText. 
                // So we DON'T need to call speakText manually if openChat does it.
                // Let's assume openChat triggers the flow.

                // 3. Highlight Email
                setIsEmailHighlighted(true);
            };

            // Only run if fields are empty to avoid overwriting user edits
            // But for "Use Sample Data" flow, strictly following the script is better
            runGuide();

            // Clear step prevents re-running on refresh, but we might want to keep it until flow is done
            // For now, we rely on the logic running once effectively.
            localStorage.removeItem("max_guide_step");
        }
    }, [setValue]);

    useEffect(() => {
        if (isEmailHighlighted && emailValue && emailValue.includes("@") && emailValue.includes(".")) {
            if (!hasSpokenRoleRef.current) {
                hasSpokenRoleRef.current = true;
                const finishGuide = async () => {
                    // Update Chat UI with the message instead of just speaking
                    openChat("This HR contact will get admin access to manage employees and policies.");
                    setValue("contacts.0.role", "HR Admin Access");
                    setIsEmailHighlighted(false);

                    // Auto-navigation sequence
                    setIsSubmittingHighlighted(true);
                    let count = 10;
                    setCountdown(count);

                    timerRef.current = setInterval(() => {
                        count -= 1;
                        if (count <= 0) {
                            if (timerRef.current) clearInterval(timerRef.current);
                            setCountdown(0);
                            handleSubmit(onSubmit)();
                        } else {
                            setCountdown(count);
                        }
                    }, 1000);
                };
                finishGuide();
            }
        }
    }, [emailValue, isEmailHighlighted, setValue, handleSubmit]);

    const onSubmit: SubmitHandler<FormValues> = async (data) => {
        try {
            updateCorporateInfo({
                broker: data.broker,
                name: data.name,
                policyStartDate: new Date(data.policyStartDate),
                contactEmail: data.contactEmail,
                address: data.address,
                contacts: data.contacts,
                waitingPeriodInitial: data.waitingPeriodInitial === "" ? null : data.waitingPeriodInitial === "yes",
                waitingPeriodNewHires: data.waitingPeriodNewHires as any,
                defineCoverageTiers: data.defineCoverageTiers === "" ? null : data.defineCoverageTiers === "yes",
                paymentMethod: data.paymentMethod as any,
                showEmployerName: data.showEmployerName === "" ? null : data.showEmployerName === "yes",
                employeeCount: (data.employeeCount === "" || data.employeeCount === null || data.employeeCount === undefined) ? null : Number(data.employeeCount),
                corporateInfoCompleted: true,

                // New fields
                selectProfile: data.selectProfile,
                provincialOffices: data.provincialOffices,
                paymentPlatform: data.paymentPlatform
            });
            engine.setSetupStage("TIERS");
        } catch (error) {
            console.error("Error submitting form:", error);
        }
    };

    return (
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-2">
            {/* Header */}
            <div className="bg-[#0a1e3b] px-4 py-2.5 rounded-t-xl">
                <h3 className="text-xs font-black uppercase tracking-widest text-white/90">Corporate Customer Info</h3>
            </div>

            {/* Main Form Area - White Background */}
            <div className="bg-white p-4 grid gap-4">

                {/* Row 1: Broker, Select Profile, Payment Platform */}
                <div className="grid grid-cols-3 gap-4">
                    <div>
                        <label className="block text-xs text-gray-600 mb-1">Broker</label>
                        <select
                            id="broker"
                            {...register("broker")}
                            className={clsx(
                                "w-full rounded border px-3 py-1.5 text-sm transition-all duration-500",
                                activeFillingField === "broker" ? "border-blue-500 ring-4 ring-blue-500/30 bg-blue-50/50 scale-[1.05] shadow-xl z-10" : "border-gray-300 bg-gray-50"
                            )}
                        >
                            <option value="">Select</option>
                            <option value="Sarah Johnson-ADVISOR-1001">Sarah Johnson-ADVISOR-1001</option>
                            <option value="Emily Davis-ADVISOR-1002">Emily Davis-ADVISOR-1002</option>
                            <option value="David Miller-ADVISOR-1003">David Miller-ADVISOR-1003</option>
                            <option value="James Anderson-ADVISOR-1004">James Anderson-ADVISOR-1004</option>
                            <option value="John-ADVISOR-1005">John-ADVISOR-1005</option>
                        </select>
                    </div>
                    <div>
                        <label className="block text-xs text-gray-600 mb-1">Insurance Type</label>
                        <select
                            id="selectProfile"
                            {...register("selectProfile")}
                            className={clsx(
                                "w-full rounded border px-3 py-1.5 text-sm transition-all duration-500",
                                activeFillingField === "selectProfile" ? "border-blue-500 ring-4 ring-blue-500/30 bg-blue-50/50 scale-[1.05] shadow-xl z-10" : "border-gray-300 bg-gray-50"
                            )}
                        >
                            <option value="">Select</option>
                            {profileOptions.map(opt => (
                                <option key={opt} value={opt}>{opt}</option>
                            ))}
                        </select>
                    </div>
                    <div>
                        <label className="block text-xs text-gray-600 mb-1">Payment Gateway</label>
                        <select
                            id="paymentPlatform"
                            {...register("paymentPlatform")}
                            className={clsx(
                                "w-full rounded border px-3 py-1.5 text-sm transition-all duration-500",
                                activeFillingField === "paymentPlatform" ? "border-blue-500 ring-4 ring-blue-500/30 bg-blue-50/50 scale-[1.05] shadow-xl z-10" : "border-gray-300 bg-gray-50"
                            )}
                        >
                            <option value="AuthorizeNet">AuthorizeNet</option>
                            <option value="Stripe">Stripe</option>
                        </select>
                    </div>
                </div>

                {/* Row 2: Name of Corporation, Provincial offices */}
                <div className="grid grid-cols-2 gap-4">
                    <div>
                        <label className="block text-xs text-gray-600 mb-1">Name of Corporation*</label>
                        <input
                            id="name"
                            {...register("name")}
                            className={clsx(
                                "w-full rounded border px-3 py-1.5 text-sm transition-all duration-300",
                                activeFillingField === "name" ? "border-blue-500 ring-2 ring-blue-500/20 bg-blue-50 scale-[1.02] shadow-md" : "border-gray-300 bg-gray-50"
                            )}
                            placeholder="Name of Corporation"
                        />
                        {errors.name && <p className="text-xs text-red-500 mt-0.5">{errors.name.message}</p>}
                    </div>
                    <div>
                        <label className="block text-xs text-gray-600 mb-1">Offices in Operation*</label>
                        <select
                            id="provincialOffices"
                            {...register("provincialOffices")}
                            className={clsx(
                                "w-full rounded border px-3 py-1.5 text-sm transition-all duration-300",
                                activeFillingField === "provincialOffices" ? "border-blue-500 ring-2 ring-blue-500/20 bg-blue-50 scale-[1.02] shadow-md" : "border-gray-300 bg-gray-50"
                            )}
                        >
                            <option value="">Select</option>
                            <option value="Toronto">Toronto</option>
                            <option value="Vancouver">Vancouver</option>
                            <option value="Montreal">Montreal</option>
                            <option value="Calgary">Calgary</option>
                            <option value="Ottawa">Ottawa</option>
                            <option value="Edmonton">Edmonton</option>
                        </select>
                        {errors.provincialOffices && <p className="text-xs text-red-500 mt-0.5">{errors.provincialOffices.message}</p>}
                    </div>
                </div>

                {/* Row 3: Start Date, Email, Street Address */}
                <div className="grid grid-cols-3 gap-4">
                    <div>
                        <label className="block text-xs text-gray-600 mb-1">Policy Start Date*</label>
                        <input
                            id="policyStartDate"
                            type="date"
                            {...register("policyStartDate")}
                            className={clsx(
                                "w-full rounded border px-3 py-1.5 text-sm transition-all duration-300",
                                activeFillingField === "policyStartDate" ? "border-blue-500 ring-2 ring-blue-500/20 bg-blue-50 scale-[1.02] shadow-md" : "border-gray-300 bg-gray-50"
                            )}
                        />
                    </div>
                    <div>
                        <label className="block text-xs text-gray-600 mb-1">Contact Email*</label>
                        <input
                            id="contactEmail"
                            type="email"
                            {...register("contactEmail")}
                            className={clsx(
                                "w-full rounded border px-3 py-1.5 text-sm transition-all duration-300",
                                activeFillingField === "contactEmail" ? "border-blue-500 ring-2 ring-blue-500/20 bg-blue-50 scale-[1.02] shadow-md" : "border-gray-300 bg-gray-50"
                            )}
                            placeholder="Contact Email"
                        />
                    </div>
                    <div>
                        <label className="block text-xs text-gray-600 mb-1">Street Address*</label>
                        <input
                            id="address.street1"
                            {...register("address.street1")}
                            className={clsx(
                                "w-full rounded border px-3 py-1.5 text-sm transition-all duration-300",
                                activeFillingField === "address.street1" ? "border-blue-500 ring-2 ring-blue-500/20 bg-blue-50 scale-[1.02] shadow-md" : "border-gray-300 bg-gray-50"
                            )}
                            placeholder="Street Address"
                        />
                    </div>
                </div>

                {/* Row 4: Street Address 2, Unit/Apt, City */}
                <div className="grid grid-cols-3 gap-4">
                    <div>
                        <label className="block text-xs text-gray-600 mb-1">Street Address Line 2</label>
                        <input
                            id="address.street2"
                            {...register("address.street2")}
                            className={clsx(
                                "w-full rounded border px-3 py-1.5 text-sm transition-all duration-300",
                                activeFillingField === "address.street2" ? "border-blue-500 ring-2 ring-blue-500/20 bg-blue-50 scale-[1.02] shadow-md" : "border-gray-300 bg-gray-50"
                            )}
                            placeholder="Street Address Line 2"
                        />
                    </div>
                    <div>
                        <label className="block text-xs text-gray-600 mb-1">Unit/Apt/Suite #</label>
                        <input
                            id="address.unit"
                            {...register("address.unit")}
                            className={clsx(
                                "w-full rounded border px-3 py-1.5 text-sm transition-all duration-300",
                                activeFillingField === "address.unit" ? "border-blue-500 ring-2 ring-blue-500/20 bg-blue-50 scale-[1.02] shadow-md" : "border-gray-300 bg-gray-50"
                            )}
                            placeholder="Unit/Apt/Suite #"
                        />
                    </div>
                    <div>
                        <label className="block text-xs text-gray-600 mb-1">City*</label>
                        <input
                            id="address.city"
                            {...register("address.city")}
                            className={clsx(
                                "w-full rounded border px-3 py-1.5 text-sm transition-all duration-300",
                                activeFillingField === "address.city" ? "border-blue-500 ring-2 ring-blue-500/20 bg-blue-50 scale-[1.02] shadow-md" : "border-gray-300 bg-gray-50"
                            )}
                            placeholder="City"
                        />
                    </div>
                </div>

                {/* Row 5: Country, Province, Postal Code */}
                <div className="grid grid-cols-3 gap-4">
                    <div>
                        <label className="block text-xs text-gray-600 mb-1">Country*</label>
                        <select
                            id="address.country"
                            {...register("address.country")}
                            className={clsx(
                                "w-full rounded border px-3 py-1.5 text-sm transition-all duration-300",
                                activeFillingField === "address.country" ? "border-blue-500 ring-2 ring-blue-500/20 bg-blue-50 scale-[1.02] shadow-md" : "border-gray-300 bg-gray-50"
                            )}
                        >
                            <option value="Canada">Canada</option>
                            <option value="USA">USA</option>
                        </select>
                    </div>
                    <div>
                        <label className="block text-xs text-gray-600 mb-1">Province*</label>
                        <select
                            id="address.province"
                            {...register("address.province")}
                            className={clsx(
                                "w-full rounded border px-3 py-1.5 text-sm transition-all duration-300",
                                activeFillingField === "address.province" ? "border-blue-500 ring-2 ring-blue-500/20 bg-blue-50 scale-[1.02] shadow-md" : "border-gray-300 bg-gray-50"
                            )}
                        >
                            <option value="">Select</option>
                            {selectedCountry === "Canada" ? (
                                CANADA_PROVINCES.map(p => <option key={p} value={p}>{p}</option>)
                            ) : (
                                US_STATES.map(s => <option key={s} value={s}>{s}</option>)
                            )}
                        </select>
                    </div>
                    <div>
                        <label className="block text-xs text-gray-600 mb-1">Postal Code*</label>
                        <input
                            id="address.postalCode"
                            {...register("address.postalCode")}
                            className={clsx(
                                "w-full rounded border px-3 py-1.5 text-sm transition-all duration-300 shadow-sm",
                                activeFillingField === "address.postalCode" ? "border-blue-500 ring-2 ring-blue-500/20 bg-blue-50 scale-[1.02] shadow-md" : "border-gray-300 bg-gray-50"
                            )}
                            placeholder="Postal Code"
                        />
                    </div>
                </div>

            </div>

            {/* Group Contacts Section */}
            <div className="mt-4">
                <div className="bg-[#0a1e3b] px-4 py-2.5 rounded-t-xl">
                    <h3 className="text-xs font-black uppercase tracking-widest text-white/90">HR Benefits Contacts</h3>
                </div>
                <div className="bg-white p-4 space-y-3">
                    {fields.map((field, index) => (
                        <div key={field.id} className="grid grid-cols-5 gap-2">
                            <div>
                                <label className="block text-xs text-red-500 mb-1">First Name*</label>
                                <input
                                    id={`contacts.${index}.firstName`}
                                    {...register(`contacts.${index}.firstName`)}
                                    className={clsx(
                                        "w-full rounded border px-3 py-1.5 text-sm transition-all duration-300",
                                        activeFillingField === `contacts.${index}.firstName` ? "border-blue-500 ring-2 ring-blue-500/20 bg-blue-50 scale-[1.02] shadow-md" : "border-gray-300 bg-gray-50"
                                    )}
                                    placeholder="First Name"
                                />
                            </div>
                            <div>
                                <label className="block text-xs text-red-500 mb-1">Last Name*</label>
                                <input
                                    id={`contacts.${index}.lastName`}
                                    {...register(`contacts.${index}.lastName`)}
                                    className={clsx(
                                        "w-full rounded border px-3 py-1.5 text-sm transition-all duration-300",
                                        activeFillingField === `contacts.${index}.lastName` ? "border-blue-500 ring-2 ring-blue-500/20 bg-blue-50 scale-[1.02] shadow-md" : "border-gray-300 bg-gray-50"
                                    )}
                                    placeholder="Last Name"
                                />
                            </div>
                            <div>
                                <label className="block text-xs text-red-500 mb-1">Phone Number*</label>
                                <input
                                    id={`contacts.${index}.phone`}
                                    {...register(`contacts.${index}.phone`)}
                                    className={clsx(
                                        "w-full rounded border px-3 py-1.5 text-sm transition-all duration-300",
                                        activeFillingField === `contacts.${index}.phone` ? "border-blue-500 ring-2 ring-blue-500/20 bg-blue-50 scale-[1.02] shadow-md" : "border-gray-300 bg-gray-50"
                                    )}
                                    placeholder="Phone Number"
                                />
                            </div>
                            <div>
                                <label className="block text-xs text-red-500 mb-1">Email*</label>
                                <input
                                    id={`contacts.${index}.email`}
                                    {...register(`contacts.${index}.email`)}
                                    className={clsx(
                                        "w-full rounded border px-3 py-1.5 text-sm transition-all duration-300",
                                        isEmailHighlighted && index === 0
                                            ? "border-blue-500 ring-2 ring-blue-500/20 bg-blue-50/50 shadow-[0_0_15px_rgba(59,130,246,0.5)] scale-105"
                                            : "border-gray-300 bg-gray-50"
                                    )}
                                    placeholder="Email"
                                />
                            </div>
                            <div>
                                <label className="block text-xs text-red-500 mb-1">Role*</label>
                                <select
                                    id={`contacts.${index}.role`}
                                    {...register(`contacts.${index}.role`)}
                                    className="w-full rounded border border-gray-300 px-3 py-1.5 text-sm bg-gray-50"
                                >
                                    <option value="">Select</option>
                                    <option value="Accountant">Accountant</option>
                                    <option value="Executive">Executive</option>
                                    <option value="Plan Administrator">Plan Administrator</option>
                                    <option value="System Administrator">System Administrator</option>
                                    <option value="Wellness Champion">Wellness Champion</option>
                                    <option value="HR Admin Access">HR Admin Access</option>
                                    <option value="Others">Others</option>
                                </select>
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            {/* Enrollment Section */}
            <div className="mt-4">
                <div className="bg-[#0a1e3b] px-4 py-2.5 rounded-t-xl">
                    <h3 className="text-xs font-black uppercase tracking-widest text-white/90">Enrollment Policies</h3>
                </div>
                <div className="bg-white p-4 flex gap-8">
                    <div className="flex-1">
                        <label className="block text-xs text-gray-600 mb-2 font-medium">Waiting Period for Initial Enrollment</label>
                        <div
                            id="waitingPeriodInitial"
                            className={clsx(
                                "flex gap-6 items-center p-2 rounded-lg transition-all duration-300",
                                activeFillingField === "waitingPeriodInitial" ? "ring-2 ring-blue-500/20 bg-blue-50/50 scale-[1.02]" : ""
                            )}>
                            <label className="flex items-center gap-2 text-sm text-gray-700 cursor-pointer">
                                <input type="radio" value="yes" {...register("waitingPeriodInitial")} className="text-blue-600 focus:ring-blue-500" /> Yes
                            </label>
                            <label className="flex items-center gap-2 text-sm text-gray-700 cursor-pointer">
                                <input type="radio" value="no" {...register("waitingPeriodInitial")} className="text-blue-600 focus:ring-blue-500" /> No
                            </label>
                            {errors.waitingPeriodInitial && <span className="text-xs text-red-500 font-bold ml-2">*{errors.waitingPeriodInitial.message}</span>}
                        </div>
                    </div>

                    <div className="flex-[2]">
                        <label className="block text-xs text-gray-600 mb-2 font-medium">Waiting Period for New Hires</label>
                        <div
                            id="waitingPeriodNewHires"
                            className={clsx(
                                "flex gap-4 items-center p-2 rounded-lg transition-all duration-300",
                                activeFillingField === "waitingPeriodNewHires" ? "ring-2 ring-blue-500/20 bg-blue-50/50 scale-[1.02]" : ""
                            )}>
                            {["None", "Three Months", "Six Months", "Custom"].map(opt => (
                                <label key={opt} className="flex items-center gap-2 text-sm text-gray-700 cursor-pointer">
                                    <input type="radio" value={opt} {...register("waitingPeriodNewHires")} className="text-blue-600 focus:ring-blue-500" /> {opt}
                                </label>
                            ))}
                            {errors.waitingPeriodNewHires && <span className="text-xs text-red-500 font-bold ml-2">*{errors.waitingPeriodNewHires.message}</span>}
                        </div>
                    </div>
                </div>
            </div>

            {/* Define Plan Coverage */}
            <div className="mt-4">
                <div className="bg-[#0a1e3b] px-4 py-2.5 rounded-t-xl">
                    <h3 className="text-xs font-black uppercase tracking-widest text-white/90">Define Coverage Tiers</h3>
                </div>
                <div className="bg-white p-4">
                    <div
                        id="defineCoverageTiers"
                        className={clsx(
                            "flex gap-6 items-center p-2 rounded-lg transition-all duration-300",
                            activeFillingField === "defineCoverageTiers" ? "ring-2 ring-blue-500/20 bg-blue-50/50 scale-[1.02]" : ""
                        )}>
                        <label className="flex items-center gap-2 text-sm text-gray-700">
                            <input type="radio" value="yes" {...register("defineCoverageTiers")} className="text-blue-600" /> Yes
                        </label>
                        <label className="flex items-center gap-2 text-sm text-gray-700 cursor-pointer">
                            <input type="radio" value="no" {...register("defineCoverageTiers")} className="text-blue-600 focus:ring-blue-500" /> No
                        </label>
                        {errors.defineCoverageTiers && <span className="text-xs text-red-500 font-bold ml-2">*{errors.defineCoverageTiers.message}</span>}
                    </div>
                </div>
            </div>


            {/* Bottom Grid: Payment Info, Employer Name, Employees | Corporate Logo */}
            <div className="grid grid-cols-2 gap-4">
                <div className="space-y-4">
                    <div className="mt-4">
                        <div className="bg-[#0a1e3b] px-4 py-2.5 rounded-t-xl">
                            <h3 className="text-xs font-black uppercase tracking-widest text-white/90">Payment Information</h3>
                        </div>
                        <div className="bg-white p-4">
                            <div
                                id="paymentMethod"
                                className={clsx(
                                    "flex gap-4 p-2 rounded-lg transition-all duration-300",
                                    activeFillingField === "paymentMethod" ? "ring-2 ring-blue-500/20 bg-blue-50/50 scale-[1.02]" : ""
                                )}>
                                <label className="flex items-center gap-2 text-sm text-gray-700">
                                    <input type="radio" value="Credit Card" {...register("paymentMethod")} className="text-blue-600" /> Credit Card
                                </label>
                                <label className="flex items-center gap-2 text-sm text-gray-700">
                                    <input type="radio" value="Pre Authorized Debit" {...register("paymentMethod")} className="text-blue-600" /> Pre-Authorized Debit
                                </label>
                                {errors.paymentMethod && <span className="text-xs text-red-500 font-bold ml-2">*{errors.paymentMethod.message}</span>}
                            </div>
                        </div>
                    </div>

                    {/* Show Employer Name & No. of Employees */}
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <div className="bg-[#0a1e3b] px-4 py-2.5 rounded-t-xl">
                                <h3 className="text-xs font-black uppercase tracking-widest text-white/90">Show Employer Name?</h3>
                            </div>
                            <div className="bg-white p-4">
                                <div
                                    id="showEmployerName"
                                    className={clsx(
                                        "flex gap-6 p-2 rounded-lg transition-all duration-300",
                                        activeFillingField === "showEmployerName" ? "ring-2 ring-blue-500/20 bg-blue-50/50 scale-[1.02]" : ""
                                    )}>
                                    <label className="flex items-center gap-2 text-sm text-gray-700">
                                        <input type="radio" value="yes" {...register("showEmployerName")} className="text-blue-600" /> Yes
                                    </label>
                                    <label className="flex items-center gap-2 text-sm text-gray-700">
                                        <input type="radio" value="no" {...register("showEmployerName")} className="text-blue-600" /> No
                                    </label>
                                    {errors.showEmployerName && <span className="text-xs text-red-500 font-bold ml-2">*{errors.showEmployerName.message}</span>}
                                </div>
                            </div>
                        </div>
                        <div>
                            <div className="bg-[#0a1e3b] px-4 py-2.5 rounded-t-xl">
                                <h3 className="text-xs font-black uppercase tracking-widest text-white/90">Employee Count</h3>
                            </div>
                            <div className="bg-white p-4">
                                <input
                                    type="text"
                                    {...register("employeeCount")}
                                    className={clsx(
                                        "w-full rounded border px-3 py-1.5 text-sm transition-all duration-300 shadow-sm",
                                        activeFillingField === "employeeCount" ? "border-blue-500 ring-2 ring-blue-500/20 bg-blue-50 scale-[1.02] shadow-md" : "border-gray-300 bg-gray-50"
                                    )}
                                    placeholder="0"
                                />
                            </div>
                        </div>
                    </div>
                </div>

                <div className="mt-4">
                    <div className="bg-[#0a1e3b] px-4 py-2.5 rounded-t-xl">
                        <h3 className="text-xs font-black uppercase tracking-widest text-white/90">Corporate Logo</h3>
                    </div>
                    <div className="bg-white p-4 h-[calc(100%-40px)] flex items-center justify-center">
                        <div className="w-full h-32 border-2 border-dashed border-gray-300 rounded flex flex-col items-center justify-center text-center p-4 hover:bg-gray-50 cursor-pointer">
                            <span className="text-xs text-gray-500">Click to upload company logo. Max 300x100 px (.png, .jpg)</span>
                        </div>
                    </div>
                </div>
            </div>

            {/* Save Button */}
            <div className="flex justify-end pt-6">
                <button
                    type="submit"
                    disabled={isSaving}
                    className={clsx(
                        "flex items-center gap-2 rounded-xl px-8 py-3 text-sm font-bold text-white transition-all duration-300 disabled:opacity-50",
                        isSubmittingHighlighted
                            ? "bg-green-600 ring-4 ring-green-600/20 scale-105 shadow-[0_0_20px_rgba(22,163,74,0.4)]"
                            : "bg-[#0a1e3b] hover:bg-blue-900 shadow-lg shadow-blue-900/20 hover:shadow-xl hover:-translate-y-0.5"
                    )}
                    onClick={() => {
                        if (timerRef.current) clearInterval(timerRef.current);
                        setCountdown(null);
                    }}
                >
                    {isSaving && <Loader2 className="h-4 w-4 animate-spin" />}
                    {isSubmittingHighlighted && countdown !== null && countdown > 0
                        ? `Auto-saving in ${countdown}s...`
                        : "Save & Next →"}
                </button>
            </div>
            {/* Red Floating Indicator (Follows pointerPos state) */}
            {activeFillingField && pointerPos && (
                <div
                    className="fixed z-[9999] pointer-events-none transition-all duration-300 ease-out"
                    style={{
                        left: pointerPos.left + 12,
                        top: pointerPos.top - 20,
                    }}
                >
                    <div className="relative animate-nina-guide-bounce-gentle">
                        <div className="bg-red-500 p-2 rounded-full shadow-[0_8px_20px_rgba(239,68,68,0.4)] border-2 border-white transform rotate-[105deg]">
                            <Send className="w-4 h-4 text-white fill-white" />
                        </div>
                        {/* More visible pulse */}
                        <div className="absolute inset-0 rounded-full bg-red-500 animate-ping opacity-40 scale-150" />
                    </div>
                    {/* Small pointer tail/arrow */}
                    <div className="absolute top-full left-1/2 -translate-x-1/2 -translate-y-1 w-0 h-0 border-l-[6px] border-l-transparent border-r-[6px] border-r-transparent border-t-[8px] border-t-red-500"></div>
                </div>
            )}

            <style jsx global>{`
                @keyframes nina-guide-bounce-gentle {
                  0%, 100% { transform: translateY(0); }
                  50% { transform: translateY(-4px); }
                }
                .animate-nina-guide-bounce-gentle {
                  animation: nina-guide-bounce-gentle 1.5s ease-in-out infinite;
                }
            `}</style>
        </form>
    );
}
