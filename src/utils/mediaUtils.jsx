// Start audio recording
export const startRecording = async (mediaRecorderRef, audioChunksRef) => {
  const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
  const recorder = new MediaRecorder(stream);
  audioChunksRef.current = [];

  recorder.ondataavailable = (event) => {
    if (event.data.size > 0) {
      audioChunksRef.current.push(event.data);
    }
  };

  recorder.start();
  mediaRecorderRef.current = recorder;
};

// Stop and download the recording + screenshot
export const stopAndDownload = async (mediaRecorderRef, audioChunksRef, navigate) => {
  const recorder = mediaRecorderRef.current;

  if (!recorder) return;

  recorder.onstop = async () => {
    // 1. Download audio
    const audioBlob = new Blob(audioChunksRef.current, { type: "audio/webm" });
    const audioUrl = URL.createObjectURL(audioBlob);
    const audioLink = document.createElement("a");
    audioLink.href = audioUrl;
    audioLink.download = "recording.webm";
    document.body.appendChild(audioLink);
    audioLink.click();
    document.body.removeChild(audioLink);

    // 2. Download screenshot
    try {
      const canvas = await html2canvas(document.body);
      canvas.toBlob((blob) => {
        const imageUrl = URL.createObjectURL(blob);
        const imageLink = document.createElement("a");
        imageLink.href = imageUrl;
        imageLink.download = "snapshot.png";
        document.body.appendChild(imageLink);
        imageLink.click();
        document.body.removeChild(imageLink);
      });
    } catch (error) {
      console.error("Screenshot capture failed:", error);
    }

    mediaRecorderRef.current = null;
    audioChunksRef.current = [];

    navigate("/done");
  };

  recorder.stop();
};
