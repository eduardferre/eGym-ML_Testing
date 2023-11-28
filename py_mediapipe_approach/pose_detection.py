import cv2
import mediapipe as mp
import numpy as np
import pickle
import pandas as pd

cap = cv2.VideoCapture(0)

mp_drawing = mp.solutions.drawing_utils  # type: ignore
mp_pose = mp.solutions.pose  # type: ignore

# Curl counter variables
counter = 0
stage = None

with open("deadlift.pk1", "rb") as f:
    model = pickle.load(f)

with mp_pose.Pose(
    min_detection_confidence=0.5, min_tracking_confidence=0.5
) as pose:  # Setup mediapipe instance
    while cap.isOpened():
        ret, frame = cap.read()

        # Recolor image
        image = cv2.cvtColor(frame, cv2.COLOR_BGR2RGB)
        image.flags.writeable = False

        # Make detection
        results = pose.process(image)

        # Recolor back to BGR
        image.flags.writeable = True
        image = cv2.cvtColor(image, cv2.COLOR_RGB2BGR)

        # Render detections
        mp_drawing.draw_landmarks(
            image,
            results.pose_landmarks,
            mp_pose.POSE_CONNECTIONS,
            mp_drawing.DrawingSpec(color=(245, 117, 66),
                                   thickness=2, circle_radius=4),
            mp_drawing.DrawingSpec(color=(245, 66, 230),
                                   thickness=2, circle_radius=2),
        )

        try:
            row = np.array(
                [
                    [res.x, res.y, res.z, res.visibility]
                    for res in results.pose_landmarks.landmark
                ]
            ).flatten()
            X = pd.DataFrame([row])
            body_language_class = model.predict(X)[0]
            body_language_prob = model.predict_proba(X)[0]

            cv2.rectangle(image, (0, 0), (250, 60), (245, 117, 16), -1)

            cv2.putText(
                image,
                "CLASS",
                (95, 12),
                cv2.FONT_HERSHEY_SIMPLEX,
                0.5,
                (0, 0, 0),
                1,
                cv2.LINE_AA,
            )
            cv2.putText(
                image,
                body_language_class.split(" ")[0],
                (90, 40),
                cv2.FONT_HERSHEY_SIMPLEX,
                1,
                (255, 255, 255),
                2,
                cv2.LINE_AA,
            )

            cv2.putText(
                image,
                "PROB",
                (15, 12),
                cv2.FONT_HERSHEY_SIMPLEX,
                0.5,
                (0, 0, 0),
                1,
                cv2.LINE_AA,
            )
            cv2.putText(
                image,
                str(round(
                    body_language_prob[np.argmax(body_language_prob)], 2)),
                (10, 40),
                cv2.FONT_HERSHEY_SIMPLEX,
                1,
                (255, 255, 255),
                2,
                cv2.LINE_AA,
            )

        except Exception as e:
            pass

        cv2.imshow("Raw Webcam Feed", image)

        if cv2.waitKey(10) & 0xFF == ord("q"):
            break

    cap.release()
    cv2.destroyAllWindows()
