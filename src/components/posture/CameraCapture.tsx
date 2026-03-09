import { useEffect, useState, useCallback } from "react";
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
  } = useCamera("environment"); // Default to rear camera

  const [autoScan, setAutoScan] = useState(true);
  const [scanCountdown, setScanCountdown] = useState<number | null>(null);

  useEffect(() => {
    startCamera();
    return () => stopCamera();
  }, [startCamera, stopCamera]);

  // Auto-scanning logic
  useEffect(() => {
    if (!autoScan || !isStreaming || isAnalyzing) {
      setScanCountdown(null);
      return;
    }

    // Start countdown when camera is ready
    setScanCountdown(3);
    const countdownInterval = setInterval(() => {
      setScanCountdown((prev) => {
        if (prev === null || prev <= 1) {
          clearInterval(countdownInterval);
          // Capture automatically when countdown reaches 0
          if (prev === 1) {
            const image = captureImage();
            if (image) {
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

  const handleSwitchCamera = async () => {
    await switchCamera();
  };

  return (
    <div className="space-y-4">
      {/* Camera Preview - Full frame */}
      <div className="w-full aspect-[3/4] md:aspect-video bg-muted rounded-xl flex items-center justify-center relative overflow-hidden">
        {error ? (
          <div className="text-center p-6">
            <AlertCircle className="h-12 w-12 text-destructive mx-auto mb-4" />
            <p className="text-destructive font-medium">{error}</p>
            <Button
              variant="outline"
              onClick={startCamera}
              className="mt-4"
            >
              Try Again
            </Button>
          </div>
        ) : isAnalyzing ? (
          <div className="text-center">
            <Loader2 className="h-12 w-12 animate-spin text-primary mx-auto mb-4" />
            <p className="text-lg font-medium">Analyzing your posture...</p>
            <p className="text-sm text-muted-foreground">
              AI is evaluating your position
            </p>
          </div>
        ) : (
          <>
            <video
              ref={videoRef}
              autoPlay
              playsInline
              muted
              className={cn(
                "absolute inset-0 w-full h-full object-cover",
                facingMode === "user" && "transform scale-x-[-1]",
                !isStreaming && "hidden"
              )}
            />
            {!isStreaming && (
              <div className="text-center">
                <Video className="h-16 w-16 text-muted-foreground mx-auto mb-4 animate-pulse" />
                <p className="text-muted-foreground">Starting camera...</p>
              </div>
            )}
            {isStreaming && (
              <div className="absolute inset-0 pointer-events-none">
                {/* Countdown overlay for auto-scan */}
                {autoScan && scanCountdown !== null && (
                  <div className="absolute inset-0 flex items-center justify-center bg-black/20">
                    <div className="text-center">
                      <div className="text-8xl font-bold text-white drop-shadow-lg animate-pulse">
                        {scanCountdown}
                      </div>
                      <p className="text-white text-lg mt-4 bg-black/50 px-4 py-2 rounded-lg">
                        Get ready...
                      </p>
                    </div>
                  </div>
                )}
                
                {/* Instruction overlay */}
                {!scanCountdown && (
                  <div className="absolute bottom-4 left-4 right-4 text-center">
                    <p className="text-sm bg-background/90 backdrop-blur-sm rounded-lg py-2 px-4 inline-block">
                      {autoScan 
                        ? "Auto-scan will begin shortly. Stand or sit naturally." 
                        : "Position yourself in the frame, sitting or standing naturally"}
                    </p>
                  </div>
                )}
              </div>
            )}
            
            {/* Camera switch button */}
            {isStreaming && (
              <Button
                variant="secondary"
                size="icon"
                className="absolute top-4 right-4 bg-background/80 backdrop-blur-sm hover:bg-background/90"
                onClick={handleSwitchCamera}
                disabled={isAnalyzing}
              >
                <SwitchCamera className="h-5 w-5" />
              </Button>
            )}
          </>
        )}
        
        {/* Hidden canvas for capture */}
        <canvas ref={canvasRef} className="hidden" />
      </div>

      {/* Auto-scan toggle */}
      <div className="flex items-center justify-center space-x-2 py-2">
        <Switch
          id="auto-scan"
          checked={autoScan}
          onCheckedChange={setAutoScan}
          disabled={isAnalyzing}
        />
        <Label htmlFor="auto-scan" className="text-sm font-medium cursor-pointer">
          <Scan className="inline h-4 w-4 mr-1" />
          Auto-scan mode {autoScan && "(3s countdown)"}
        </Label>
      </div>

      {/* Controls */}
      <div className="flex justify-between gap-2">
        <Button variant="outline" onClick={handleCancel} disabled={isAnalyzing}>
          <VideoOff className="mr-2 h-4 w-4" />
          Cancel
        </Button>
        {!autoScan && (
          <Button
            onClick={handleCapture}
            disabled={!isStreaming || isAnalyzing}
          >
            {isAnalyzing ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Analyzing...
              </>
            ) : (
              <>
                <Camera className="mr-2 h-4 w-4" />
                Capture & Analyze
              </>
            )}
          </Button>
        )}
      </div>
    </div>
  );
}
