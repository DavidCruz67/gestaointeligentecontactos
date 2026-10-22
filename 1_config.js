// ==========================================
// CONFIGURAÇÕES (LIGAÇÕES EXTERNAS)
// ==========================================

// 1. SUPABASE (No painel do Supabase, vá a Project Settings -> API)
const SUPABASE_URL = 'COLE_AQUI_O_PROJECT_URL';
const SUPABASE_ANON_KEY = 'COLE_AQUI_A_ANON_KEY';

// Inicia a ligação à BD (variável supabaseClient partilhada)
const supabaseClient = supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

// 2. GEMINI (Para leitura de cartões - aistudio.google.com)
const GEMINI_API_KEY = 'COLE_AQUI_A_CHAVE_GEMINI';
