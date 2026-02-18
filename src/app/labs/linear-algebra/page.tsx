"use client";

import React, { useState } from "react";
import Link from 'next/link';
import { Activity } from "lucide-react";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue
} from '@/components/ui/select';
import { cn } from "@/lib/utils";
import { ConceptDialog } from '@/components/guide/ConceptDialog';
import { getLinearContent } from './content';
import { VisualProcessingLab } from './VisualProcessingLab';
import { VectorMathLab } from './VectorMathLab';
import 'katex/dist/katex.min.css';

type Mode = 'math' | 'biol';

export default function LinearAlgebraPage() {
    const [mode, setMode] = useState<Mode>('biol');

    const content = getLinearContent(mode);

    return (
        <div className="h-screen bg-zinc-950 text-zinc-200 flex flex-col overflow-hidden select-none font-sans">

            {/* MOBILE GUARD */}
            <div className="flex md:hidden flex-col items-center justify-center h-full p-8 text-center space-y-6 bg-zinc-950 z-50 fixed inset-0">
                <div className="w-16 h-16 rounded-full bg-zinc-900 flex items-center justify-center border border-zinc-800">
                    <Activity className="w-8 h-8 text-emerald-500 animate-pulse" />
                </div>
                <div>
                    <h1 className="text-xl font-bold text-white mb-2">Scientific Workstation</h1>
                    <p className="text-zinc-500 text-sm leading-relaxed max-w-xs mx-auto">
                        Please access this simulation on a <span className="text-zinc-300">Desktop</span> or <span className="text-zinc-300">Tablet</span>.
                    </p>
                </div>
            </div>

            {/* DESKTOP CONTENT */}
            <div className="hidden md:flex flex-col h-full">
                {/* Header */}
                <header className="h-14 border-b border-zinc-900 flex items-center justify-between px-6 bg-zinc-950 shrink-0">
                    <div className="flex items-center gap-4">
                        <Activity className={cn("w-5 h-5", "text-emerald-500")} />
                        <h1 className="text-base font-semibold tracking-tight text-white">
                            <Link href="/" className="hover:opacity-80 transition-opacity">ISCN</Link>
                            <span className="mx-3 text-zinc-700">/</span>
                            <span className="text-zinc-400 font-medium">
                                {mode === 'biol' ? 'Visual Processing' : 'Vector Operations'}
                            </span>
                        </h1>
                    </div>

                    <div className="flex items-center gap-4">
                        <Select value={mode} onValueChange={(v: Mode) => setMode(v)}>
                            <SelectTrigger className="w-[180px] h-9 bg-zinc-900 border-zinc-800 text-sm text-zinc-200 focus:ring-0 focus:outline-none">
                                <SelectValue placeholder="Context" />
                            </SelectTrigger>
                            <SelectContent className="bg-zinc-900 border-zinc-800">
                                <SelectItem value="biol" className="text-white hover:bg-zinc-800 cursor-pointer">
                                    Neuroscience (Retina → LGN)
                                </SelectItem>
                                <SelectItem value="math" className="text-white hover:bg-zinc-800 cursor-pointer">
                                    Math (Vectors)
                                </SelectItem>
                            </SelectContent>
                        </Select>
                        <ConceptDialog {...content} />
                    </div>
                </header>

                {/* Main Content Areas */}
                {mode === 'biol' ? <VisualProcessingLab /> : <VectorMathLab />}

            </div>
        </div>
    );
}

