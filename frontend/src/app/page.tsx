import Navbar from "@/components/Navbar";
import Hero from "@/components/Hero";
import GasReduction from "@/components/GasReduction";
import RegionalDifferences from "@/components/RegionalDifferences";
import InvestmentImplications from "@/components/InvestmentImplications";
import PolicyDiscussion from "@/components/PolicyDiscussion";
import CallToAction from "@/components/CallToAction";

export default function Home() {
  return (
    <main>
      <Navbar />
      <Hero />
      <GasReduction />
      <RegionalDifferences />
      <InvestmentImplications />
      <PolicyDiscussion />
      <CallToAction />
    </main>
  );
}
