"use client";

import React from 'react';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { BRAZIL_STATES } from '@/lib/brazil-states';
import { cn } from '@/lib/utils';

interface BrazilMapProps {
  teamsByState: Record<string, any[]>;
}

const BrazilMap: React.FC<BrazilMapProps> = ({ teamsByState }) => {
  return (
    <TooltipProvider>
      <svg
        xmlns="http://www.w3.org/2000/svg"
        viewBox="0 0 800 800"
        aria-label="Mapa do Brasil"
        className="w-full h-auto"
      >
        {Object.entries(BRAZIL_STATES).map(([uf, { path, name }]) => {
          const hasTeam = teamsByState[uf] && teamsByState[uf].length > 0;
          return (
            <Tooltip key={uf}>
              <TooltipTrigger asChild>
                <path
                  id={uf}
                  d={path}
                  className={cn(
                    "stroke-foreground stroke-2 transition-all duration-300",
                    hasTeam ? 'fill-primary/80' : 'fill-muted',
                    'hover:fill-primary/50'
                  )}
                />
              </TooltipTrigger>
              <TooltipContent>
                <p className="font-bold">{name}</p>
                {hasTeam && <p>{teamsByState[uf].length} equipe(s) registrada(s)</p>}
              </TooltipContent>
            </Tooltip>
          );
        })}
      </svg>
    </TooltipProvider>
  );
};

export default BrazilMap;
