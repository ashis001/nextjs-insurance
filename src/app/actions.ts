"use server";

import { Corporate, SetupStage } from "@/lib/types";

// Mock persistence - in a real app this would write to DB
export async function saveCorporateState(id: string, data: Partial<Corporate>) {
    console.log(`[SERVER] Saving state for ${id}:`, data);
    // Simulate network delay
    await new Promise((resolve) => setTimeout(resolve, 500));
    return { success: true };
}

export async function submitCorporateSetup(id: string, finalData: Corporate) {
    console.log(`[SERVER] Submitting final setup for ${id}:`, finalData);
    await new Promise((resolve) => setTimeout(resolve, 800));
    return { success: true };
}
