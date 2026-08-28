const supabaseConfig = {
  url: "https://etioxnigysbxitiaveyp.supabase.co",
  anonKey: "sb_publishable_xFF1aAt7CLjDXtFdJLabLw_7XghDzgY"
};

supabase = window.supabase.createClient(supabaseConfig.url, supabaseConfig.anonKey);
