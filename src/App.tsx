import { useState, useCallback } from "react";
import { StepIndicator } from "@/components/step-indicator";
import { StepStructure } from "@/components/step-structure";
import { StepColors } from "@/components/step-colors";
import { SolutionViewer } from "@/components/solution-viewer";
import { solve, type SolverResult } from "@/lib/solver";
import { Loader2, Droplets } from "lucide-react";
import type { TubeState } from "@/lib/colors";

const STEPS = [
  { label: "Estructura", description: "Tubos y vacios" },
  { label: "Colores", description: "Rellenar colores" },
  { label: "Solucion", description: "Ver pasos" },
];

type AppStep = 0 | 1 | 2;
type SolvingState = "idle" | "solving";

function App() {
  const [currentStep, setCurrentStep] = useState<AppStep>(0);
  const [solvingState, setSolvingState] = useState<SolvingState>("idle");
  const [solverResult, setSolverResult] = useState<SolverResult | null>(null);

  const [totalTubes, setTotalTubes] = useState(4);
  const [emptyTubes, setEmptyTubes] = useState(1);
  const [tubes, setTubes] = useState<TubeState[]>(() =>
    Array.from({ length: 3 }, () => [null, null, null]),
  );

  const handleTotalChange = useCallback((delta: number) => {
    setTotalTubes((prev) => {
      const next = Math.max(2, Math.min(12, prev + delta));
      setEmptyTubes((prevEmpty) => {
        const newEmpty = Math.min(prevEmpty, next - 1);
        const fillable = next - newEmpty;
        setTubes((prevTubes) => {
          const result: TubeState[] = [];
          for (let i = 0; i < fillable; i++) {
            result.push(prevTubes[i] ? [...prevTubes[i]] : [null, null, null]);
          }
          return result;
        });
        return newEmpty;
      });
      return next;
    });
  }, []);

  const handleEmptyChange = useCallback(
    (delta: number) => {
      setEmptyTubes((prev) => {
        const next = Math.max(0, Math.min(totalTubes - 1, prev + delta));
        const fillable = totalTubes - next;
        setTubes((prevTubes) => {
          const result: TubeState[] = [];
          for (let i = 0; i < fillable; i++) {
            result.push(prevTubes[i] ? [...prevTubes[i]] : [null, null, null]);
          }
          return result;
        });
        return next;
      });
    },
    [totalTubes],
  );

  const handleSolve = useCallback(() => {
    setSolvingState("solving");
    setCurrentStep(2);

    setTimeout(() => {
      const emptyTubeArrays: TubeState[] = Array.from(
        { length: emptyTubes },
        () => [null, null, null],
      );
      const allTubes = [...tubes, ...emptyTubeArrays];
      const result = solve(allTubes);
      setSolverResult(result);
      setSolvingState("idle");
    }, 50);
  }, [tubes, emptyTubes]);

  const handleBackToSetup = useCallback(() => {
    setCurrentStep(1);
    setSolverResult(null);
    setSolvingState("idle");
  }, []);

  const handleBackToStructure = useCallback(() => {
    setCurrentStep(0);
  }, []);

  return (
    <main className="min-h-screen bg-secondary-background py-8 px-4">
      <div className="flex flex-col items-center gap-8 w-full">
        <StepIndicator steps={STEPS} currentStep={currentStep} />

        {currentStep === 0 && (
          <StepStructure
            totalTubes={totalTubes}
            emptyTubes={emptyTubes}
            onTotalChange={handleTotalChange}
            onEmptyChange={handleEmptyChange}
            tubes={tubes}
            onNext={() => setCurrentStep(1)}
          />
        )}

        {currentStep === 1 && (
          <StepColors
            tubes={tubes}
            emptyTubes={emptyTubes}
            onTubesChange={setTubes}
            onBack={handleBackToStructure}
            onSolve={handleSolve}
          />
        )}

        {currentStep === 2 && solvingState === "solving" && (
          <div className="flex flex-col items-center justify-center min-h-[40vh] gap-5 animate-in fade-in duration-300">
            <Droplets className="h-10 w-10 text-primary animate-pulse" />
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
            <p className="text-muted-foreground text-sm font-medium">
              Calculando solucion...
            </p>
          </div>
        )}

        {currentStep === 2 && solvingState === "idle" && solverResult && (
          <SolutionViewer
            result={solverResult}
            onBackToSetup={handleBackToSetup}
          />
        )}
      </div>
    </main>
  );
}

export default App;
