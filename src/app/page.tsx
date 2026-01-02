import Link from "next/link";
import { ArrowRight } from "lucide-react";

const labs = [
  {
    title: "Signal Integration",
    subtitle: "Linear Algebra & the Geometry of Inputs",
    href: "/labs/linear-algebra",
  },
  {
    title: "Membrane Dynamics",
    subtitle: "Differential Equations & Stability Analysis",
    href: "/labs/diff-eqn",
  },
  {
    title: "Neural Stochasticity",
    subtitle: "Probability, Noise & Information Coding",
    href: "/labs/probability",
  },
  {
    title: "LIF Synthesis",
    subtitle: "Simulating the First Artificial Neuron",
    href: "/labs/lif",
  },
];

export default function Home() {
  return (
    <div className="min-h-screen bg-zinc-950 text-zinc-100 font-mono px-24 py-16">
      
      <header className="mb-16">
        <p className="text-xs uppercase tracking-widest text-zinc-500">
          In Silico Computational Neuroscience
        </p>
        <h1 className="mt-4 text-5xl font-black tracking-tighter text-emerald-400">
          ISCN :: Curriculum
        </h1>
      </header>

      <ul className="space-y-6 max-w-3xl">
        {labs.map((lab, i) => (
          <li key={i}>
            <Link
              href={lab.href}
              className="group flex items-center justify-between border-b border-zinc-800 pb-4 hover:border-emerald-500/40 transition"
            >
              <div>
                <h2 className="text-lg font-bold text-white group-hover:text-emerald-400 transition">
                  {lab.title}
                </h2>
                <p className="text-sm text-zinc-400">
                  {lab.subtitle}
                </p>
              </div>

              <ArrowRight className="h-4 w-4 text-zinc-600 group-hover:text-emerald-400 transition" />
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}
