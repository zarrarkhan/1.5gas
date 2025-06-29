'use client';

export default function PolicyDiscussion() {
  return (
    <section className="w-full py-20 px-6 md:px-12 bg-[#0b0c10] text-white">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-8">
          <h2 className="text-3xl font-bold font-logo">Policy & CCS Discussion</h2>
        </div>

        <ul className="max-w-4xl mx-auto space-y-6 text-lg text-gray-300 font-tagline leading-relaxed list-disc pl-6">
          <li>
            Clear policy signals are essential. Tools like <strong>carbon pricing</strong>, <strong>renewable mandates</strong>, and <strong>no-new-gas rules</strong> are needed to guide investment toward clean alternatives.
          </li>
          <li>
            <strong>CCS (carbon capture and storage)</strong> is often proposed to extend fossil fuel use, but it cannot justify delaying phase-out in 1.5°C-aligned scenarios.
          </li>
          <li>
            Overreliance on CCS brings major risks: <strong>high cost</strong>, <strong>limited scalability</strong>, and <strong>moral hazard</strong>—reducing pressure to shift away from fossil fuels.
          </li>
        </ul>
      </div>
    </section>
  );
}
