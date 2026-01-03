import Link from "next/link";
import { ArrowRight, Activity, Zap, Grid, Waves } from "lucide-react";

const curriculum = [
  {
    slug: "/labs/linear-algebra",
    title: "Signal Integration",
    subtitle: "Linear Algebra & The Geometry of Inputs",
    icon: Grid,
  },
  {
    slug: "/labs/diff-eqn",
    title: "Membrane Dynamics",
    subtitle: "Differential Equations & Stability Analysis",
    icon: Zap,
  },
  {
    slug: "/labs/probability",
    title: "Neural Stochasticity",
    subtitle: "Probability, Noise & Information Coding",
    icon: Waves,
  },
  {
    slug: "/labs/lif",
    title: "LIF Synthesis",
    subtitle: "Simulating the First Artificial Neuron",
    icon: Activity,
  },
];

export default function Home() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-zinc-950 p-24 text-zinc-100 font-mono">
      <div className="z-10 w-full max-w-5xl items-center justify-between font-mono text-sm lg:flex">
        <p className="fixed left-0 top-0 flex w-full justify-center border-b border-zinc-800 bg-zinc-950 pb-6 pt-8 backdrop-blur-2xl dark:border-zinc-800 dark:bg-zinc-800/30 dark:from-inherit lg:static lg:w-auto lg:rounded-xl lg:border lg:bg-zinc-900 lg:p-4 lg:dark:bg-zinc-900/30">
          In Silico Computational Neuroscience
        </p>
      </div>

      <div className="relative flex place-items-center before:absolute before:h-[300px] before:w-[480px] before:-translate-x-1/2 before:rounded-full before:bg-gradient-to-br before:from-transparent before:to-emerald-700 before:opacity-10 before:blur-2xl before:content-[''] after:absolute after:-z-20 after:h-[180px] after:w-[240px] after:translate-x-1/3 after:bg-gradient-to-t after:from-emerald-900 after:via-emerald-900 after:blur-2xl after:content-[''] before:dark:bg-gradient-to-br before:dark:from-transparent before:dark:to-emerald-700 before:dark:opacity-10 after:dark:from-emerald-900 after:dark:via-[#0141ff] after:dark:opacity-40 z-[-1]">
        <h1 className="text-6xl font-black tracking-tighter text-emerald-400 mb-8 z-10">
          ISCN :: CURRICULUM
        </h1>
      </div>

      {/* Directory-style curriculum list */}
      <div className="mb-32 w-full max-w-3xl text-left">
        <ul className="space-y-4">
          {curriculum.map((item) => {
            const Icon = item.icon;

            return (
              <li key={item.slug}>
                <Link
                  href={item.slug}
                  className="flex items-center justify-between border-b border-zinc-800 py-3 hover:border-emerald-500/40 transition-colors group"
                >
                  <div className="flex items-start gap-3">
                    <Icon className="h-4 w-4 mt-1 text-emerald-400" />
                    <div>
                      <p className="text-sm font-semibold text-zinc-100">
                        {item.title}
                      </p>
                      <p className="text-xs text-zinc-500">
                        {item.subtitle}
                      </p>
                    </div>
                  </div>

                  <ArrowRight className="h-3 w-3 text-emerald-400 opacity-0 group-hover:opacity-100 transition-opacity" />
                </Link>
              </li>
            );
          })}
        </ul>
      </div>
    </div>
  );
}
