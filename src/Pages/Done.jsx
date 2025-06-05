import React, { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ref as dbRef, update, remove, get, set } from 'firebase/database';
import { db } from '../firebase';
import { useUser } from '@clerk/clerk-react';
import { getStorage, ref as storageRef, uploadBytes, getDownloadURL } from 'firebase/storage';
import { storage } from '../firebase';  

export default function Done() {
  const { user } = useUser();
  const navigate = useNavigate();
  const [uploadedImage, setUploadedImage] = useState(null);
  const [capturedImage, setCapturedImage] = useState(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState('');
  const [taskQuestion, setTaskQuestion] = useState('');
  const [isFrontCamera, setIsFrontCamera] = useState(true);
  const [reflection, setReflection] = useState('');
  const [isImageSaved, setIsImageSaved] = useState(false);
  const [isReflectionSaved, setIsReflectionSaved] = useState(false);
  const fileInputRef = useRef(null);
  const videoRef = useRef(null);
  const [showCamera, setShowCamera] = useState(false);
  const [stream, setStream] = useState(null);

  // Function to get random question based on current task
  const getRandomQuestion = async () => {
    try {
      const userRef = dbRef(db, `users/${user.id}`);
      const userSnap = await get(userRef);
      if (!userSnap.exists()) return;
      
      const userData = userSnap.val();
      const currentTaskId = userData.currentTask;
      
      const taskRef = dbRef(db, `tasks/${currentTaskId}`);
      const taskSnap = await get(taskRef);
      if (!taskSnap.exists()) return;
      
      const taskData = taskSnap.val();
      const questions = [
        `How did you approach completing ${taskData.title}?`,
        `What was the most challenging part of ${taskData.title}?`,
        `What did you learn while completing ${taskData.title}?`,
        `How would you improve your approach to ${taskData.title} next time?`,
        `Did you face any obstacles while completing ${taskData.title}?`
      ];
      
      const randomQuestion = questions[Math.floor(Math.random() * questions.length)];
      setTaskQuestion(randomQuestion);
    } catch (error) {
      console.error('Error getting random question:', error);
    }
  };

  useEffect(() => {
    getRandomQuestion();
  }, []);

  // Handle file upload
  const handleFileUpload = (event) => {
    const file = event.target.files[0];
    if (file) {
      if (file.type.startsWith('image/')) {
        setUploadedImage(file);
        setCapturedImage(null); // Reset captured image if any
        setError('');
      } else {
        setError('Please select an image file');
      }
    }
  };

  // Start camera with specified facing mode
  const startCamera = async (forceFrontCamera = true) => {
    try {
      if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
        setError('Your browser does not support camera access');
        return;
      }

      // Stop any existing stream
      if (stream) {
        stream.getTracks().forEach(track => track.stop());
      }

      // Get list of available cameras
      const devices = await navigator.mediaDevices.enumerateDevices();
      const videoDevices = devices.filter(device => device.kind === 'videoinput');

      // Configure camera settings
      const constraints = {
        video: {
          facingMode: { exact: forceFrontCamera ? "user" : "environment" },
          width: { ideal: 1280 },
          height: { ideal: 720 }
        },
        audio: false
      };

      try {
        // First try with exact facing mode
        const mediaStream = await navigator.mediaDevices.getUserMedia(constraints);
        setupVideoStream(mediaStream);
        setIsFrontCamera(forceFrontCamera);
      } catch (err) {
        // If exact mode fails, try without exact constraint
        console.log('Falling back to basic camera mode');
        const fallbackConstraints = {
          video: {
            facingMode: forceFrontCamera ? "user" : "environment",
            width: { ideal: 1280 },
            height: { ideal: 720 }
          },
          audio: false
        };
        const mediaStream = await navigator.mediaDevices.getUserMedia(fallbackConstraints);
        setupVideoStream(mediaStream);
        setIsFrontCamera(forceFrontCamera);
      }

    } catch (err) {
      console.error('Camera access error:', err);
      if (err.name === 'NotAllowedError' || err.name === 'PermissionDeniedError') {
        setError('Camera access was denied. Please allow camera access in your browser settings.');
      } else if (err.name === 'NotFoundError' || err.name === 'DevicesNotFoundError') {
        setError('No camera found on your device.');
      } else if (err.name === 'NotReadableError' || err.name === 'TrackStartError') {
        setError('Your camera is in use by another application.');
      } else {
        setError('Failed to access camera. Please make sure you have a working camera and try again.');
      }
    }
  };

  // Toggle between front and back camera
  const switchCamera = async () => {
    await startCamera(!isFrontCamera);
  };

  // Helper function to setup video stream
  const setupVideoStream = (mediaStream) => {
    if (videoRef.current) {
      videoRef.current.srcObject = mediaStream;
      videoRef.current.style.transform = isFrontCamera ? 'scaleX(-1)' : 'none';
      
      videoRef.current.style.display = 'block';
      videoRef.current.style.width = '100%';
      videoRef.current.style.height = '100%';
      videoRef.current.style.objectFit = 'cover';
      
      videoRef.current.onloadedmetadata = () => {
        videoRef.current.play().catch(err => {
          console.error('Error playing video:', err);
          setError('Failed to start video stream');
        });
      };
    }
    setStream(mediaStream);
    setShowCamera(true);
    setError('');
  };

  // Capture photo
  const capturePhoto = () => {
    const video = videoRef.current;
    const canvas = document.createElement('canvas');
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    canvas.getContext('2d').drawImage(video, 0, 0);
    
    canvas.toBlob((blob) => {
      setCapturedImage(blob);
      setUploadedImage(null); // Reset uploaded image if any
      stopCamera();
    }, 'image/jpeg');
  };

  // Stop camera with enhanced cleanup
  const stopCamera = () => {
    if (videoRef.current) {
      videoRef.current.srcObject = null;
    }
    if (stream) {
      stream.getTracks().forEach(track => {
        track.stop();
        stream.removeTrack(track);
      });
      setStream(null);
    }
    setShowCamera(false);
  };

  // Clean up camera on component unmount
  useEffect(() => {
    return () => {
      if (stream) {
        stream.getTracks().forEach(track => {
          track.stop();
          stream.removeTrack(track);
        });
      }
    };
  }, [stream]);

  // Save image locally
  const saveImageLocally = async (imageBlob) => {
    const timestamp = new Date().getTime();
    const fileName = `task-completion-${timestamp}.jpg`;

    // Create a download link
    const downloadLink = document.createElement('a');
    downloadLink.href = URL.createObjectURL(imageBlob);
    downloadLink.download = fileName;
    
    // Trigger download
    document.body.appendChild(downloadLink);
    downloadLink.click();
    document.body.removeChild(downloadLink);

    // Clean up the URL object
    URL.revokeObjectURL(downloadLink.href);

    return fileName;
  };

  // Complete current task and move to next
  const completeTaskAndMoveNext = async () => {
    try {
      // Get current task info
      const userRef = dbRef(db, `users/${user.id}`);
      const userSnap = await get(userRef);
      if (!userSnap.exists()) throw new Error('User data not found');
      
      const userData = userSnap.val();
      const currentTaskId = userData.currentTask;
      
      // Get task data for XP
      const taskRef = dbRef(db, `tasks/${currentTaskId}`);
      const taskSnap = await get(taskRef);
      if (!taskSnap.exists()) throw new Error('Task data not found');
      
      const taskData = taskSnap.val();
      
      // Calculate new task ID
      const currentNumber = parseInt(currentTaskId.replace("task", ""));
      const newTaskId = `task${currentNumber + 1}`;
      
      // Remove ALL started tasks (not just the current one)
      const startedTasksRef = dbRef(db, `users/${user.id}/startedTasks`);
      await remove(startedTasksRef);
      
      // Calculate new XP and level
      const taskXp = taskData.xp || 0;
      let newXp = (userData.xp || 0) + taskXp;
      let newLevel = userData.level || 1;
      while (newXp >= 500) {
        newXp -= 500;
        newLevel += 1;
      }
      
      // Check if next task exists
      const nextTaskRef = dbRef(db, `tasks/${newTaskId}`);
      const nextTaskSnap = await get(nextTaskRef);
      
      // Update user data
      const updatedUserData = {
        ...userData,
        tasksCompleted: (userData.tasksCompleted || 0) + 1,
        xp: newXp,
        level: newLevel,
        currentTask: nextTaskSnap.exists() ? newTaskId : null,
        startedTasks: null // Explicitly set to null to ensure it's cleared
      };
      
      await set(userRef, updatedUserData);
      
      return true;
    } catch (error) {
      console.error('Error completing task:', error);
      throw error;
    }
  };

  // Submit handler for image
  const handleImageSubmit = async () => {
    if (!uploadedImage && !capturedImage) {
      setError('Please upload or capture an image');
      return;
    }

    setIsProcessing(true);
    setError('');

    try {
      const imageFile = uploadedImage || capturedImage;

      const userRef = dbRef(db, `users/${user.id}`);
      const userSnap = await get(userRef);
      if (!userSnap.exists()) throw new Error('User data not found');
      const userData = userSnap.val();
      const taskId = userData.currentTask;

      const timestamp = Date.now();
      const fileName = `images/${user.id}/task-completion-${timestamp}.jpg`;
      const imageRef = storageRef(storage, fileName);

      await uploadBytes(imageRef, imageFile);
      const downloadURL = await getDownloadURL(imageRef);

      const taskCompletionRef = dbRef(db, `users/${user.id}/taskCompletions/${taskId}`);
      await update(taskCompletionRef, {
        imageUrl: downloadURL,
        completedAt: new Date().toISOString(),
      });

      setIsImageSaved(true);
      setError('');
    } catch (err) {
      setError('Failed to save image. Please try again.');
      console.error('Image save error:', err);
    } finally {
      setIsProcessing(false);
    }
  };

  // Submit handler for reflection
  const handleReflectionSubmit = async () => {
    if (!reflection.trim()) {
      setError('Please provide a reflection before submitting');
      return;
    }

    setIsProcessing(true);
    setError('');

    try {
      const userRef = dbRef(db, `users/${user.id}`);
      const userSnap = await get(userRef);
      if (!userSnap.exists()) throw new Error('User data not found');
      const userData = userSnap.val();
      const taskId = userData.currentTask;

      // Save reflection
      const taskCompletionRef = dbRef(db, `users/${user.id}/taskCompletions/${taskId}`);
      await update(taskCompletionRef, {
        reflection: reflection,
      });

      // Complete task and update progress
      await completeTaskAndMoveNext();
      setIsReflectionSaved(true);
      
      // Navigate to task page
      navigate('/task');
    } catch (err) {
      setError('Failed to save reflection. Please try again.');
      console.error('Reflection save error:', err);
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-100 via-white to-indigo-100 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-6xl mx-auto flex flex-col lg:flex-row gap-8 lg:gap-16 justify-center items-start">
        {/* Main Content - Left Side */}
        <div className="w-full lg:w-[448px] bg-white rounded-2xl shadow-xl overflow-hidden border border-gray-100">
          <div className="p-8">
            <h2 className="text-2xl font-bold text-center text-gray-800 mb-8 flex items-center justify-center">
              <span className="bg-gradient-to-r from-blue-600 to-indigo-600 text-transparent bg-clip-text">
                Complete Your Task
              </span>
            </h2>

            {error && (
              <div className="mb-6 p-4 bg-red-50 border border-red-200 text-red-700 rounded-xl flex items-center">
                <svg className="w-5 h-5 mr-2 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <span className="text-sm">{error}</span>
              </div>
            )}

            {isImageSaved && (
              <div className="mb-6 p-4 bg-green-50 border border-green-200 text-green-700 rounded-xl flex items-center">
                <svg className="w-5 h-5 mr-2 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                </svg>
                <span className="text-sm">Image saved successfully!</span>
              </div>
            )}

            <div className="space-y-6">
              {/* Camera Section */}
              <div className="border-2 border-dashed border-indigo-100 rounded-xl p-6 bg-gradient-to-b from-blue-50/50 to-transparent">
                <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center">
                  <svg className="w-5 h-5 mr-2 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
                  </svg>
                  Capture Photo
                </h3>
                
                {showCamera ? (
                  <div className="space-y-4">
                    <div className="relative w-full aspect-video bg-black rounded-xl overflow-hidden shadow-inner">
                      <video
                        ref={videoRef}
                        autoPlay
                        playsInline
                        muted
                        className={`absolute inset-0 w-full h-full object-cover ${isFrontCamera ? 'mirror-mode' : ''}`}
                      />
                      <button
                        onClick={switchCamera}
                        className="absolute top-3 right-3 bg-black/60 text-white p-2.5 rounded-full hover:bg-black/80 transition-all backdrop-blur-sm"
                        title={isFrontCamera ? "Switch to back camera" : "Switch to front camera"}
                      >
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                        </svg>
                      </button>
                    </div>
                    <div className="flex justify-center space-x-4">
                      <button
                        onClick={capturePhoto}
                        className="bg-blue-600 text-white px-6 py-2.5 rounded-xl hover:bg-blue-700 transition-colors duration-200 font-medium flex items-center"
                      >
                        <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                        </svg>
                        Capture
                      </button>
                      <button
                        onClick={stopCamera}
                        className="bg-gray-100 text-gray-700 px-6 py-2.5 rounded-xl hover:bg-gray-200 transition-colors duration-200 font-medium"
                      >
                        Cancel
                      </button>
                    </div>
                  </div>
                ) : (
                  <button
                    onClick={() => startCamera(true)}
                    className="w-full py-3.5 border-2 border-blue-100 rounded-xl text-blue-600 hover:bg-blue-50 transition-colors duration-200 flex items-center justify-center font-medium"
                  >
                    <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                    </svg>
                    Start Camera
                  </button>
                )}
              </div>

              {/* Upload Section */}
              <div className="border-2 border-dashed border-indigo-100 rounded-xl p-6 bg-gradient-to-b from-indigo-50/50 to-transparent">
                <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center">
                  <svg className="w-5 h-5 mr-2 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
                  </svg>
                  Upload Photo
                </h3>
                <input
                  type="file"
                  ref={fileInputRef}
                  onChange={handleFileUpload}
                  accept="image/*"
                  className="hidden"
                />
                <button
                  onClick={() => fileInputRef.current.click()}
                  className="w-full py-3.5 border-2 border-indigo-100 rounded-xl text-indigo-600 hover:bg-indigo-50 transition-colors duration-200 flex items-center justify-center font-medium"
                >
                  <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
                  </svg>
                  Choose from Gallery
                </button>
              </div>

              {/* Preview Section */}
              {(uploadedImage || capturedImage) && (
                <div className="mt-6">
                  <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center">
                    <svg className="w-5 h-5 mr-2 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                    </svg>
                    Preview
                  </h3>
                  <div className="border-2 border-green-100 rounded-xl overflow-hidden bg-white shadow-inner">
                    <img
                      src={uploadedImage ? URL.createObjectURL(uploadedImage) : URL.createObjectURL(capturedImage)}
                      alt="Preview"
                      className="w-full h-auto"
                    />
                  </div>
                </div>
              )}

              {/* Submit Button */}
              <button
                onClick={handleImageSubmit}
                disabled={isProcessing || (!uploadedImage && !capturedImage) || isImageSaved}
                className={`w-full py-4 rounded-xl text-white font-medium shadow-lg ${
                  isProcessing || (!uploadedImage && !capturedImage) || isImageSaved
                    ? 'bg-gray-400 cursor-not-allowed'
                    : 'bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700'
                } transition-all duration-200 flex items-center justify-center`}
              >
                {isProcessing ? (
                  <>
                    <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Saving...
                  </>
                ) : (
                  <>
                    <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    {isImageSaved ? 'Image Saved!' : 'Save Image'}
                  </>
                )}
              </button>
            </div>
          </div>
        </div>

        {/* Task Question Box - Right Side */}
        {taskQuestion && (
          <div className="w-full lg:w-[448px] bg-white rounded-2xl shadow-xl overflow-hidden border border-gray-100">
            <div className="p-8">
              <h2 className="text-2xl font-bold text-center text-gray-800 mb-8 flex items-center justify-center">
                <span className="bg-gradient-to-r from-indigo-600 to-blue-600 text-transparent bg-clip-text">
                  Quick Reflection
                </span>
              </h2>
              <div className="space-y-6">
                <div className="border-2 border-indigo-100 rounded-xl p-6 bg-gradient-to-b from-indigo-50/50 to-transparent">
                  <p className="text-gray-700 text-lg mb-4 leading-relaxed">{taskQuestion}</p>
                  <textarea
                    className="w-full p-4 border-2 border-gray-200 rounded-xl focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 transition-all duration-200"
                    rows="4"
                    placeholder="Type your answer here..."
                    value={reflection}
                    onChange={(e) => setReflection(e.target.value)}
                    disabled={isReflectionSaved}
                  />
                  <button
                    onClick={handleReflectionSubmit}
                    disabled={isProcessing || !reflection.trim() || !isImageSaved || isReflectionSaved}
                    className={`mt-4 w-full py-3.5 rounded-xl font-medium flex items-center justify-center
                      ${isProcessing || !reflection.trim() || !isImageSaved || isReflectionSaved
                        ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                        : 'bg-gradient-to-r from-indigo-600 to-blue-600 text-white hover:from-indigo-700 hover:to-blue-700'
                      } transition-all duration-200`}
                  >
                    {isProcessing ? (
                      <>
                        <svg className="animate-spin -ml-1 mr-3 h-5 w-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                        </svg>
                        Saving...
                      </>
                    ) : (
                      <>
                        <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                        {isReflectionSaved ? 'Saved!' : 'Submit Reflection'}
                      </>
                    )}
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
} 