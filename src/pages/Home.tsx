import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import PublicOrder from "./PublicOrder";
import PublicOrderRamadan from "./PublicOrderRamadan";
import Index from "./Index";

export default function Home() {
  const navigate = useNavigate();
  const hostname = window.location.hostname;
  
  // Detect subdomain and show appropriate page
  const isRamadanDomain = hostname.includes('ramadan');
  const isAppDomain = hostname.includes('app.');
  
  // app.maisondugout.ma → Admin interface
  if (isAppDomain) {
    return <Index />;
  }
  
  // ramadan.maisondugout.ma → Ramadan form
  if (isRamadanDomain) {
    return <PublicOrderRamadan />;
  }
  
  // commande.maisondugout.ma → Classic form
  return <PublicOrder />;
}