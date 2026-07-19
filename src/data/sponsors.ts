// Sponsor list — logos served via logo.dev
// Using the public demo token from logo.dev docs.
const LOGO_TOKEN = "pk_X-1ZO13GSgeOoUrIuJ6GMQ";

export function sponsorLogo(domain: string, size = 200) {
  return `https://img.logo.dev/${domain}?token=${LOGO_TOKEN}&size=${size}&format=png`;
}

export interface Sponsor {
  name: string;
  domain: string;
  tier?: string;
  tagline?: string;
}

export const SPONSORS: Sponsor[] = [
  {
    name: "Robi",
    domain: "robi.com.bd",
    tier: "Title Sponsor",
    tagline: "Presenting Partner · Telecom & Digital Services",
  },
  { name: "Airtel", domain: "bd.airtel.com" },
  { name: "Banglalink", domain: "banglalink.net" },
  { name: "Teletalk", domain: "teletalk.com.bd" },
  { name: "Ryze", domain: "ryze.live" },
  { name: "Skitto", domain: "skitto.com" },
  { name: "Grameenphone", domain: "grameenphone.com" },
  { name: "bKash", domain: "bkash.com" },
  { name: "Nagad", domain: "nagad.com.bd" },
  { name: "DBBL", domain: "dutchbanglabank.com" },
  { name: "Trust Bank PLC", domain: "tblbd.com" },
  { name: "UCB Bank PLC", domain: "ucb.com.bd" },
  { name: "Jamuna Bank PLC", domain: "jamunabankbd.com" },
  { name: "Walton", domain: "waltonbd.com" },
  { name: "Singer", domain: "singerbd.com" },
  { name: "HP", domain: "hp.com" },
  { name: "GigaByte", domain: "gigabyte.com" },
  { name: "Samsung", domain: "samsung.com" },
  { name: "Xiaomi", domain: "mi.com" },
  { name: "Honor", domain: "hihonor.com" },
  { name: "Oppo", domain: "oppo.com" },
  { name: "Vivo", domain: "vivo.com" },
  { name: "LG", domain: "lg.com" },
  { name: "HAVIT", domain: "havitsmart.com" },
  { name: "DELL", domain: "dell.com" },
  { name: "Prothom Alo", domain: "prothomalo.com" },
  { name: "Kaler Kontho", domain: "kalerkantho.com" },
  { name: "TP-Link", domain: "tp-link.com" },
  { name: "D-Link", domain: "dlink.com" },
];
