// ====================================================================
// CONFIGURAÇÃO DO SUPABASE
// ====================================================================
// 1. Crie uma conta gratuita em https://supabase.com
// 2. Crie um novo projeto
// 3. Em "Project Settings > API", copie a "Project URL" e a chave
//    "anon public" e cole nos campos abaixo.
// ====================================================================

const SUPABASE_URL = "https://nxatpjgubdemtkvvzxkd.supabase.co";

const SUPABASE_ANON_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im54YXRwamd1YmRlbXRrdnZ6eGtkIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODE1NDUxNDAsImV4cCI6MjA5NzEyMTE0MH0.IrJMhGa7DVPom0wxqFuPySFsDbWLrNPMkQhm1jdYy9s";

const supabaseConfigurado = SUPABASE_URL.startsWith('http') && SUPABASE_ANON_KEY.length > 20;

let supabaseClient = null;

if (supabaseConfigurado) {
  if (typeof supabase === 'undefined') {
    console.error('Biblioteca do Supabase não carregou. Verifique sua conexão com a internet (CDN bloqueado?).');
  } else {
    supabaseClient = supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
  }
}
