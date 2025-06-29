'use client';

export default function InvestmentImplications() {
  return (
    <section className="w-full py-20 px-6 md:px-12 bg-[#13161e] text-white">
      <div className="max-w-7xl mx-auto">
        <h2 className="text-3xl font-bold mb-6 font-logo">Investment Implications</h2>

        <p className="text-lg text-gray-300 leading-relaxed font-tagline mb-6 max-w-4xl">
          New gas power investments face major risk. In 1.5°C-aligned pathways, plants built today may need to be retired within <strong>10–15 years</strong>—well before their expected economic lifetime—due to rapid decarbonization requirements.
        </p>

        <ul className="text-gray-300 list-disc pl-5 space-y-2 max-w-4xl">
          <li><strong>Stranded asset risk:</strong> New gas plants may not recover their upfront costs before phase-out dates.</li>
          <li><strong>Mismatch with climate goals:</strong> Continued investment in long-lived gas infrastructure conflicts with 2030 targets.</li>
          <li><strong>Short project horizon:</strong> Gas projects must now be evaluated on <em>shorter payback periods</em>.</li>
        </ul>
      </div>
    </section>
  );
}
