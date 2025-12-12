import Link from "next/link";
import { ArrowRight, Activity } from "lucide-react";

export default function Home() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-zinc-950 p-24 text-zinc-100 font-mono">
      <div className="z-10 w-full max-w-5xl items-center justify-between font-mono text-sm lg:flex">
        <p className="fixed left-0 top-0 flex w-full justify-center border-b border-zinc-800 bg-zinc-950 pb-6 pt-8 backdrop-blur-2xl dark:border-zinc-800 dark:bg-zinc-800/30 dark:from-inherit lg:static lg:w-auto  lg:rounded-xl lg:border lg:bg-zinc-900 lg:p-4 lg:dark:bg-zinc-900/30">
          In Silico Computational Neuroscience
        </p>
      </div>

      <div className="relative flex place-items-center before:absolute before:h-[300px] before:w-[480px] before:-translate-x-1/2 before:rounded-full before:bg-gradient-to-br before:from-transparent before:to-emerald-700 before:opacity-10 before:blur-2xl before:content-[''] after:absolute after:-z-20 after:h-[180px] after:w-[240px] after:translate-x-1/3 after:bg-gradient-to-t after:from-emerald-900 after:via-emerald-900 after:blur-2xl after:content-[''] before:dark:bg-gradient-to-br before:dark:from-transparent before:dark:to-emerald-700 before:dark:opacity-10 after:dark:from-emerald-900 after:dark:via-[#0141ff] after:dark:opacity-40 z-[-1]">
        <h1 className="text-6xl font-black tracking-tighter text-emerald-400 mb-8 z-10">
          ISCN :: EXPLORER
        </h1>
      </div>

      <div className="mb-32 grid text-center lg:max-w-5xl lg:w-full lg:mb-0 lg:grid-cols-4 lg:text-left gap-4">
        <Link
          href="/labs/lif"
          className="group rounded-lg border border-transparent px-5 py-4 transition-colors hover:border-emerald-500/30 hover:bg-zinc-900/50 hover:dark:border-neutral-700 hover:dark:bg-neutral-800/30"
        >
          <h2 className={`mb-3 text-2xl font-semibold flex items-center gap-2`}>
            LIF Model
            <Activity className="h-4 w-4 text-emerald-400" />
          </h2>
          <p className={`m-0 max-w-[30ch] text-sm opacity-50`}>
            Leaky Integrate-and-Fire single neuron simulation with real-time oscilloscope.
          </p>
          <div className="mt-4 flex items-center text-emerald-400 opacity-0 transition-opacity group-hover:opacity-100 text-xs">
            Enter Lab <ArrowRight className="ml-2 h-3 w-3" />
          </div>
        </Link>
      </div>
    </div>
  );
}
