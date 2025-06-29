'use client';

import Link from 'next/link';

export default function CallToAction() {
  return (
    <section className="w-full py-20 px-6 md:px-12 bg-[#0b0c10] text-white">
      <div className="max-w-7xl mx-auto text-center">
        <h2 className="text-3xl font-bold font-logo mb-4">Explore the Data & Methods</h2>
        <p className="text-lg font-tagline text-gray-300 mb-8 max-w-2xl mx-auto">
          Dive deeper into the assumptions, sources, and models used for this analysis.
        </p>

        <div className="flex flex-col md:flex-row gap-4 justify-center">
          <Link
            href="/data"
            className="px-6 py-3 bg-[#bfa76f] text-black font-semibold rounded-full hover:bg-[#d4bd87] transition"
          >
            View Data
          </Link>
          <Link
            href="/methodology"
            className="px-6 py-3 border border-[#bfa76f] text-[#bfa76f] font-semibold rounded-full hover:bg-[#1a1f2b] hover:border-[#d4bd87] hover:text-[#d4bd87] transition"
          >
            See Methodology
          </Link>
        </div>
      </div>
    </section>
  );
}
