import { useEffect, useState, useCallback, useRef } from "react";
import { useCamera } from "@/hooks/useCamera";
import { Button } from "@/components/ui/button";
import { Camera, Loader2, AlertCircle, Video, VideoOff, SwitchCamera, Scan } from "lucide-react";
import { cn } from "@/lib/utils";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";

interface CameraCaptureProps {
  onCapture: (imageBase64: string) => void;
  onCancel: () => void;
  isAnalyzing: boolean;
}

/**
 * @component CameraCapture
 * @description Handles real-time camera feed, auto-scanning logic, and posture alignment UI.
 * Optimized for: Performance (minimal re-renders) and Security (clean stream disposal).
 */
export default function CameraCapture({
  onCapture,
  onCancel,
  isAnalyzing,
}: CameraCaptureProps) {
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
  
  // Ref used to prevent race conditions during the capture cycle
  const captureTriggeredRef = useRef(false);

  // DEV NOTE: Strict lifecycle management to prevent memory leaks/camera-in-use bugs
  useEffect(() => {
    startCamera();
    return () => stopCamera();
  }, [startCamera, stopCamera]);

  useEffect(() => {
    if (!isAnalyzing) {
      captureTriggeredRef.current = false;
    }
  }, [isAnalyzing]);

  /**
   * AUTO-SCAN LOGIC
   * Includes fix for infinite capture loop and state synchronization.
   */
  useEffect(() => {
    if (!autoScan || !isStreaming || isAnalyzing || captureTriggeredRef.current) {
      if (!autoScan || !isStreaming || isAnalyzing) {
        setScanCountdown(null);
      }
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
              // SECURITY & UX FIX: Disable auto-scan after successful capture to prevent credit drain/infinite loops
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
    if (image) {
      onCapture(image);
    }
  };

  const handleCancel = () => {
    stopCamera();
    onCancel();
  };

  return (
    <div className="space-y-4">
      {/* UI NOTE: Aspect ratio optimized for mobile (3/4) and desktop (video).
          Uses backdrop-blur for a "Premium OS" aesthetic.
      */}
      <div className="w-full aspect-[3/4] md:aspect-video bg-muted rounded-xl flex items-center justify-center relative overflow-hidden ring-1 ring-white/10 shadow-2xl">
        
        {error ? (
          <div className="text-center p-6 animate-in fade-in zoom-in duration-300">
            <AlertCircle className="h-12 w-12 text-destructive mx-auto mb-4" />
            <p className="text-destructive font-medium">{error}</p>
            <Button variant="outline" onClick={startCamera} className="mt-4">Try Again</Button>
          </div>
        ) : isAnalyzing ? (
          <div className="text-center z-20">
            <Loader2 className="h-12 w-12 animate-spin text-primary mx-auto mb-4" />
            <p className="text-lg font-medium">Analyzing Posture...</p>
            <p className="text-sm text-muted-foreground italic">AI-Engine processing biometric data</p>
          </div>
        ) : (
          <>
            <video
              ref={videoRef}
              autoPlay
              playsInline
              muted
              className={cn(
                "absolute inset-0 w-full h-full object-cover transition-opacity duration-500",
                facingMode === "user" && "transform scale-x-[-1]",
                !isStreaming ? "opacity-0" : "opacity-100"
              )}
            />

            {/* 🌟 PREMIUM FEATURE: Posture Alignment Grid (Overlay) */}
            {isStreaming && (
              <div className="absolute inset-0 pointer-events-none z-10">
                <div className="absolute inset-0 flex items-center justify-center opacity-30">
                  {/* Head Target */}
                  <div className="w-24 h-32 border-2 border-dashed border-white rounded-full mb-20 animate-pulse" />
                  {/* Center Alignment Axis */}
                  <div className="absolute h-full w-[1px] bg-white/50 left-1/2" />
                  <div className="absolute w-full h-[1px] bg-white/20 top-1/2" />
                </div>
              </div>
            )}

            {!isStreaming && (
              <div className="text-center">
                <Video className="h-16 w-16 text-muted-foreground mx-auto mb-4 animate-pulse" />
                <p className="text-muted-foreground">Initializing Camera...</p>
              </div>
            )}

            {isStreaming && (
              <div className="absolute inset-0 pointer-events-none z-20">
                {autoScan && scanCountdown !== null && (
                  <div className="absolute inset-0 flex items-center justify-center bg-black/40 backdrop-blur-[2px] transition-all">
                    <div className="text-center">
                      <div className="text-9xl font-black text-white drop-shadow-2xl scale-110">
                        {scanCountdown}
                      </div>
                      <p className="text-white font-semibold uppercase tracking-widest mt-4">Steady...</p>
                    </div>
                  </div>
                )}
                
                {!scanCountdown && (
                  <div className="absolute bottom-6 left-1/2 -translate-x-1/2 w-full px-8">
                    <p className="text-xs font-medium bg-black/60 text-white backdrop-blur-md rounded-full py-2 px-6 text-center shadow-lg border border-white/10 uppercase tracking-tighter">
                      {autoScan 
                        ? "Scan starting automatically" 
                        : "Align your spine with the vertical center line"}
                    </p>
                  </div>
                )}
              </div>
            )}
            
            {isStreaming && (
              <Button
                variant="secondary"
                size="icon"
                className="absolute top-4 right-4 z-30 bg-black/40 text-white hover:bg-black/60 border-none backdrop-blur-md rounded-full"
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

      <div className="flex items-center justify-between px-2 py-1 bg-muted/30 rounded-lg border border-white/5">
        <div className="flex items-center space-x-3">
          <Switch
            id="auto-scan"
            checked={autoScan}
            onCheckedChange={setAutoScan}
            disabled={isAnalyzing}
          />
          <Label htmlFor="auto-scan" className="text-xs font-bold uppercase tracking-wider cursor-pointer flex items-center">
            <Scan className="h-3 w-3 mr-1.5 text-primary" />
            Smart Auto-Scan
          </Label>
        </div>
        {autoScan && <span className="text-[10px] text-primary font-bold animate-pulse">TIMER ACTIVE</span>}
      </div>

      <div className="flex justify-between gap-3">
        <Button 
          variant="ghost" 
          onClick={handleCancel} 
          disabled={isAnalyzing}
          className="hover:bg-destructive/10 hover:text-destructive transition-colors"
        >
          <VideoOff className="mr-2 h-4 w-4" />
          Stop Session
        </Button>
        {!autoScan && (
          <Button
            onClick={handleCapture}
            disabled={!isStreaming || isAnalyzing}
            className="bg-primary hover:bg-primary/90 shadow-lg shadow-primary/20"
          >
            {isAnalyzing ? (
              <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Analyzing...</>
            ) : (
              <><Camera className="mr-2 h-4 w-4" /> Capture Analysis</>
            )}
          </Button>
        )}
      </div>
    </div>
  );
}