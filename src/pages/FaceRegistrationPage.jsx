import React, { useState, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Progress } from '@/components/ui/progress';
import { UserPlus, XCircle, ArrowLeft } from 'lucide-react';
import Header from '@/components/auth/Header';
import PageTransition from '@/components/PageTransition';
import { useToast } from '@/hooks/use-toast';
import CameraCapture from '@/components/face-registration/CameraCapture';
import RegistrationStatus from '@/components/face-registration/RegistrationStatus';
import ImagePreview from '@/components/face-registration/ImagePreview';
import RegistrationActions from '@/components/face-registration/RegistrationActions';
import RegistrationInstructions from '@/components/face-registration/RegistrationInstructions';

const FaceRegistrationPage = () => {
  const [step, setStep] = useState('initial'); // initial, scanning, processing, complete, error
  const [capturedImages, setCapturedImages] = useState([]);
  const [progress, setProgress] = useState(0);
  const [error, setError] = useState('');
  const [showPreview, setShowPreview] = useState(false);
  const cameraRef = useRef(null);
  const navigate = useNavigate();
  const { toast } = useToast();

  const capturePositions = [
    { name: 'Center', instruction: 'Look straight at the camera', angle: 0 },
    { name: 'Left', instruction: 'Turn your head slightly to the left', angle: -15 },
    { name: 'Right', instruction: 'Turn your head slightly to the right', angle: 15 },
    { name: 'Up', instruction: 'Tilt your head slightly up', angle: 0 },
    { name: 'Smile', instruction: 'Smile naturally at the camera', angle: 0 }
  ];

  const startRegistration = async () => {
    try {
      setStep('scanning');
      setError('');
      setCapturedImages([]);
      setProgress(0);

      // Request camera access
      const stream = await navigator.mediaDevices.getUserMedia({ 
        video: { 
          width: 640, 
          height: 480,
          facingMode: 'user'
        } 
      });
      
      const videoElement = cameraRef.current?.getVideoRef();
      if (videoElement) {
        videoElement.srcObject = stream;
      }

      // Capture multiple face angles
      for (let i = 0; i < capturePositions.length; i++) {
        await new Promise(resolve => {
          setTimeout(() => {
            const imageData = cameraRef.current?.captureImage(i);
            if (imageData) {
              setCapturedImages(prev => [...prev, imageData]);
            }
            setProgress(((i + 1) / capturePositions.length) * 100);
            resolve();
          }, 2000); // 2 seconds between captures
        });
      }

      // Stop camera
      stream.getTracks().forEach(track => track.stop());
      
      setStep('processing');
      
      // Simulate processing
      setTimeout(() => {
        // TODO: Replace with actual backend API call
        // This is where you would send the captured images to your backend
        // for face encoding and storage
        processFaceData();
      }, 2000);

    } catch (err) {
      setError('Unable to access camera. Please ensure camera permissions are granted.');
      setStep('error');
    }
  };


  const processFaceData = async () => {
    try {
      // TODO: Replace with actual API call
      // Example backend integration:
      // const response = await fetch('/api/face/register', {
      //   method: 'POST',
      //   headers: { 'Content-Type': 'application/json' },
      //   body: JSON.stringify({
      //     userId: currentUser.id,
      //     faceImages: capturedImages,
      //     metadata: { device: navigator.userAgent }
      //   })
      // });
      
      // Simulate successful processing
      const success = Math.random() > 0.2; // 80% success rate for demo
      
      if (success) {
        setStep('complete');
        toast({
          title: "Face registered successfully!",
          description: "You can now use face scan to log in.",
        });
      } else {
        throw new Error('Processing failed');
      }
    } catch (err) {
      setError('Failed to process face data. Please try again.');
      setStep('error');
    }
  };

  const resetRegistration = () => {
    setStep('initial');
    setCapturedImages([]);
    setProgress(0);
    setError('');
    setShowPreview(false);
  };

  const currentPosition = capturePositions[Math.floor((progress / 100) * capturePositions.length)];

  return (
    <PageTransition>
      <div className="min-h-screen bg-gradient-to-br from-background to-muted">
        <Header />
        
        <div className="flex items-center justify-center px-4 py-12">
          <div className="w-full max-w-md space-y-6">
            {/* Back button */}
            <Link to="/settings" className="inline-flex items-center text-sm text-muted-foreground hover:text-foreground transition-colors">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Settings
            </Link>

            <Card>
              <CardHeader className="text-center">
                <CardTitle className="flex items-center justify-center gap-2">
                  <UserPlus className="w-6 h-6 text-primary" />
                  Register Your Face
                </CardTitle>
                <CardDescription>
                  Set up face recognition for secure login
                </CardDescription>
              </CardHeader>
              
              <CardContent className="space-y-6">
                {/* Progress indicator */}
                {(step === 'scanning' || step === 'processing') && (
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span>Progress</span>
                      <span>{Math.round(progress)}%</span>
                    </div>
                    <Progress value={progress} className="w-full" />
                  </div>
                )}

                {/* Camera viewport */}
                <div className="relative">
                  <CameraCapture
                    ref={cameraRef}
                    step={step}
                    currentPosition={currentPosition}
                    capturedImages={capturedImages}
                    capturePositions={capturePositions}
                  />
                  <RegistrationStatus step={step} />
                </div>

                {/* Captured images preview */}
                <ImagePreview
                  capturedImages={capturedImages}
                  showPreview={showPreview}
                  setShowPreview={setShowPreview}
                />

                {/* Error message */}
                {error && (
                  <Alert variant="destructive">
                    <XCircle className="h-4 w-4" />
                    <AlertDescription>{error}</AlertDescription>
                  </Alert>
                )}

                {/* Instructions */}
                <RegistrationInstructions step={step} />

                {/* Action buttons */}
                <div className="space-y-3">
                  <RegistrationActions
                    step={step}
                    onStartRegistration={startRegistration}
                    onReset={resetRegistration}
                    navigate={navigate}
                  />
                </div>
              </CardContent>
            </Card>

            {/* Security note */}
            <div className="text-center text-xs text-muted-foreground space-y-1">
              <p>Your face data is encrypted and stored securely.</p>
              <p>You can remove it anytime from settings.</p>
            </div>
          </div>
        </div>
      </div>
    </PageTransition>
  );
};

export default FaceRegistrationPage;