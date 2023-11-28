import { DrawingUtils } from '@mediapipe/tasks-vision';
const demosSection = document.getElementById('demos');
// let poseLandmarker: PoseLandmarker = undefined
// let runningMode = 'IMAGE'
let enableWebcamButton;
let webcamRunning = false;
const videoHeight = '360px';
const videoWidth = '480px';
const video = document.getElementById("webcam");
const canvasElement = document.getElementById("output_canvas");
const canvasCtx = canvasElement.getContext("2d");
const drawingUtils = new DrawingUtils(canvasCtx);
const hasGetUserMedia = () => !!navigator.mediaDevices?.getUserMedia;
console.log(hasGetUserMedia);
if (hasGetUserMedia()) {
    enableWebcamButton = document.getElementById("webcamButton");
    enableWebcamButton.addEventListener("click", enableCam);
}
else {
    console.warn("getUserMedia() is not supported by your browser");
}
function enableCam(event) {
    // if (!poseLandmarker) {
    //   console.log("Wait! poseLandmaker not loaded yet.");
    //   return;
    // }
    console.log('hey');
    if (webcamRunning === true) {
        webcamRunning = false;
        enableWebcamButton.innerText = "ENABLE PREDICTIONS";
    }
    else {
        webcamRunning = true;
        enableWebcamButton.innerText = "DISABLE PREDICTIONS";
    }
    // getUsermedia parameters.
    const constraints = {
        video: true
    };
    // Activate the webcam stream.
    navigator.mediaDevices.getUserMedia(constraints).then((stream) => {
        video.srcObject = stream;
        // video.addEventListener("loadeddata", predictWebcam);
    });
}
//# sourceMappingURL=index.js.map