import { useEffect } from "react";
import { useCamera } from "@/hooks/useCamera";
import { Button } from "@/components/ui/button";
import { Camera, Loader2, AlertCircle, Video, VideoOff, SwitchCamera } from "lucide-react";
import { cn } from "@/lib/utils";

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

  useEffect(() => {
    startCamera();
    return () => stopCamera();
  }, [startCamera, stopCamera]);

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
    <div className="space-y-6">
      {/* Camera Preview - Larger frame */}
      <div className="aspect-[3/4] md:aspect-video max-h-[70vh] bg-muted rounded-xl flex items-center justify-center relative overflow-hidden">
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
                "w-full h-full object-cover",
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
                {/* Posture guide overlay - Larger */}
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="w-64 h-80 md:w-56 md:h-72 border-2 border-dashed border-primary/50 rounded-lg" />
                </div>
                <div className="absolute bottom-4 left-4 right-4 text-center">
                  <p className="text-sm bg-background/80 backdrop-blur-sm rounded-lg py-2 px-4 inline-block">
                    Position yourself in the frame, sitting or standing naturally
                  </p>
                </div>
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

      {/* Camera mode indicator */}
      {isStreaming && (
        <p className="text-xs text-center text-muted-foreground">
          Using {facingMode === "environment" ? "rear" : "front"} camera
        </p>
      )}

      {/* Controls */}
      <div className="flex justify-between">
        <Button variant="outline" onClick={handleCancel} disabled={isAnalyzing}>
          <VideoOff className="mr-2 h-4 w-4" />
          Cancel
        </Button>
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
      </div>
    </div>
  );
}
