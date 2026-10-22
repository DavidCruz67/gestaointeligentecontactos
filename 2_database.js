// ==========================================
// OPERAÇÕES NA BASE DE DADOS SUPABASE
// ==========================================

// Obter todos os contactos
async function dbGetContacts() {
    const { data, error } = await supabaseClient
        .from('contacts')
        .select('*')
        .order('created_at', { ascending: false });
        
    if (error) {
        console.error("Erro BD:", error);
        return [];
    }
    return data;
}

// Inserir novo contacto
async function dbInsertContact(contactData) {
    const { error } = await supabaseClient
        .from('contacts')
        .insert([contactData]);
    if (error) throw error;
}

// Atualizar contacto existente
async function dbUpdateContact(id, contactData) {
    const { error } = await supabaseClient
        .from('contacts')
        .update(contactData)
        .eq('id', id);
    if (error) throw error;
}

// Apagar contacto
async function dbDeleteContact(id) {
    const { error } = await supabaseClient
        .from('contacts')
        .delete()
        .eq('id', id);
    if (error) throw error;
}
