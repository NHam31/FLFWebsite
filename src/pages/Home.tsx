import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import HeroSection from "@/sections/HeroSection";
import AboutSection from "@/sections/AboutSection";
import GoalsSection from "@/sections/GoalsSection";
import ActivitiesSection from "@/sections/ActivitiesSection";
import NumbersSection from "@/sections/NumbersSection";
import ContactSection from "@/sections/ContactSection";
import CountdownCTA from "@/components/CountdownCTA";
import CountdownFloatingPopup from "@/components/CountdownFloatingPopup";
import AmbassadorDiscussionZone from "@/components/AmbassadorDiscussionZone";
import { useViewerSession } from "@/hooks/useViewerSession";

export default function Home() {
  const { viewer, hasAmbassadorView } = useViewerSession();

  return (
    <div className="min-h-screen">
      <Navbar />
      <main>
        <HeroSection />
        {hasAmbassadorView && viewer ? <AmbassadorDiscussionZone author={viewer.name} /> : null}
        {!hasAmbassadorView ? <AboutSection /> : null}
        {!hasAmbassadorView ? <GoalsSection /> : null}
        <section className="py-10 bg-white">
          <div className="max-w-6xl mx-auto px-4 sm:px-6">
            <CountdownCTA />
          </div>
        </section>
        <ActivitiesSection />
        {!hasAmbassadorView ? <NumbersSection /> : null}
        {!hasAmbassadorView ? <ContactSection /> : null}
      </main>
      <CountdownFloatingPopup />
      <Footer />
    </div>
  );
}
