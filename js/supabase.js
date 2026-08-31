const supabaseConfig = {
  url: "https://etioxnigysbxitiaveyp.supabase.co",
  anonKey: "sb_publishable_xFF1aAt7CLjDXtFdJLabLw_7XghDzgY",
  pushEndpoint: "https://lumenve.vercel.app/api/send-push",
  // Clave pública VAPID (base64url, punto P-256 sin comprimir de 65 bytes)
  // Debe coincidir con el secreto VAPID_PUBLIC_KEY de la Edge Function.
  pushVapidKey: "BMCdeUXKlzY4kgk4ULo7DKhdn7GlY1W1mEPyu24juywyaqv94NHA-csWPdpdVZDHB8ag10g-ML7B8_TGX0KzCHk"
};

supabase = window.supabase.createClient(supabaseConfig.url, supabaseConfig.anonKey);