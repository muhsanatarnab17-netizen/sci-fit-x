import { useEffect, useState, useRef } from "react";
import { useCamera } from "@/hooks/useCamera";
import { Button } from "@/components/ui/button";
import { Camera, Loader2, AlertCircle, VideoOff, SwitchCamera, Scan } from "lucide-react";
import { cn } from "@/lib/utils";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { motion, AnimatePresence } from "framer-motion"; // Essential for World-Class UI

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
  } = useCamera("environment");

  const [autoScan, setAutoScan] = useState(true);
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
    if (!autoScan || !isStreaming || isAnalyzing || captureTriggeredRef.current) {
      if (!autoScan || !isStreaming || isAnalyzing) setScanCountdown(null);
      return;
    }

    setScanCountdown(3);
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
  }, [autoScan, isStreaming, isAnalyzing, captureImage, onCapture]);

  const handleCapture = () => {
    const image = captureImage();
    if (image) onCapture(image);
  };

  return (
    <motion.div 
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-4"
    >
      <div className="w-full aspect-[3/4] md:aspect-video bg-muted rounded-xl flex items-center justify-center relative overflow-hidden ring-1 ring-white/10 shadow-2xl">
        
        {error ? (
          <div className="text-center p-6 animate-in fade-in zoom-in duration-300">
            <AlertCircle className="h-12 w-12 text-destructive mx-auto mb-4" />
            <p className="text-destructive font-medium">{error}</p>
            <Button variant="outline" onClick={startCamera} className="mt-4">Try Again</Button>
          </div>
        ) : (
          <>
            <video
              ref={videoRef}
              autoPlay
              playsInline
              muted
              className={cn(
                "absolute inset-0 w-full h-full object-cover transition-opacity duration-1000",
                facingMode === "user" && "transform scale-x-[-1]",
                !isStreaming || isAnalyzing ? "opacity-30 grayscale" : "opacity-100"
              )}
            />

            {/* 🌟 PREMIUM FEATURE: The Biotech Laser Scanner Overlay */}
            <AnimatePresence>
              {isStreaming && !isAnalyzing && (
                <motion.div 
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="absolute inset-0 pointer-events-none z-20"
                >
                  {/* Vertical Neon Laser Line */}
                  <motion.div 
                    animate={{ top: ["0%", "100%", "0%"] }}
                    transition={{ duration: 4, repeat: Infinity, ease: "linear" }}
                    className="absolute left-0 right-0 h-[2px] bg-primary shadow-[0_0_15px_hsl(var(--primary))] z-30"
                  />
                  
                  {/* Cyber-Medical Corner Brackets */}
                  <div className="absolute inset-8 border-t-2 border-l-2 border-primary/40 w-12 h-12 rounded-tl-lg" />
                  <div className="absolute top-8 right-8 border-t-2 border-r-2 border-primary/40 w-12 h-12 rounded-tr-lg" />
                  <div className="absolute bottom-8 left-8 border-b-2 border-l-2 border-primary/40 w-12 h-12 rounded-bl-lg" />
                  <div className="absolute bottom-8 right-8 border-b-2 border-r-2 border-primary/40 w-12 h-12 rounded-br-lg" />

                  {/* Axis Alignment Lines */}
                  <div className="absolute h-full w-[1px] bg-primary/20 left-1/2 -translate-x-1/2" />
                  <div className="absolute w-full h-[1px] bg-primary/10 top-1/2 -translate-y-1/2" />
                </motion.div>
              )}
            </AnimatePresence>

            {/* Analysis Overlay */}
            {isAnalyzing && (
              <div className="absolute inset-0 z-40 flex items-center justify-center bg-black/60 backdrop-blur-sm">
                <div className="text-center">
                  <Loader2 className="h-16 w-16 animate-spin text-primary mx-auto mb-4" />
                  <motion.p 
                    animate={{ opacity: [0.5, 1, 0.5] }}
                    transition={{ repeat: Infinity, duration: 1.5 }}
                    className="text-xl font-bold tracking-tighter uppercase text-white"
                  >
                    Processing Biometrics...
                  </motion.p>
                </div>
              </div>
            )}

            {/* Countdown HUD */}
            {autoScan && scanCountdown !== null && !isAnalyzing && (
              <div className="absolute inset-0 flex items-center justify-center z-50">
                <motion.div 
                  initial={{ scale: 0.5, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  key={scanCountdown}
                  className="text-9xl font-black text-white drop-shadow-[0_0_30px_rgba(0,0,0,0.8)]"
                >
                  {scanCountdown}
                </motion.div>
              </div>
            )}
            
            {isStreaming && (
              <Button
                variant="secondary"
                size="icon"
                className="absolute top-4 right-4 z-50 bg-black/40 text-white hover:bg-black/60 border-none backdrop-blur-md rounded-full"
                onClick={switchCamera}
                disabled={isAnalyzing}
              >
                <SwitchCamera className="h-5 w-5" />
              </Button>
            )}
          </>
        )}
        
        <canvas ref={canvasRef} className="hidden" />
      </div>

      {/* Control Panel (Simplified and High-End) */}
      <div className="flex items-center justify-between px-4 py-3 bg-muted/30 rounded-xl border border-white/5 backdrop-blur-sm">
        <div className="flex items-center space-x-3">
          <Switch id="auto-scan" checked={autoScan} onCheckedChange={setAutoScan} disabled={isAnalyzing} />
          <Label htmlFor="auto-scan" className="text-[10px] font-black uppercase tracking-[0.2em] cursor-pointer flex items-center text-muted-foreground">
            <Scan className="h-3 w-3 mr-2 text-primary" />
            AI-Auto Scan
          </Label>
        </div>
        {autoScan && <span className="text-[9px] text-primary font-bold tracking-widest animate-pulse">SYSTEM ARMED</span>}
      </div>

      <div className="flex justify-between gap-3 pt-2">
        <Button variant="ghost" onClick={onCancel} disabled={isAnalyzing} className="text-xs uppercase font-bold tracking-widest text-muted-foreground hover:text-destructive">
          <VideoOff className="mr-2 h-4 w-4" /> Disconnect
        </Button>
        {!autoScan && (
          <Button onClick={handleCapture} disabled={!isStreaming || isAnalyzing} className="bg-primary hover:scale-105 transition-transform px-8">
             <Camera className="mr-2 h-4 w-4" /> Capture Now
          </Button>
        )}
      </div>
    </motion.div>
  );
}