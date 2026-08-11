import { useEffect, useState, useRef } from "react";
import { useCamera } from "@/hooks/useCamera";
import { Button } from "@/components/ui/button";
import { Camera, Loader2, AlertCircle, VideoOff, SwitchCamera, Scan, CheckCircle2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { motion, AnimatePresence } from "framer-motion";

interface CameraCaptureProps {
  onCapture: (imageBase64: string) => void;
  onCancel: () => void;
  isAnalyzing: boolean;
}

export default function CameraCapture({ onCapture, onCancel, isAnalyzing }: CameraCaptureProps) {
  const {
    videoRef,
    canvasRef,
    isStreaming,
    error,
    facingMode,
    startCamera,
    stopCamera,
    captureImage,
    switchCamera,
  } = useCamera("user");

  const [autoScan, setAutoScan] = useState(true);
  const [isPrepPhase, setIsPrepPhase] = useState(true);
  const [scanCountdown, setScanCountdown] = useState<number | null>(null);
  const captureTriggeredRef = useRef(false);

  useEffect(() => {
    startCamera();
    return () => stopCamera();
  }, [startCamera, stopCamera]);

  useEffect(() => {
    if (!isAnalyzing) captureTriggeredRef.current = false;
  }, [isAnalyzing]);

  useEffect(() => {
    if (isPrepPhase || !autoScan || !isStreaming || isAnalyzing || captureTriggeredRef.current) {
      if (!autoScan || !isStreaming || isAnalyzing) setScanCountdown(null);
      return;
    }

    setScanCountdown(10);
    const countdownInterval = setInterval(() => {
      setScanCountdown((prev) => {
        if (prev === null || prev <= 1) {
          clearInterval(countdownInterval);
          if (prev === 1 && !captureTriggeredRef.current) {
            captureTriggeredRef.current = true;
            const image = captureImage();
            if (image) {
              setAutoScan(false);
              onCapture(image);
            }
          }
          return null;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(countdownInterval);
  }, [isPrepPhase, autoScan, isStreaming, isAnalyzing, captureImage, onCapture]);

  const handleCapture = () => {
    const image = captureImage();
    if (image) onCapture(image);
  };

  const startScanning = () => {
    setIsPrepPhase(false);
  };

  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="fixed inset-0 z-50 bg-black flex flex-col"
    >
      <div className="flex-1 relative overflow-hidden bg-black">
        {error ? (
          <div className="text-center p-6 animate-in fade-in zoom-in duration-300 z-[60] bg-black inset-0 absolute flex flex-col items-center justify-center">
            <AlertCircle className="h-12 w-12 text-destructive mx-auto mb-4" />
            <p className="text-destructive font-medium px-10">{error}</p>
            <Button variant="outline" onClick={startCamera} className="mt-4 border-white/20 text-white">Try Again</Button>
          </div>
        ) : (
          <>
            <video
              ref={videoRef}
              autoPlay
              playsInline
              muted
              className={cn(
                "absolute inset-0 w-full h-full object-cover transition-opacity duration-1000 z-10",
                facingMode === "user" && "transform scale-x-[-1]",
                !isStreaming || isAnalyzing || isPrepPhase ? "opacity-30 grayscale blur-[2px]" : "opacity-100"
              )}
            />

            {/* TOP HUD */}
            <div className="absolute top-6 left-6 right-6 flex justify-between items-start z-[30] pointer-events-none">
              <Button
                variant="ghost"
                size="icon"
                className="bg-black/40 text-white/60 hover:text-destructive hover:bg-black/60 border border-white/10 backdrop-blur-md rounded-full pointer-events-auto transition-all"
                onClick={onCancel}
                disabled={isAnalyzing}
              >
                <VideoOff className="h-5 w-5" />
              </Button>
              
              <Button
                variant="secondary"
                size="icon"
                className="bg-black/40 text-white hover:bg-black/60 border border-white/10 backdrop-blur-md rounded-full pointer-events-auto transition-all"
                onClick={switchCamera}
                disabled={isAnalyzing}
              >
                <SwitchCamera className="h-5 w-5" />
              </Button>
            </div>

            {/* PREP OVERLAY */}
            <AnimatePresence>
              {isPrepPhase && (
                <motion.div 
                  initial={{ opacity: 0, scale: 1.1 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.9 }}
                  className="absolute inset-0 z-40 bg-zinc-950/60 backdrop-blur-xl flex items-center justify-center p-8"
                >
                  <div className="text-center space-y-10 max-w-sm">
                    <div className="space-y-3">
                      <motion.div
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.2 }}
                        className="text-cyan-400 font-bold tracking-[0.4em] uppercase text-xs drop-shadow-[0_0_8px_rgba(34,211,238,0.4)]"
                      >
                        Scanner Calibration
                      </motion.div>
                      <h2 className="text-4xl font-bold text-cyan-50 tracking-tighter uppercase drop-shadow-[0_0_12px_rgba(34,211,238,0.3)]">Get Ready</h2>
                    </div>

                    <ul className="space-y-5 text-left">
                      {[
                        "Place device at chest height",
                        "Step back 2 meters (7 feet)",
                        "Ensure full body is visible"
                      ].map((text, i) => (
                        <motion.li 
                          key={i}
                          initial={{ opacity: 0, x: -10 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ delay: 0.3 + i * 0.1 }}
                          className="flex items-center space-x-4 text-zinc-100 font-medium"
                        >
                          <CheckCircle2 className="h-6 w-6 text-cyan-500 flex-shrink-0" />
                          <span className="text-lg">{text}</span>
                        </motion.li>
                      ))}
                    </ul>

                    <Button 
                      onClick={startScanning} 
                      className="w-full bg-cyan-500 hover:bg-cyan-400 text-zinc-950 font-bold py-8 rounded-2xl shadow-[0_0_20px_rgba(6,182,212,0.4)] transition-all text-xl uppercase tracking-widest"
                    >
                      Start Posture Scan
                    </Button>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            {/* SCANNER GRID HUD */}
            <AnimatePresence>
              {isStreaming && !isAnalyzing && !isPrepPhase && (
                <motion.div 
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="absolute inset-0 pointer-events-none z-20"
                >
                  <motion.div 
                    animate={{ top: ["0%", "100%", "0%"] }}
                    transition={{ duration: 4, repeat: Infinity, ease: "linear" }}
                    className="absolute left-0 right-0 h-[1.5px] bg-cyan-400 shadow-[0_0_15px_#22d3ee] z-30 opacity-60"
                  />
                  
                  <div className="absolute inset-16 border-t-[1.5px] border-l-[1.5px] border-cyan-400/50 w-20 h-20 rounded-tl-3xl" />
                  <div className="absolute top-16 right-16 border-t-[1.5px] border-r-[1.5px] border-cyan-400/50 w-20 h-20 rounded-tr-3xl" />
                  <div className="absolute bottom-16 left-16 border-b-[1.5px] border-l-[1.5px] border-cyan-400/50 w-20 h-20 rounded-bl-3xl" />
                  <div className="absolute bottom-16 right-16 border-b-[1.5px] border-r-[1.5px] border-cyan-400/50 w-20 h-20 rounded-br-3xl" />

                  <div className="absolute h-full w-[0.5px] bg-cyan-400/10 left-1/2 -translate-x-1/2" />
                  <div className="absolute w-full h-[0.5px] bg-cyan-400/10 top-1/2 -translate-y-1/2" />
                </motion.div>
              )}
            </AnimatePresence>

            {/* ANALYSIS STATE */}
            {isAnalyzing && (
              <div className="absolute inset-0 z-[45] flex items-center justify-center bg-zinc-950/80 backdrop-blur-md">
                <div className="text-center">
                  <div className="relative mb-8">
                    <Loader2 className="h-24 w-24 animate-spin text-cyan-400 mx-auto" />
                    <Scan className="h-10 w-10 text-cyan-400 absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2" />
                  </div>
                  <motion.p 
                    animate={{ opacity: [0.5, 1, 0.5] }}
                    transition={{ repeat: Infinity, duration: 1.5 }}
                    className="text-3xl font-bold tracking-[0.3em] uppercase text-cyan-50 drop-shadow-[0_0_10px_rgba(34,211,238,0.5)]"
                  >
                    Processing Biometrics
                  </motion.p>
                </div>
              </div>
            )}

            {/* COUNTDOWN */}
            {autoScan && scanCountdown !== null && !isAnalyzing && !isPrepPhase && (
              <div className="absolute inset-0 flex items-center justify-center z-[35] pointer-events-none">
                <motion.div 
                  key={scanCountdown}
                  initial={{ scale: 0.5, opacity: 0 }}
                  animate={{ 
                    scale: [0.8, 1.2, 1], 
                    opacity: 1,
                  }}
                  className="text-[12rem] font-extralight text-cyan-400 opacity-90 drop-shadow-[0_0_20px_rgba(34,211,238,0.8)]"
                >
                  {scanCountdown}
                </motion.div>
              </div>
            )}
          </>
        )}
        
        <canvas ref={canvasRef} className="hidden" />
      </div>

      {/* CONTROLS */}
      <div className="h-32 bg-black/40 backdrop-blur-xl border-t border-white/5 px-6 relative z-[100] transition-all">
        <div className="max-w-md mx-auto h-full flex items-center justify-between gap-4">
          <div className="flex items-center space-x-3 bg-zinc-900/60 px-5 py-2.5 rounded-full border border-white/10 shadow-lg">
            <Switch 
              id="auto-scan" 
              checked={autoScan} 
              onCheckedChange={setAutoScan} 
              disabled={isAnalyzing} 
              className="data-[state=checked]:bg-cyan-500 shadow-[0_0_10px_rgba(6,182,212,0.3)]" 
            />
            <Label htmlFor="auto-scan" className="text-[10px] font-bold uppercase tracking-[0.2em] cursor-pointer text-zinc-300">
              AI-Auto
            </Label>
          </div>

          <div className="flex-1 flex justify-center">
            <AnimatePresence>
              {!autoScan && !isPrepPhase && (
                <motion.div 
                  initial={{ scale: 0, opacity: 0 }} 
                  animate={{ scale: 1, opacity: 1 }}
                  exit={{ scale: 0, opacity: 0 }}
                >
                  <Button 
                    onClick={handleCapture} 
                    disabled={!isStreaming || isAnalyzing} 
                    className="bg-cyan-500 hover:bg-cyan-400 text-zinc-950 h-20 w-20 rounded-full shadow-[0_0_30px_rgba(6,182,212,0.5)] hover:scale-110 active:scale-95 transition-all p-0 border-4 border-black group"
                  >
                     <Camera className="h-10 w-10 group-hover:scale-110 transition-transform" />
                  </Button>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          <div className="w-[100px] hidden sm:block" /> {/* Spacer for symmetry on desktop */}
        </div>
      </div>
    </motion.div>
  );
}
