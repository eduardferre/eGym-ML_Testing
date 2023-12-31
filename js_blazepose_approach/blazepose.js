import * as poseDetection from '@tensorflow-models/pose-detection'
import '@tensorflow/tfjs-backend-webgl'

const video = document.getElementById('video')
const canvas = document.getElementById('output')
const ctx = canvas.getContext('2d')
let detector, model
const scoreThreshold = 0.6

async function createDetector () {
  model = poseDetection.SupportedModels.BlazePose
  const detectorConfig = {
    runtime: 'tfjs',
    enableSmoothing: true,
    modelType: 'full'
  }
  detector = await poseDetection.createDetector(model, detectorConfig)
}

async function activateVideo () {
  video.onclick = () => {
    const videoWidth = video.videoWidth
    const videoHeight = video.videoHeight

    video.width = videoWidth
    video.height = videoHeight
    canvas.width = videoWidth
    canvas.height = videoHeight

    // Because the image from camera is mirrored, need to flip horizontally.
    ctx.translate(videoWidth, 0)
    ctx.scale(-1, 1)
  }

  video.addEventListener('play', predictPoses)
}

async function predictPoses () {
  let poses = null

  if (detector != null) {
    try {
      poses = await detector.estimatePoses(video, {
        flipHorizontal: false
      })
    } catch (error) {
      detector.dispose()
      detector = null
      alert(error)
    }
  }

  ctx.drawImage(video, 0, 0, video.videoWidth, video.videoHeight)

  if (poses && poses.length > 0) {
    for (const pose of poses) {
      if (pose.keypoints != null) {
        drawKeypoints(pose.keypoints)
        drawSkeleton(pose.keypoints)
      }
    }
  }

  window.requestAnimationFrame(predictPoses)
}

function drawKeypoints (keypoints) {
  ctx.fillStyle = 'Green'
  ctx.strokeStyle = 'White'
  ctx.lineWidth = 2
  for (let i = 0; i < keypoints.length; i++) {
    drawKeypoint(keypoints[i])
  }
}

function drawKeypoint (keypoint) {
  const radius = 4
  if (keypoint.score >= scoreThreshold) {
    const circle = new Path2D()
    circle.arc(keypoint.x, keypoint.y, radius, 0, 2 * Math.PI)
    ctx.fill(circle)
    ctx.stroke(circle)
  }
}

/* function drawKeypointsColor(keypoints) {
      const keypointInd = poseDetection.util.getKeypointIndexBySide(model);
      ctx.strokeStyle = 'White';
      ctx.lineWidth = 2;

      ctx.fillStyle = 'Red';
      for (const i of keypointInd.middle) {
          drawKeypoint(keypoints[i]);
      }

      ctx.fillStyle = 'Green';
      for (const i of keypointInd.left) {
          drawKeypoint(keypoints[i]);
      }

      ctx.fillStyle = 'Orange';
      for (const i of keypointInd.right) {
          drawKeypoint(keypoints[i]);
      }
  } */

function drawSkeleton (keypoints) {
  const color = '#fff'
  ctx.fillStyle = color
  ctx.strokeStyle = color
  ctx.lineWidth = 2

  poseDetection.util.getAdjacentPairs(model)
    .forEach(([i, j]) => {
      const kp1 = keypoints[i]
      const kp2 = keypoints[j]
      if (kp1.score >= scoreThreshold && kp2.score >= scoreThreshold) {
        ctx.beginPath()
        ctx.moveTo(kp1.x, kp1.y)
        ctx.lineTo(kp2.x, kp2.y)
        ctx.stroke()
      }
    })
}

async function app () {
  // Load the model and create a detector object
  await createDetector()

  // Enable camera and activate video
  await activateVideo()
};

app()
