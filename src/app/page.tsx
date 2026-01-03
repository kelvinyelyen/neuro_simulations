import Link from "next/link";
import { ArrowRight } from "lucide-react";

const curriculum = [
  {
    slug: "/labs/linear-algebra",
    title: "Signal Integration",
    subtitle: "Linear Algebra & The Geometry of Inputs",
  },
  {
    slug: "/labs/diff-eqn",
    title: "Membrane Dynamics",
    subtitle: "Differential Equations & Stability Analysis",
  },
  {
    slug: "/labs/probability",
    title: "Neural Stochasticity",
    subtitle: "Probability, Noise & Information Coding",
  },
  {
    slug: "/labs/lif",
    title: "LIF Synthesis",
    subtitle: "Simulating the First Artificial Neuron",
  },
];

export default function Home() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-zinc-950 px-24 py-20 text-zinc-100 font-mono">
      <div className="z-10 w-full max-w-5xl items-center justify-between text-sm lg:flex">
        <p className="fixed left-0 top-0 flex w-full justify-center border-b border-zinc-800 bg-zinc-950 pb-6 pt-8 backdrop-blur-2xl lg:static lg:w-auto lg:rounded-xl lg:border lg:bg-zinc-900 lg:px-5 lg:py-3">
          In Silico Computational Neuroscience
        </p>
      </div>

      {/* Directory-style list */}
      <div className="w-full max-w-5xl text-left mt-16">
        <ul className="space-y-5">
          {curriculum.map((item) => (
            <li key={item.slug}>
              <Link href={item.slug} className="group block">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-semibold text-zinc-100 tracking-tight">
                    {item.title}
                  </span>

                  <ArrowRight className="h-3 w-3 text-emerald-400 opacity-0 group-hover:opacity-100 transition-opacity duration-200" />
                </div>

                <p className="mt-0.5 text-xs text-zinc-500">
                  {item.subtitle}
                </p>
              </Link>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
