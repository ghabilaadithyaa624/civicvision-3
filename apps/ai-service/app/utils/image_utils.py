import numpy as np


def decode_image_bytes(data: bytes) -> np.ndarray:
    """
    Decodes raw image bytes (e.g. from an uploaded file) into a BGR
    numpy array suitable for OpenCV/YOLO. Raises ValueError if the
    bytes don't represent a decodable image.
    """
    import cv2  # deferred import — keeps this module cheap to import elsewhere

    buffer = np.frombuffer(data, dtype=np.uint8)
    image = cv2.imdecode(buffer, cv2.IMREAD_COLOR)

    if image is None:
        raise ValueError("Could not decode image data — unsupported or corrupt format")

    return image
