import React, { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { ref as dbRef, update, remove, get, set } from 'firebase/database';
import { db } from '../firebase';
import { useUser } from '@clerk/clerk-react';

export default function Done() {
  const { user } = useUser();
  const navigate = useNavigate();
  const [uploadedImage, setUploadedImage] = useState(null);
  const [capturedImage, setCapturedImage] = useState(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState('');
  const fileInputRef = useRef(null);
  const videoRef = useRef(null);
  const [showCamera, setShowCamera] = useState(false);
  const [stream, setStream] = useState(null);

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

  // Start camera
  const startCamera = async () => {
    try {
      const mediaStream = await navigator.mediaDevices.getUserMedia({ video: true });
      videoRef.current.srcObject = mediaStream;
      setStream(mediaStream);
      setShowCamera(true);
      setError('');
    } catch (err) {
      setError('Failed to access camera');
      console.error('Error accessing camera:', err);
    }
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

  // Stop camera
  const stopCamera = () => {
    if (stream) {
      stream.getTracks().forEach(track => track.stop());
      setStream(null);
    }
    setShowCamera(false);
  };

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
      const savedFileName = await saveImageLocally(imageFile);

      // Save completion record
      const taskCompletionRef = dbRef(db, `users/${user.id}/taskCompletions/${Date.now()}`);
      await update(taskCompletionRef, {
        localFileName: savedFileName,
        completedAt: new Date().toISOString(),
      });

      // Complete current task and move to next
      await completeTaskAndMoveNext();

      // Navigate back to task page
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
      <div className="max-w-md mx-auto bg-white rounded-xl shadow-lg overflow-hidden">
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
                  <video
                    ref={videoRef}
                    autoPlay
                    playsInline
                    className="w-full rounded-lg"
                  />
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
                  onClick={startCamera}
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
    </div>
  );
} 