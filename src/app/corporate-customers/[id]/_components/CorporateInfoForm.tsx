"use client";

import React, { useMemo } from "react";
import { useForm, useFieldArray, SubmitHandler } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Corporate } from "@/lib/types";
import { useCorporateEngine } from "./useCorporateEngine";
import { Loader2, UploadCloud } from "lucide-react";

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

    const { register, control, handleSubmit, watch, formState: { errors } } = useForm<FormValues>({
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
                        <select {...register("broker")} className="w-full rounded border border-gray-300 px-3 py-1.5 text-sm bg-gray-50">
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
                        <select {...register("selectProfile")} className="w-full rounded border border-gray-300 px-3 py-1.5 text-sm bg-gray-50">
                            <option value="">Select</option>
                            {profileOptions.map(opt => (
                                <option key={opt} value={opt}>{opt}</option>
                            ))}
                        </select>
                    </div>
                    <div>
                        <label className="block text-xs text-gray-600 mb-1">Payment Gateway</label>
                        <select {...register("paymentPlatform")} className="w-full rounded border border-gray-300 px-3 py-1.5 text-sm bg-gray-50">
                            <option value="AuthorizeNet">AuthorizeNet</option>
                            <option value="Stripe">Stripe</option>
                        </select>
                    </div>
                </div>

                {/* Row 2: Name of Corporation, Provincial offices */}
                <div className="grid grid-cols-2 gap-4">
                    <div>
                        <label className="block text-xs text-gray-600 mb-1">Name of Corporation*</label>
                        <input {...register("name")} className="w-full rounded border border-gray-300 px-3 py-1.5 text-sm bg-gray-50" placeholder="Name of Corporation" />
                        {errors.name && <p className="text-xs text-red-500 mt-0.5">{errors.name.message}</p>}
                    </div>
                    <div>
                        <label className="block text-xs text-gray-600 mb-1">Offices in Operation*</label>
                        <select {...register("provincialOffices")} className="w-full rounded border border-gray-300 px-3 py-1.5 text-sm bg-gray-50">
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
                        <input type="date" {...register("policyStartDate")} className="w-full rounded border border-gray-300 px-3 py-1.5 text-sm bg-gray-50" />
                    </div>
                    <div>
                        <label className="block text-xs text-gray-600 mb-1">Contact Email*</label>
                        <input type="email" {...register("contactEmail")} className="w-full rounded border border-gray-300 px-3 py-1.5 text-sm bg-gray-50" placeholder="Contact Email" />
                    </div>
                    {/* Note: Contact Email explanation text is in design, skipping precise text for now */}
                    <div>
                        <label className="block text-xs text-gray-600 mb-1">Street Address*</label>
                        <input {...register("address.street1")} className="w-full rounded border border-gray-300 px-3 py-1.5 text-sm bg-gray-50" placeholder="Street Address" />
                    </div>
                </div>

                {/* Row 4: Street Address 2, Unit/Apt, City */}
                <div className="grid grid-cols-3 gap-4">
                    <div>
                        <label className="block text-xs text-gray-600 mb-1">Street Address Line 2</label>
                        <input {...register("address.street2")} className="w-full rounded border border-gray-300 px-3 py-1.5 text-sm bg-gray-50" placeholder="Street Address Line 2" />
                    </div>
                    <div>
                        <label className="block text-xs text-gray-600 mb-1">Unit/Apt/Suite #</label>
                        <input {...register("address.unit")} className="w-full rounded border border-gray-300 px-3 py-1.5 text-sm bg-gray-50" placeholder="Unit/Apt/Suite #" />
                    </div>
                    <div>
                        <label className="block text-xs text-gray-600 mb-1">City*</label>
                        <input {...register("address.city")} className="w-full rounded border border-gray-300 px-3 py-1.5 text-sm bg-gray-50" placeholder="City" />
                    </div>
                </div>

                {/* Row 5: Country, Province, Postal Code */}
                <div className="grid grid-cols-3 gap-4">
                    <div>
                        <label className="block text-xs text-gray-600 mb-1">Country*</label>
                        <select {...register("address.country")} className="w-full rounded border border-gray-300 px-3 py-1.5 text-sm bg-gray-50">
                            <option value="Canada">Canada</option>
                            <option value="USA">USA</option>
                        </select>
                    </div>
                    <div>
                        <label className="block text-xs text-gray-600 mb-1">Province*</label>
                        <select {...register("address.province")} className="w-full rounded border border-gray-300 px-3 py-1.5 text-sm bg-gray-50">
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
                        <input {...register("address.postalCode")} className="w-full rounded border border-gray-300 px-3 py-1.5 text-sm bg-gray-50" placeholder="Postal Code" />
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
                                <input {...register(`contacts.${index}.firstName`)} className="w-full rounded border border-gray-300 px-3 py-1.5 text-sm bg-gray-50" placeholder="First Name" />
                            </div>
                            <div>
                                <label className="block text-xs text-red-500 mb-1">Last Name*</label>
                                <input {...register(`contacts.${index}.lastName`)} className="w-full rounded border border-gray-300 px-3 py-1.5 text-sm bg-gray-50" placeholder="Last Name" />
                            </div>
                            <div>
                                <label className="block text-xs text-red-500 mb-1">Phone Number*</label>
                                <input {...register(`contacts.${index}.phone`)} className="w-full rounded border border-gray-300 px-3 py-1.5 text-sm bg-gray-50" placeholder="Phone Number" />
                            </div>
                            <div>
                                <label className="block text-xs text-red-500 mb-1">Email*</label>
                                <input {...register(`contacts.${index}.email`)} className="w-full rounded border border-gray-300 px-3 py-1.5 text-sm bg-gray-50" placeholder="Email" />
                            </div>
                            <div>
                                <label className="block text-xs text-red-500 mb-1">Role*</label>
                                <select {...register(`contacts.${index}.role`)} className="w-full rounded border border-gray-300 px-3 py-1.5 text-sm bg-gray-50">
                                    <option value="">Select</option>
                                    <option value="Accountant">Accountant</option>
                                    <option value="Executive">Executive</option>
                                    <option value="Plan Administrator">Plan Administrator</option>
                                    <option value="System Administrator">System Administrator</option>
                                    <option value="Wellness Champion">Wellness Champion</option>
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
                        <div className="flex gap-6 items-center">
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
                        <div className="flex gap-4 items-center">
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
                    <div className="flex gap-6 items-center">
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
                            <div className="flex gap-4">
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
                                <div className="flex gap-6">
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
                                <input type="text" {...register("employeeCount")} className="w-full rounded border border-gray-300 px-3 py-1.5 text-sm bg-gray-50" placeholder="0" />
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
                    className="flex items-center gap-2 rounded-xl bg-[#0a1e3b] px-8 py-3 text-sm font-bold text-white hover:bg-blue-900 shadow-lg shadow-blue-900/20 hover:shadow-xl hover:-translate-y-0.5 transition-all duration-300 disabled:opacity-50"
                >
                    {isSaving && <Loader2 className="h-4 w-4 animate-spin" />}
                    Save & Next →
                </button>
            </div>
        </form>
    );
}
