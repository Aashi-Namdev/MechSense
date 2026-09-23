import Hero from "../components/landing/Hero.jsx";
import WhyPredictiveMaintenance from "../components/landing/WhyPredictiveMaintenance.jsx";
import DatasetOverview from "../components/landing/DatasetOverview.jsx";
import AboutTheMachines from "../components/landing/AboutTheMachines.jsx";
import HowItWorks from "../components/landing/HowItWorks.jsx";
import ModelApproach from "../components/landing/ModelApproach.jsx";
import KeyResults from "../components/landing/KeyResults.jsx";
import ClosingCta from "../components/landing/ClosingCta.jsx";
import LandingFooter from "../components/landing/Footer.jsx";

function Landing() {
  return (
    <div className="min-h-screen bg-bg-base">
      <Hero />
      <main>
        <WhyPredictiveMaintenance />
        <DatasetOverview />
        <AboutTheMachines />
        <HowItWorks />
        <ModelApproach />
        <KeyResults />
        <ClosingCta />
      </main>
      <LandingFooter />
    </div>
  );
}

export default Landing;
