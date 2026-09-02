const supabaseConfig = {
  url: "https://etioxnigysbxitiaveyp.supabase.co",
  anonKey: "sb_publishable_xFF1aAt7CLjDXtFdJLabLw_7XghDzgY",
  pushEndpoint: "https://lumenve.vercel.app/api/send-push",
  // Clave pública VAPID (base64url, punto P-256 sin comprimir de 65 bytes)
  // Debe coincidir con el secreto VAPID_PUBLIC_KEY de la Edge Function.
  pushVapidKey: "BFJ2zyKQwCHf437fomuZiJMk-Pq9eiX-Q1W0yiDB1auM_kwvb3xbUWUWwqgGfZmc5PyxvKw3w4S_o_1P6ht0rfk"
};

supabase = window.supabase.createClient(supabaseConfig.url, supabaseConfig.anonKey);