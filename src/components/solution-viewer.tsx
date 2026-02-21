"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Tube } from "@/components/tube";
import {
  ChevronLeft,
  ChevronRight,
  ChevronsLeft,
  ChevronsRight,
  Play,
  Pause,
  ArrowRight,
  AlertTriangle,
  Settings,
} from "lucide-react";
import type { SolverMove, SolverResult } from "@/lib/solver";
import { Alert, AlertDescription } from "./ui/alert";
import { Card } from "./ui/card";

interface SolutionViewerProps {
  result: SolverResult;
  onBackToSetup: () => void;
}

export function SolutionViewer({ result, onBackToSetup }: SolutionViewerProps) {
  const [currentStep, setCurrentStep] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const totalSteps = result.states.length;
  const tubes = result.states[currentStep];
  const currentMove: SolverMove | null =
    currentStep > 0 ? result.moves[currentStep - 1] : null;
  const nextMove: SolverMove | null =
    currentStep < result.moves.length ? result.moves[currentStep] : null;

  const goToStart = useCallback(() => {
    setCurrentStep(0);
    setIsPlaying(false);
  }, []);

  const goToEnd = useCallback(() => {
    setCurrentStep(totalSteps - 1);
    setIsPlaying(false);
  }, [totalSteps]);

  const goForward = useCallback(() => {
    setCurrentStep((s) => {
      if (s >= totalSteps - 1) {
        setIsPlaying(false);
        return s;
      }
      return s + 1;
    });
  }, [totalSteps]);

  const goBackward = useCallback(() => {
    setCurrentStep((s) => Math.max(0, s - 1));
  }, []);

  const togglePlay = useCallback(() => {
    setIsPlaying((p) => {
      if (!p && currentStep >= totalSteps - 1) {
        setCurrentStep(0);
      }
      return !p;
    });
  }, [currentStep, totalSteps]);

  useEffect(() => {
    if (isPlaying) {
      intervalRef.current = setInterval(() => {
        setCurrentStep((s) => {
          if (s >= totalSteps - 1) {
            setIsPlaying(false);
            return s;
          }
          return s + 1;
        });
      }, 800);
    } else {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
    }
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [isPlaying, totalSteps]);

  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === "ArrowRight") goForward();
      if (e.key === "ArrowLeft") goBackward();
      if (e.key === " ") {
        e.preventDefault();
        togglePlay();
      }
    };
    window.addEventListener("keydown", handleKey);
    return () => window.removeEventListener("keydown", handleKey);
  }, [goForward, goBackward, togglePlay]);

  if (!result.solved) {
    return (
      <div className="flex flex-col items-center gap-6 w-full max-w-2xl mx-auto animate-in fade-in slide-in-from-right-4 duration-300">
        <Card className="bg-secondary-background p-8 text-center w-full">
          <AlertTriangle className="h-12 w-12 text-destructive mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-foreground mb-2">
            Sin solucion
          </h2>
          <p className="text-muted-foreground text-sm mb-6 max-w-md mx-auto">
            No se encontro una solucion para esta configuracion. Intenta con una
            disposicion diferente de colores o agrega mas tubos vacios.
          </p>
          <Button onClick={onBackToSetup} className="font-semibold">
            <Settings className="h-4 w-4 mr-2" />
            Volver a configurar
          </Button>
        </Card>

        <Card className="bg-secondary-background p-6 w-full">
          <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground mb-4 text-center">
            Configuracion actual
          </p>
          <div className="flex flex-wrap justify-center gap-4">
            {result.states[0].map((tube, i) => (
              <Tube key={i} tube={tube} index={i} />
            ))}
          </div>
        </Card>
      </div>
    );
  }

  const isFinalStep = currentStep === totalSteps - 1;
  const isFirstStep = currentStep === 0;

  return (
    <div className="flex flex-col items-center gap-6 w-full max-w-4xl mx-auto animate-in fade-in slide-in-from-right-4 duration-300">
      <div className="flex items-center justify-between w-full flex-wrap gap-3">
        <Button
          size="sm"
          onClick={onBackToSetup}
          className="text-muted-foreground"
        >
          <ChevronLeft className="h-4 w-4 mr-1" />
          Configurar
        </Button>
        <div className="flex items-center gap-2">
          <span className="text-sm text-muted-foreground">Solucion en</span>
          <span className="text-lg font-bold text-foreground tabular-nums">
            {result.moves.length}
          </span>
          <span className="text-sm text-muted-foreground">
            paso{result.moves.length !== 1 ? "s" : ""}
          </span>
        </div>
      </div>

      <Alert className="bg-secondary-background flex items-center justify-center w-full">
        {isFirstStep ? (
          <AlertDescription>
            Estado inicial &mdash; avanza para ver la solucion
          </AlertDescription>
        ) : isFinalStep ? (
          <AlertDescription>Resuelto!</AlertDescription>
        ) : currentMove ? (
          <AlertDescription className="flex items-center justify-center gap-3">
            <span className="uppercase">Paso {currentStep}:</span>
            <span className="inline-flex items-center gap-2 text-sm font-semibold">
              <span className="text-primary rounded-md px-2.5 tabular-nums">
                Tubo {currentMove.from + 1}
              </span>
              <ArrowRight className="h-4 w-4 text-muted-foreground" />
              <span className="text-accent-foreground rounded-md px-2.5 tabular-nums">
                Tubo {currentMove.to + 1}
              </span>
            </span>
          </AlertDescription>
        ) : null}
      </Alert>

      <Card className="bg-secondary-background p-6 md:p-8 w-full min-h-60 flex items-center justify-center">
        <div className="flex flex-wrap justify-center gap-4 md:gap-5">
          {tubes.map((tube, i) => {
            const isFrom = nextMove?.from === i && !isFinalStep;
            const isTo = nextMove?.to === i && !isFinalStep;
            return (
              <Tube
                key={i}
                tube={tube}
                index={i}
                isSource={isFrom}
                isTarget={isTo}
              />
            );
          })}
        </div>
      </Card>

      <div className="w-full flex flex-col gap-2">
        <div className="w-full bg-secondary rounded-full h-2 overflow-hidden">
          <div
            className="h-full bg-primary rounded-full transition-all duration-300 ease-out"
            style={{
              width: `${totalSteps <= 1 ? 100 : (currentStep / (totalSteps - 1)) * 100}%`,
            }}
          />
        </div>
      </div>

      <div className="flex items-center gap-2">
        <Button
          size="icon"
          onClick={goToStart}
          disabled={isFirstStep}
          className="h-10 w-10"
          aria-label="Ir al inicio"
        >
          <ChevronsLeft className="h-4 w-4" />
        </Button>
        <Button
          size="icon"
          onClick={goBackward}
          disabled={isFirstStep}
          className="h-10 w-10"
          aria-label="Paso anterior"
        >
          <ChevronLeft className="h-4 w-4" />
        </Button>
        <Button
          size="icon"
          onClick={togglePlay}
          disabled={totalSteps <= 1}
          className="h-12 w-12"
          aria-label={isPlaying ? "Pausar" : "Reproducir"}
        >
          {isPlaying ? (
            <Pause className="h-5 w-5" />
          ) : (
            <Play className="h-5 w-5" />
          )}
        </Button>
        <Button
          size="icon"
          onClick={goForward}
          disabled={isFinalStep}
          className="h-10 w-10"
          aria-label="Paso siguiente"
        >
          <ChevronRight className="h-4 w-4" />
        </Button>
        <Button
          size="icon"
          onClick={goToEnd}
          disabled={isFinalStep}
          className="h-10 w-10"
          aria-label="Ir al final"
        >
          <ChevronsRight className="h-4 w-4" />
        </Button>
      </div>
    </div>
  );
}
