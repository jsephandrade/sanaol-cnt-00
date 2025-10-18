import { useState, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '@/components/AuthContext';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import {
  Scan,
  Camera,
  CheckCircle,
  XCircle,
  ArrowLeft,
  RefreshCw,
  Clock,
  Sparkles,
  Shield,
  Zap,
} from 'lucide-react';
import PageTransition from '@/components/PageTransition';
import AuthCard from '@/components/auth/AuthCard';
import AuthPageShell, {
  AUTH_PAGE_DEFAULT_BACKGROUND,
} from '@/components/auth/AuthPageShell';
import AuthBrandIntro from '@/components/auth/AuthBrandIntro';

const FaceScanPage = () => {
  const [isScanning, setIsScanning] = useState(false);
  const [scanResult, setScanResult] = useState(null);
  const [countdown, setCountdown] = useState(0);
  const [error, setError] = useState('');
  const videoRef = useRef(null);
  const navigate = useNavigate();
  const { loginWithFace } = useAuth();

  const startFaceScan = async () => {
    let stream;
    const stopStream = () => {
      if (stream) {
        try {
          stream.getTracks().forEach((track) => track.stop());
        } catch {}
        stream = null;
      }
      if (videoRef.current && videoRef.current.srcObject) {
        videoRef.current.srcObject = null;
      }
    };

    const runCountdown = (seconds = 3) =>
      new Promise((resolve) => {
        let remaining = seconds;
        setCountdown(remaining);
        const interval = setInterval(() => {
          remaining -= 1;
          if (remaining <= 0) {
            clearInterval(interval);
            setCountdown(0);
            resolve();
          } else {
            setCountdown(remaining);
          }
        }, 1000);
      });

    try {
      setIsScanning(true);
      setError('');
      setScanResult(null);

      try {
        stream = await navigator.mediaDevices.getUserMedia({
          video: {
            width: 640,
            height: 480,
            facingMode: 'user',
          },
        });
      } catch (cameraErr) {
        throw { code: 'camera-permission', original: cameraErr };
      }

      if (videoRef.current) {
        videoRef.current.srcObject = stream;
      }

      // allow camera to stabilise before countdown
      await new Promise((resolve) => setTimeout(resolve, 500));
      await runCountdown();

      const video = videoRef.current;
      if (!video) throw new Error('Camera not ready');

      const canvas = document.createElement('canvas');
      canvas.width = video.videoWidth || 640;
      canvas.height = video.videoHeight || 480;
      const ctx = canvas.getContext('2d');
      ctx.drawImage(video, 0, 0);
      const dataUrl = canvas.toDataURL('image/jpeg', 0.9);

      stopStream();

      const res = await loginWithFace(dataUrl, { remember: true });
      if (res?.success && res?.token) {
        setScanResult('success');
        setTimeout(() => navigate('/'), 1000);
      } else if (res?.pending) {
        setScanResult('success');
        setTimeout(() => navigate('/verify'), 1000);
      } else {
        const errorMsg = res?.message || 'Face not recognized';
        setError(errorMsg);
        setScanResult('failed');
      }
    } catch (err) {
      if (err?.code === 'camera-permission') {
        setError(
          'Unable to access camera. Please ensure camera permissions are granted.'
        );
      } else {
        setError(err?.message || 'Face scan failed');
        setScanResult('failed');
      }
    } finally {
      stopStream();
      setIsScanning(false);
      setCountdown(0);
    }
  };

  const resetScan = () => {
    setScanResult(null);
    setError('');
    setCountdown(0);
  };

  const scanCard = (
    <AuthCard title="Face Scan Login" compact cardClassName="shadow-2xl">
      <p className="text-sm text-gray-600 mb-6">
        Use your face to securely log into your account using advanced DeepFace
        recognition.
      </p>

      {/* Camera viewport */}
      <div className="relative mb-6">
        <div className="w-full h-64 bg-muted rounded-lg overflow-hidden flex items-center justify-center border-2 border-dashed border-border">
          {!isScanning && !scanResult && (
            <div className="text-center text-muted-foreground">
              <Camera className="w-12 h-12 mx-auto mb-2" />
              <p className="text-sm">Camera will appear here</p>
            </div>
          )}

          {isScanning && (
            <div className="relative w-full h-full">
              <video
                ref={videoRef}
                autoPlay
                playsInline
                className="w-full h-full object-cover"
              />
              <div className="absolute inset-0 border-4 border-primary rounded-lg animate-pulse" />
              {countdown > 0 && (
                <div className="pointer-events-none absolute inset-0 flex items-center justify-center bg-background/40 backdrop-blur-[2px]">
                  <div className="rounded-full bg-background/90 px-6 py-3 text-center shadow-md">
                    <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
                      Get ready
                    </p>
                    <p className="text-3xl font-semibold text-primary">
                      {countdown}
                    </p>
                  </div>
                </div>
              )}
              <div className="absolute bottom-4 left-1/2 -translate-x-1/2 transform">
                <div className="bg-background/80 backdrop-blur-sm px-3 py-1 rounded-full">
                  <div className="flex items-center gap-2 text-sm">
                    {countdown > 0 ? (
                      <>
                        <Clock className="w-4 h-4 text-primary" />
                        Capturing in {countdown}...
                      </>
                    ) : (
                      <>
                        <RefreshCw className="w-4 h-4 animate-spin" />
                        Scanning with DeepFace...
                      </>
                    )}
                  </div>
                </div>
              </div>
            </div>
          )}

          {scanResult === 'success' && (
            <div className="text-center text-green-600">
              <CheckCircle className="w-16 h-16 mx-auto mb-2" />
              <p className="font-medium">Face recognized!</p>
              <p className="text-sm text-muted-foreground">Logging you in...</p>
            </div>
          )}

          {scanResult === 'failed' && (
            <div className="text-center text-destructive">
              <XCircle className="w-16 h-16 mx-auto mb-2" />
              <p className="font-medium">{error || 'Face not recognized'}</p>
              <p className="text-sm text-muted-foreground">Please try again</p>
            </div>
          )}
        </div>
      </div>

      {/* Error message */}
      {error && (
        <Alert variant="destructive" className="mb-4">
          <XCircle className="h-4 w-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {/* Instructions */}
      {!isScanning && !scanResult && (
        <div className="text-center text-sm text-muted-foreground space-y-2 mb-6">
          <p>• Position your face in the center of the frame</p>
          <p>• Ensure good lighting</p>
          <p>• Look directly at the camera</p>
          <p>• Only one person should be visible</p>
        </div>
      )}

      {/* Action buttons */}
      <div className="space-y-3">
        {!isScanning && !scanResult && (
          <Button onClick={startFaceScan} className="w-full" size="lg">
            <Scan className="w-4 h-4 mr-2" />
            Start Face Scan
          </Button>
        )}

        {scanResult === 'failed' && (
          <Button
            onClick={resetScan}
            className="w-full"
            variant="outline"
            size="lg"
          >
            <RefreshCw className="w-4 h-4 mr-2" />
            Try Again
          </Button>
        )}

        <div className="text-center">
          <Link
            to="/login"
            className="text-sm text-muted-foreground hover:text-foreground transition-colors inline-flex items-center"
          >
            <ArrowLeft className="w-4 h-4 mr-1" />
            Use password instead
          </Link>
        </div>
      </div>

      {/* Security note */}
      <div className="mt-6 pt-4 border-t text-center text-xs text-muted-foreground">
        <p>Secured with DeepFace AI technology</p>
        <p>Only encrypted facial embeddings are stored</p>
      </div>
    </AuthCard>
  );

  const welcomeIntro = (
    <AuthBrandIntro
      title="Secure Face Recognition"
      description="Experience lightning-fast and secure authentication with advanced DeepFace AI technology."
    >
      <div className="mt-8 space-y-4">
        <div className="flex items-start gap-3">
          <div className="mt-1">
            <Shield className="w-6 h-6 text-primary" />
          </div>
          <div>
            <h3 className="font-semibold text-lg mb-1">
              Military-Grade Security
            </h3>
            <p className="text-gray-600 text-sm">
              Powered by Facenet512 deep learning model with 99.6% accuracy.
              Your biometric data is encrypted and never stored as images.
            </p>
          </div>
        </div>

        <div className="flex items-start gap-3">
          <div className="mt-1">
            <Zap className="w-6 h-6 text-primary" />
          </div>
          <div>
            <h3 className="font-semibold text-lg mb-1">Lightning Fast</h3>
            <p className="text-gray-600 text-sm">
              Recognition happens in under 2 seconds. No passwords to remember,
              no typing required.
            </p>
          </div>
        </div>

        <div className="flex items-start gap-3">
          <div className="mt-1">
            <Sparkles className="w-6 h-6 text-primary" />
          </div>
          <div>
            <h3 className="font-semibold text-lg mb-1">Privacy First</h3>
            <p className="text-gray-600 text-sm">
              Only mathematical representations (embeddings) of your face are
              stored. Original photos are never saved.
            </p>
          </div>
        </div>
      </div>
    </AuthBrandIntro>
  );

  return (
    <PageTransition>
      <AuthPageShell
        backgroundImage={AUTH_PAGE_DEFAULT_BACKGROUND}
        waveImage="/images/b1bc6b54-fe3f-45eb-8a39-005cc575deef.png"
        formWrapperClassName="order-2 md:order-1 w-full flex justify-center px-4 md:px-0"
        asideWrapperClassName="order-1 md:order-2 mb-10 md:mb-0 flex justify-center"
        formSlot={scanCard}
        asideSlot={welcomeIntro}
      />
    </PageTransition>
  );
};

export default FaceScanPage;
