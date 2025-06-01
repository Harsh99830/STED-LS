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

  // Submit handler
  const handleSubmit = async () => {
  if (!uploadedImage && !capturedImage) {
    setError('Please upload or capture an image');
    return;
  }

  setIsProcessing(true);
  setError('');

  try {
    const imageFile = uploadedImage || capturedImage;

    // 🔧 Get current taskId from Realtime Database, NOT from Clerk user object
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

    // ✅ Store completion record
    const taskCompletionRef = dbRef(db, `users/${user.id}/taskCompletions/${taskId}`);
    await update(taskCompletionRef, {
      imageUrl: downloadURL,
      completedAt: new Date().toISOString(),
    });

    await completeTaskAndMoveNext();
    navigate('/task');
  } catch (err) {
    setError('Failed to complete task. Please try again.');
    console.error('Task completion error:', err);
  } finally {
    setIsProcessing(false);
  }
};


  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-6xl mx-auto flex gap-16 justify-center items-start mt-8">
        {/* Main Content - Left Side */}
        <div className="w-[448px] bg-white rounded-xl shadow-lg overflow-hidden">
          <div className="p-8">
            <h2 className="text-2xl font-bold text-center text-gray-800 mb-8">
              Complete Your Task
            </h2>

            {error && (
              <div className="mb-4 p-3 bg-red-100 text-red-700 rounded-lg">
                {error}
              </div>
            )}

            <div className="space-y-6">
              {/* Camera Section */}
              <div className="border-2 border-dashed border-gray-300 rounded-lg p-4">
                <h3 className="text-lg font-medium text-gray-700 mb-4">Capture Photo</h3>
                
                {showCamera ? (
                  <div className="space-y-4">
                    <div className="relative w-full aspect-video bg-black rounded-lg overflow-hidden">
                      <video
                        ref={videoRef}
                        autoPlay
                        playsInline
                        muted
                        className={`absolute inset-0 w-full h-full object-cover ${isFrontCamera ? 'mirror-mode' : ''}`}
                      />
                      {/* Camera Switch Button */}
                      <button
                        onClick={switchCamera}
                        className="absolute top-2 right-2 bg-black bg-opacity-50 text-white p-2 rounded-full hover:bg-opacity-70 transition-all"
                        title={isFrontCamera ? "Switch to back camera" : "Switch to front camera"}
                      >
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                        </svg>
                      </button>
                    </div>
                    <div className="flex justify-center space-x-4">
                      <button
                        onClick={capturePhoto}
                        className="bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600 transition"
                      >
                        Capture
                      </button>
                      <button
                        onClick={stopCamera}
                        className="bg-gray-500 text-white px-4 py-2 rounded-lg hover:bg-gray-600 transition"
                      >
                        Cancel
                      </button>
                    </div>
                  </div>
                ) : (
                  <button
                    onClick={() => startCamera(true)}
                    className="w-full py-3 border-2 border-gray-300 rounded-lg text-gray-600 hover:bg-gray-50 transition"
                  >
                    Start Camera
                  </button>
                )}
              </div>

              {/* Upload Section */}
              <div className="border-2 border-dashed border-gray-300 rounded-lg p-4">
                <h3 className="text-lg font-medium text-gray-700 mb-4">Upload Photo</h3>
                <input
                  type="file"
                  ref={fileInputRef}
                  onChange={handleFileUpload}
                  accept="image/*"
                  className="hidden"
                />
                <button
                  onClick={() => fileInputRef.current.click()}
                  className="w-full py-3 border-2 border-gray-300 rounded-lg text-gray-600 hover:bg-gray-50 transition"
                >
                  Choose from Gallery
                </button>
              </div>

              {/* Preview Section */}
              {(uploadedImage || capturedImage) && (
                <div className="mt-4">
                  <h3 className="text-lg font-medium text-gray-700 mb-2">Preview</h3>
                  <div className="border rounded-lg overflow-hidden">
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
                onClick={handleSubmit}
                disabled={isProcessing || (!uploadedImage && !capturedImage)}
                className={`w-full py-3 rounded-lg text-white font-medium ${
                  isProcessing || (!uploadedImage && !capturedImage)
                    ? 'bg-gray-400 cursor-not-allowed'
                    : 'bg-green-500 hover:bg-green-600'
                } transition`}
              >
                {isProcessing ? 'Saving...' : 'Submit'}
              </button>
            </div>
          </div>
        </div>

        {/* Task Question Box - Right Side */}
        {taskQuestion && (
          <div className="w-[448px] bg-white rounded-xl shadow-lg overflow-hidden">
            <div className="p-8">
              <h2 className="text-2xl font-bold text-center text-gray-800 mb-8">
                Quick Reflection
              </h2>
              <div className="space-y-6">
                <div className="border-2 border-indigo-100 rounded-lg p-6">
                  <p className="text-gray-600 text-lg mb-4">{taskQuestion}</p>
                  <textarea
                    className="w-full p-4 border-2 border-gray-200 rounded-lg focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500"
                    rows="4"
                    placeholder="Type your answer here..."
                  />
                  <button
                    onClick={() => getRandomQuestion()}
                    className="mt-4 w-full py-3 text-indigo-600 hover:text-indigo-800 border-2 border-indigo-100 rounded-lg hover:bg-indigo-50 transition"
                  >
                    Get Another Question
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