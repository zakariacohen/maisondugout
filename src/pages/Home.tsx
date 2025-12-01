import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import PublicOrder from "./PublicOrder";
import PublicOrderRamadan from "./PublicOrderRamadan";

export default function Home() {
  const navigate = useNavigate();
  
  // Detect if we're on ramadan subdomain
  const isRamadanDomain = window.location.hostname.includes('ramadan');
  
  // Show the appropriate form based on domain
  if (isRamadanDomain) {
    return <PublicOrderRamadan />;
  }
  
  return <PublicOrder />;
}