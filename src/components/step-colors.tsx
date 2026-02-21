"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { ChevronLeft, RotateCcw, Cat } from "lucide-react";
import {
  WATER_COLORS,
  COLOR_HEX_MAP,
  type TubeState,
  MAX_LEVELS,
} from "@/lib/colors";
import { Card } from "./ui/card";

interface StepColorsProps {
  tubes: TubeState[];
  emptyTubes: number;
  onTubesChange: (tubes: TubeState[]) => void;
  onBack: () => void;
  onSolve: () => void;
}

export function StepColors({
  tubes,
  emptyTubes,
  onTubesChange,
  onBack,
  onSolve,
}: StepColorsProps) {
  const [selectedColor, setSelectedColor] = useState<string>(
    WATER_COLORS[0].value,
  );

  const handleTubeSlotClick = (tubeIndex: number, slotIndex: number) => {
    const copy = tubes.map((t) => [...t]);
    if (copy[tubeIndex][slotIndex] === selectedColor) {
      copy[tubeIndex][slotIndex] = null;
    } else {
      copy[tubeIndex][slotIndex] = selectedColor;
    }
    onTubesChange(copy);
  };

  const handleReset = () => {
    onTubesChange(tubes.map(() => [null, null, null]));
  };

  const hasAnyColor = tubes.some((t) => t.some((s) => s !== null));

  return (
    <div className="flex flex-col items-center gap-8 w-full max-w-2xl mx-auto animate-in fade-in slide-in-from-right-4 duration-300">
      <Card className="bg-secondary-background p-5 w-full">
        <Label className="text-xs font-medium uppercase tracking-wider text-muted-foreground block">
          Color seleccionado
        </Label>
        <div className="flex flex-wrap gap-2.5">
          {WATER_COLORS.map((color) => (
            <button
              key={color.value}
              onClick={() => setSelectedColor(color.value)}
              className={`h-10 w-10 cursor-pointer rounded-base border-2 border-border shadow-shadow transition-all duration-150 ${
                selectedColor === color.value
                  ? "-translate-x-boxShadowX -translate-y-boxShadowY"
                  : "hover:translate-x-boxShadowX hover:translate-y-boxShadowY hover:shadow-none"
              }`}
              style={{ backgroundColor: COLOR_HEX_MAP[color.value] }}
              title={color.name}
              aria-label={`Seleccionar color ${color.name}`}
            />
          ))}
        </div>
      </Card>

      <Card className="bg-secondary-background p-5 w-full">
        <div className="flex items-center justify-between mb-4">
          <Label className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
            Tubos para llenar ({tubes.length})
          </Label>
          <Button
            size="sm"
            onClick={handleReset}
            className="text-muted-foreground"
          >
            <RotateCcw className="h-3.5 w-3.5 mr-1.5" />
            Limpiar
          </Button>
        </div>

        <div className="flex flex-wrap justify-center gap-5">
          {tubes.map((tube, ti) => (
            <div key={ti} className="flex flex-col items-center gap-1.5">
              <span className="text-[11px] font-medium text-muted-foreground">
                {ti + 1}
              </span>
              <div className="relative flex w-14 flex-col-reverse gap-0.5 rounded-b-[10px] border-2 border-t-0 border-border bg-secondary-background px-1 pb-1 pt-4 shadow-shadow">
                {Array.from({ length: MAX_LEVELS }).map((_, si) => {
                  const color = tube[si];
                  return (
                    <button
                      key={si}
                      onClick={() => handleTubeSlotClick(ti, si)}
                      className={`h-10 w-full cursor-pointer rounded-[3px] border-2 border-border transition-all duration-150 ${
                        color
                          ? "hover:opacity-85"
                          : "border-dashed bg-secondary-background/70 hover:bg-main/20"
                      }`}
                      style={
                        color
                          ? {
                              backgroundColor: COLOR_HEX_MAP[color],
                            }
                          : undefined
                      }
                      aria-label={`Tubo ${ti + 1}, nivel ${si + 1}${color ? `, color ${color}` : ", vacio"}`}
                    />
                  );
                })}
              </div>
            </div>
          ))}
        </div>

        {emptyTubes > 0 && (
          <div className="mt-4 pt-4 border-t border-border">
            <p className="text-xs text-muted-foreground text-center">
              + {emptyTubes} tubo{emptyTubes > 1 ? "s" : ""} vacio
              {emptyTubes > 1 ? "s" : ""} (se agregan automaticamente)
            </p>
          </div>
        )}
      </Card>

      <div className="flex justify-between gap-3 w-full ">
        <Button size="lg" onClick={onBack} className="h-12">
          <ChevronLeft className="h-5 w-5 mr-2" />
          Atras
        </Button>
        <Button
          size="lg"
          onClick={onSolve}
          disabled={!hasAnyColor}
          className="text-base font-semibold h-12"
        >
          <Cat className="h-5 w-5 mr-2" />
          Resolver
        </Button>
      </div>
    </div>
  );
}
