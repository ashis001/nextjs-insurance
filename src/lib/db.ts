import { supabase } from './supabase';
import { Corporate } from './types';

export async function upsertCorporate(corporate: Corporate) {
    const { data, error } = await supabase
        .from('corporates')
        .upsert({
            id: corporate.id,
            name: corporate.name,
            broker: corporate.broker,
            contact_email: corporate.contactEmail,
            data: corporate,
            updated_at: new Date().toISOString()
        });

    if (error) {
        console.error('Error upserting corporate:', error);
        throw error;
    }
    return data;
}

export async function fetchAllCorporates() {
    const { data, error } = await supabase
        .from('corporates')
        .select('*')
        .order('updated_at', { ascending: false });

    if (error) {
        console.error('Error fetching corporates:', error);
        return [];
    }

    return data.map(item => item.data as Corporate);
}

export async function fetchCorporateById(id: string) {
    const { data, error } = await supabase
        .from('corporates')
        .select('data')
        .eq('id', id)
        .single();

    if (error) {
        console.error('Error fetching corporate by id:', error);
        return null;
    }

    return data.data as Corporate;
}

export async function deleteCorporate(id: string) {
    const { error } = await supabase
        .from('corporates')
        .delete()
        .eq('id', id);

    if (error) {
        console.error('Error deleting corporate:', error);
        throw error;
    }
}
