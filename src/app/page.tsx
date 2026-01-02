import Link from "next/link";
import { ArrowRight, Activity, Zap, Grid, Waves, Terminal, Cpu } from "lucide-react";

export default function Home() {
  const labs = [
    {
      href: "/labs/linear-algebra",
      title: "Signal Integration",
      subtitle: "Linear Algebra",
      desc: "Vector summation & geometric inputs.",
      icon: Grid,
      status: "Operational"
    },
    {
      href: "/labs/diff-eqn",
      title: "Membrane Dynamics",
      subtitle: "Phase Plane Analysis",
      desc: "Differential equations & stability.",
      icon: Zap,
      status: "Active"
    },
    {
      href: "/labs/probability",
      title: "Neural Stochasticity",
      subtitle: "Probability Theory",
      desc: "Noise, entropy & coding.",
      icon: Waves,
      status: "Online"
    },
    {
      href: "/labs/lif",
      title: "LIF Synthesis",
      subtitle: "Computational Model",
      desc: "Leaky Integrate-and-Fire simulation.",
      icon: Activity,
      status: "Live"
    }
  ];

  return (
    <main className="flex min-h-screen flex-col bg-zinc-950 text-zinc-400 font-mono selection:bg-emerald-500/30 selection:text-emerald-200">
      
      {/* Top Bar / HUD */}
      <nav className="fixed top-0 left-0 w-full border-b border-zinc-900 bg-zinc-950/80 backdrop-blur-md z-50 px-6 h-14 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse" />
          <span className="text-xs font-bold tracking-widest text-zinc-100">ISCN_NET</span>
        </div>
        <div className="flex items-center gap-6 text-[10px] uppercase tracking-widest">
          <span className="hidden md:inline-block opacity-50">System: Nominal</span>
          <span className="text-emerald-500">v1.0.4</span>
        </div>
      </nav>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col items-center justify-center p-6 pt-24 relative overflow-hidden">
        
        {/* Background Grid Effect */}
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#18181b_1px,transparent_1px),linear-gradient(to_bottom,#18181b_1px,transparent_1px)] bg-[size:4rem_4rem] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_0%,#000_70%,transparent_100%)] -z-10" />

        {/* Hero Section */}
        <div className="w-full max-w-6xl mb-20 space-y-6 text-center md:text-left">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-zinc-800 bg-zinc-900/50 text-xs text-zinc-400 mb-4">
            <Terminal className="w-3 h-3" />
            <span>In Silico Computational Neuroscience</span>
          </div>
          
          <h1 className="text-5xl md:text-7xl font-black tracking-tighter text-white">
            DIGITAL<span className="text-zinc-800">.</span>LAB
          </h1>
          <p className="max-w-xl text-sm md:text-base leading-relaxed text-zinc-500">
            An interactive curriculum for modeling biological neural networks. 
            Select a module to initialize the simulation environment.
          </p>
        </div>

        {/* Lab Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 w-full max-w-6xl">
          {labs.map((lab, i) => (
            <Link
              key={i}
              href={lab.href}
              className="group relative flex flex-col justify-between h-64 p-6 bg-zinc-900/20 border border-zinc-800 hover:border-emerald-500/50 transition-all duration-300 overflow-hidden hover:bg-zinc-900/40"
            >
              {/* Hover Glow Effect */}
              <div className="absolute -right-12 -top-12 h-32 w-32 bg-emerald-500/10 blur-3xl rounded-full group-hover:bg-emerald-500/20 transition-all duration-500" />

              <div>
                <div className="flex justify-between items-start mb-4">
                  <lab.icon className="w-6 h-6 text-zinc-600 group-hover:text-emerald-400 transition-colors" />
                  <span className="text-[10px] uppercase tracking-widest text-zinc-600 border border-zinc-800 px-2 py-0.5 rounded group-hover:border-emerald-500/30 group-hover:text-emerald-500 transition-colors">
                    0{i + 1}
                  </span>
                </div>
                
                <h3 className="text-lg font-bold text-zinc-100 group-hover:text-emerald-300 transition-colors">
                  {lab.title}
                </h3>
                <span className="text-xs text-zinc-500 font-medium tracking-wide uppercase mt-1 block">
                  {lab.subtitle}
                </span>
              </div>

              <div>
                <p className="text-xs text-zinc-500 leading-relaxed mb-6 border-l-2 border-zinc-800 pl-3 group-hover:border-emerald-500/50 transition-colors">
                  {lab.desc}
                </p>
                
                <div className="flex items-center justify-between border-t border-zinc-800/50 pt-4">
                    <span className="text-[10px] uppercase tracking-wider text-zinc-600 group-hover:text-zinc-400 flex items-center gap-2">
                        <div className="w-1.5 h-1.5 rounded-full bg-zinc-700 group-hover:bg-emerald-500 transition-colors" />
                        {lab.status}
                    </span>
                    <ArrowRight className="w-4 h-4 text-zinc-600 group-hover:text-emerald-400 -translate-x-2 opacity-0 group-hover:translate-x-0 group-hover:opacity-100 transition-all duration-300" />
                </div>
              </div>
            </Link>
          ))}
        </div>

        {/* Footer / System Info */}
        <div className="mt-20 flex items-center gap-8 opacity-40 grayscale hover:grayscale-0 transition-all duration-500">
            <div className="flex items-center gap-3">
                <Cpu className="w-10 h-10 text-zinc-600" />
                <div className="flex flex-col text-[10px] uppercase tracking-widest">
                    <span className="text-zinc-300 font-bold">Processing Unit</span>
                    <span>Ready for Compute</span>
                </div>
            </div>
        </div>
      </div>
    </main>
  );
}
