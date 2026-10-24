import { useState } from "react";
import About from "./assets/components/landing/About.jsx";
import CTA from "./assets/components/landing/CTA.jsx";
import Features from "./assets/components/landing/Features.jsx";
import Footer from "./assets/components/landing/Footer.jsx";
import Hero from "./assets/components/landing/Hero.jsx";
import Navbar from "./assets/components/landing/Navbar.jsx";
import Dashboard from "./assets/components/pages/DashBoard.jsx";
import "./index.css";

export default function App() {
  const [showDashboard, setShowDashboard] = useState(false);

  if (showDashboard) {
    return <Dashboard onBackToStore={() => setShowDashboard(false)} />;
  }

  return (
    <>
      <Navbar onOpenDashboard={() => setShowDashboard(true)} />
      <main>
        <Hero />
        <Features />
        <About />
        <CTA />
      </main>
      <Footer />
    </>
  );
}
