'use client';

import React, { ReactNode } from 'react';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { BookOpen } from 'lucide-react';

export interface ConceptSection {
    title: string;
    color: string; // 'emerald' | 'blue' | 'amber' | 'indigo' | 'rose'
    content: ReactNode;
}

interface ConceptDialogProps {
    title?: string;
    subtitle?: string;
    sections: ConceptSection[];
}

export function ConceptDialog({
    title = "Concept Map",
    subtitle = "Interactive Reference Guide",
    sections
}: ConceptDialogProps) {

    const getColorClass = (color: string) => {
        switch (color) {
            case 'emerald': return "text-emerald-400 bg-emerald-500";
            case 'blue': return "text-blue-400 bg-blue-500";
            case 'amber': return "text-amber-400 bg-amber-500";
            case 'indigo': return "text-indigo-400 bg-indigo-500";
            case 'rose': return "text-rose-400 bg-rose-500";
            default: return "text-zinc-400 bg-zinc-500";
        }
    };

    return (
        <Dialog>
            <DialogTrigger asChild>
                <Button
                    variant="ghost"
                    size="sm"
                    className="text-zinc-500 hover:text-emerald-400 hover:bg-zinc-900/50 transition-colors duration-200"
                >
                    <BookOpen className="h-4 w-4 mr-2" />
                    <span className="text-xs tracking-wide">Concept Map</span>
                </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-2xl bg-zinc-950 border-zinc-800 text-zinc-200 max-h-[85vh] flex flex-col p-0 overflow-hidden">
                <DialogHeader className="px-6 py-4 border-b border-zinc-900 bg-zinc-950 shrink-0">
                    <DialogTitle className="text-xl font-bold tracking-tight text-white flex items-center gap-2">
                        {title}
                    </DialogTitle>
                    <DialogDescription className="text-zinc-500 text-xs">
                        {subtitle}
                    </DialogDescription>
                </DialogHeader>

                <div className="flex-1 overflow-y-auto p-6 space-y-8 [&::-webkit-scrollbar]:hidden scrollbar-hide">
                    {sections.map((section, idx) => {
                        const colorClasses = getColorClass(section.color);
                        const textColor = colorClasses.split(' ')[0];
                        const dotColor = colorClasses.split(' ')[1];

                        return (
                            <section key={idx} className="space-y-3">
                                <div className="flex items-center gap-2 pb-2 border-b border-zinc-500/10">
                                    <div className={`w-1.5 h-1.5 rounded-full ${dotColor}`} />
                                    <h3 className={`text-sm font-bold ${textColor} font-mono uppercase tracking-wider`}>
                                        {section.title}
                                    </h3>
                                </div>
                                {section.content}
                            </section>
                        );
                    })}
                </div>
            </DialogContent>
        </Dialog>
    );
}
