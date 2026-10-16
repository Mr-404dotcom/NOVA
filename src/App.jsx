import About from "./assets/components/About.jsx";
import CTA from "./assets/components/CTA.jsx";
import Features from "./assets/components/Features.jsx";
import Footer from "./assets/components/Footer.jsx";
import Hero from "./assets/components/Hero.jsx";
import Navbar from "./assets/components/Navbar.jsx";
import "./index.css";

export default function App() {
  return (
    <>
      <Navbar />
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
