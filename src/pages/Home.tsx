import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import PublicOrder from "./PublicOrder";
import PublicOrderRamadan from "./PublicOrderRamadan";
import Index from "./Index";

export default function Home() {
  const navigate = useNavigate();
  const hostname = window.location.hostname;
  
  // Detect subdomain - use startsWith for exact match
  const isRamadanDomain = hostname.startsWith('ramadan.');
  const isAppDomain = hostname.startsWith('app.');
  const isCommandeDomain = hostname.startsWith('commande.');
  
  // ramadan.maisondugout.ma → Ramadan form
  if (isRamadanDomain) {
    return <PublicOrderRamadan />;
  }
  
  // app.maisondugout.ma → Admin interface
  if (isAppDomain) {
    return <Index />;
  }
  
  // commande.maisondugout.ma or default → Classic form
  return <PublicOrder />;
}