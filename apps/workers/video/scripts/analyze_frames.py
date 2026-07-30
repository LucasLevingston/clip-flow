"""Analyzes sampled video frames for face position (crop) and sharpness (thumbnail).
Invoked by OpenCvFocusDetector via child_process — see docs/integrations/opencv.md.

Usage: analyze_frames.py <model.onnx> <frame1.jpg> [frame2.jpg ...]
Output: JSON array on stdout, one entry per input frame, same order.
"""

import json
import sys

import cv2


def load_detector(model_path):
    try:
        return cv2.FaceDetectorYN_create(model_path, "", (320, 320), 0.6, 0.3, 5000)
    except cv2.error as error:
        print(f"WARN: failed to load face detector model: {error}", file=sys.stderr)
        return None


def detect_face_center(detector, image):
    if detector is None:
        return None, None
    height, width = image.shape[:2]
    detector.setInputSize((width, height))
    _, faces = detector.detect(image)
    if faces is None or len(faces) == 0:
        return None, None
    best = max(faces, key=lambda face: face[-1])
    x, y, w, h = best[0], best[1], best[2], best[3]
    return float(x + w / 2), float(y + h / 2)


def compute_sharpness(image):
    gray = cv2.cvtColor(image, cv2.COLOR_BGR2GRAY)
    return float(cv2.Laplacian(gray, cv2.CV_64F).var())


def analyze(model_path, frame_paths):
    detector = load_detector(model_path)
    results = []
    for frame_path in frame_paths:
        image = cv2.imread(frame_path)
        if image is None:
            results.append(
                {"framePath": frame_path, "faceCenterX": None, "faceCenterY": None, "sharpness": 0.0}
            )
            continue
        face_x, face_y = detect_face_center(detector, image)
        results.append(
            {
                "framePath": frame_path,
                "faceCenterX": face_x,
                "faceCenterY": face_y,
                "sharpness": compute_sharpness(image),
            }
        )
    return results


def main():
    if len(sys.argv) < 2:
        print("Usage: analyze_frames.py <model.onnx> <frame1.jpg> [frame2.jpg ...]", file=sys.stderr)
        sys.exit(1)
    model_path = sys.argv[1]
    frame_paths = sys.argv[2:]
    print(json.dumps(analyze(model_path, frame_paths)))


if __name__ == "__main__":
    main()
