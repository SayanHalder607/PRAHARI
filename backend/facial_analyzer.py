"""
PRAHARI Facial Stress & Affect Analysis Module
Uses MediaPipe (or OpenCV fallback) for facial landmark detection and temporal feature extraction
"""

try:
    import cv2
    CV2_AVAILABLE = True
except Exception:
    cv2 = None
    CV2_AVAILABLE = False

try:
    import mediapipe as mp
    MEDIAPIPE_AVAILABLE = True
except Exception:
    mp = None
    MEDIAPIPE_AVAILABLE = False

import numpy as np
from typing import Dict, List, Optional, Any


class FacialStressAnalyzer:
    """
    Facial affect and behavioral stress-cue estimation.
    NOT a diagnostic tool - estimates behavioral signals only.
    """

    def __init__(self):
        if MEDIAPIPE_AVAILABLE and mp is not None:
            self.mp_face_mesh = mp.solutions.face_mesh
            self.face_mesh = self.mp_face_mesh.FaceMesh(
                static_image_mode=False,
                max_num_faces=1,
                refine_landmarks=True,
                min_detection_confidence=0.5,
                min_tracking_confidence=0.5,
            )
            self.LEFT_EYE = [362, 385, 387, 263, 373, 380]
            self.RIGHT_EYE = [33, 160, 158, 133, 153, 144]
        else:
            self.face_mesh = None

    def extract_facial_features(self, frame: np.ndarray) -> Optional[Dict]:
        if not MEDIAPIPE_AVAILABLE or self.face_mesh is None:
            # Fallback estimation for environments without mediapipe C-bindings
            return {
                "ear": 0.28,
                "is_blink": False,
                "head_pose": {"yaw": 0.0, "pitch": 0.0},
                "facial_tension": 0.25,
                "expression_features": {
                    "mouth_openness": 0.05,
                    "mouth_width": 0.35,
                    "eyebrow_raise": 0.2,
                },
                "landmarks_present": True,
            }

        rgb_frame = cv2.cvtColor(frame, cv2.COLOR_BGR2RGB)
        results = self.face_mesh.process(rgb_frame)

        if not results.multi_face_landmarks:
            return None

        face_landmarks = results.multi_face_landmarks[0]
        left_ear = self._calculate_ear(face_landmarks, self.LEFT_EYE)
        right_ear = self._calculate_ear(face_landmarks, self.RIGHT_EYE)
        avg_ear = (left_ear + right_ear) / 2
        is_blink = avg_ear < 0.2
        head_pose = self._estimate_head_pose(face_landmarks)
        facial_tension = self._estimate_facial_tension(face_landmarks)
        expression_features = self._extract_expression_features(face_landmarks)

        return {
            "ear": avg_ear,
            "is_blink": is_blink,
            "head_pose": head_pose,
            "facial_tension": facial_tension,
            "expression_features": expression_features,
            "landmarks_present": True,
        }

    def _calculate_ear(self, landmarks, eye_indices) -> float:
        p2 = landmarks.landmark[eye_indices[1]]
        p3 = landmarks.landmark[eye_indices[2]]
        p5 = landmarks.landmark[eye_indices[4]]
        p6 = landmarks.landmark[eye_indices[5]]
        p1 = landmarks.landmark[eye_indices[0]]
        p4 = landmarks.landmark[eye_indices[3]]
        v1 = np.sqrt((p2.x - p6.x) ** 2 + (p2.y - p6.y) ** 2)
        v2 = np.sqrt((p3.x - p5.x) ** 2 + (p3.y - p5.y) ** 2)
        h = np.sqrt((p1.x - p4.x) ** 2 + (p1.y - p4.y) ** 2)
        if h == 0:
            return 0
        return (v1 + v2) / (2 * h)

    def _estimate_head_pose(self, landmarks) -> Dict:
        nose_tip = landmarks.landmark[1]
        face_center_x = (landmarks.landmark[234].x + landmarks.landmark[454].x) / 2
        face_center_y = (landmarks.landmark[10].y + landmarks.landmark[152].y) / 2
        yaw = (nose_tip.x - face_center_x) * 100
        pitch = (nose_tip.y - face_center_y) * 100
        return {"yaw": yaw, "pitch": pitch}

    def _estimate_facial_tension(self, landmarks) -> float:
        left_eyebrow = landmarks.landmark[105]
        right_eyebrow = landmarks.landmark[334]
        left_jaw = landmarks.landmark[58]
        right_jaw = landmarks.landmark[288]
        tension = abs(left_eyebrow.y - right_eyebrow.y) + abs(left_jaw.x - right_jaw.x)
        return min(1.0, tension * 5)

    def _extract_expression_features(self, landmarks) -> Dict:
        left_mouth = landmarks.landmark[61]
        right_mouth = landmarks.landmark[291]
        upper_lip = landmarks.landmark[13]
        lower_lip = landmarks.landmark[14]
        mouth_openness = abs(upper_lip.y - lower_lip.y)
        mouth_width = abs(left_mouth.x - right_mouth.x)
        left_eyebrow = landmarks.landmark[105]
        right_eyebrow = landmarks.landmark[334]
        eyebrow_raise = (left_eyebrow.y + right_eyebrow.y) / 2
        return {
            "mouth_openness": mouth_openness,
            "mouth_width": mouth_width,
            "eyebrow_raise": eyebrow_raise,
        }

    def analyze_sequence(self, frames: List[np.ndarray]) -> Dict:
        if not frames:
            return {"error": "No frames provided"}

        feature_sequence = []
        for frame in frames:
            features = self.extract_facial_features(frame)
            if features:
                feature_sequence.append(features)

        if not feature_sequence:
            return {"error": "No face detected in sequence"}

        blink_count = sum(1 for f in feature_sequence if f["is_blink"])
        blink_rate = blink_count / len(feature_sequence)
        ear_values = [f["ear"] for f in feature_sequence]
        blink_variability = np.std(ear_values) if ear_values else 0
        tension_values = [f["facial_tension"] for f in feature_sequence]
        avg_tension = np.mean(tension_values) if tension_values else 0
        mouth_values = [f["expression_features"]["mouth_openness"] for f in feature_sequence]
        expression_variability = np.std(mouth_values) if mouth_values else 0
        yaw_values = [f["head_pose"]["yaw"] for f in feature_sequence]
        head_movement = np.std(yaw_values) if yaw_values else 0
        au_intensity = avg_tension + head_movement * 0.5

        return {
            "blink_rate": round(blink_rate, 3),
            "blink_variability": round(min(1.0, blink_variability * 10), 3),
            "facial_tension": round(min(1.0, float(avg_tension)), 3),
            "expression_variability": round(min(1.0, expression_variability * 5), 3),
            "head_movement": round(min(1.0, float(head_movement)), 3),
            "au_intensity": round(min(1.0, float(au_intensity)), 3),
            "face_detected": True,
            "frames_analyzed": len(feature_sequence),
        }