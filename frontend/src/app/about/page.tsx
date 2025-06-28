'use client';

import Navbar from "@/components/Navbar";
import { useViewportHeight } from "@/lib/useViewportHeight";

export default function AboutPage() {
    useViewportHeight(); // Applies the --vh CSS variable

    return (
        <main
            style={{ height: 'calc(var(--vh, 1vh) * 100)' }}
            className="relative w-full bg-gradient-to-b from-[#0b0c10] via-[#1a1f2b] to-[#0b0c10] text-white overflow-hidden"
        >
            <div className="relative z-10 min-h-screen flex flex-col">
                <Navbar />

                <section className="flex-1 px-6 pt-48 text-center flex flex-col justify-start items-center">
                    <h1 className="text-2xl font-bold">Coming soon...</h1>
                </section>
            </div>
        </main>
    );
}
