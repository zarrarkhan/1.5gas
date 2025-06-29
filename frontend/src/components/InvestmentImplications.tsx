'use client';

export default function InvestmentImplications() {
  return (
    <section className="w-full py-20 px-6 md:px-12 bg-[#13161e] text-white">
      <div className="max-w-7xl mx-auto">
        <h2 className="text-3xl font-bold mb-6 font-logo">Investment Implications</h2>

        <p className="text-lg text-gray-300 leading-relaxed font-tagline mb-6 max-w-4xl">
          New gas investments are increasingly risky. In 1.5°C-aligned scenarios, gas power must decline sharply—most plants face early retirement, well before mid-century.
        </p>

        <ul className="list-disc pl-5 space-y-3 max-w-4xl text-base text-gray-100">
          <li className="text-gray-100"><strong>Stranded assets:</strong> Many new gas plants may shut down within <strong>10–15 years</strong>.</li>
          <li className="text-gray-100"><strong>Outcompeted by renewables:</strong> Wind and solar are already cheaper in most markets.</li>
          <li className="text-gray-100"><strong>CCS won't save gas:</strong> Plays a minor role in 1.5°C pathways, with high costs and low capture rates.</li>
          <li className="text-gray-100"><strong>Money is shifting:</strong> Public finance is moving away from fossil gas and toward clean energy.</li>
          <li className="text-gray-100"><strong>Regulation is tightening:</strong> No space for new gas fields or conversions in climate-safe plans.</li>
        </ul>

        <p className="text-lg text-gray-300 leading-relaxed font-tagline mt-8 max-w-4xl">
          <strong>The takeaway:</strong> Renewables, storage, and electrification aren’t just cleaner—they’re smarter bets.
        </p>
      </div>
    </section>
  );
}
