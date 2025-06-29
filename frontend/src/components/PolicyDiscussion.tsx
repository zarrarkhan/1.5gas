'use client';

export default function PolicyDiscussion() {
  return (
    <section className="w-full py-20 px-6 md:px-12 bg-[#0b0c10] text-white">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-8">
          <h2 className="text-3xl font-bold font-logo">Policy & CCS Discussion</h2>
        </div>

        <ul className="max-w-4xl mx-auto space-y-5 text-base text-gray-100 font-tagline leading-relaxed list-disc pl-6">
          <li className="text-gray-100">
            <strong>1.5°C needs clear rules:</strong> End fossil fuel subsidies, ban new gas, and set firm phase-out deadlines.
          </li>
          <li className="text-gray-100">
            <strong>CCS won’t fix gas:</strong> It contributes <strong>&lt;3%</strong> of power in credible pathways—too small, too costly, too slow.
          </li>
          <li className="text-gray-100">
            <strong>Delays cost more later:</strong> Relying on CCS risks prolonging fossil use and deepens future carbon debt.
          </li>
          <li className="text-gray-100">
            <strong>Redirect public finance:</strong> Shift funds from gas to renewables, storage, and grids—especially in the Global South.
          </li>
          <li className="text-gray-100">
            <strong>Phase-out plans must be bold:</strong> Fossil-free power by 2035 for rich countries; 2040–2045 for others with global support.
          </li>
        </ul>
      </div>
    </section>
  );
}
