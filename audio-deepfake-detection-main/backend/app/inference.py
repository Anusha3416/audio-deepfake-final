import os

BASE_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
SAVED_MODELS_DIR = os.path.join(BASE_DIR, "saved_models")

MODEL_CANDIDATES = [
    os.path.join(SAVED_MODELS_DIR, "best_model.pt"),
    os.path.join(SAVED_MODELS_DIR, "backup_model.pt"),
    os.path.join(SAVED_MODELS_DIR, "model.pt"),
    os.path.join(BASE_DIR, "..", "backup_model.pt"),
]

_models = None


def _resolve_model_path():
    for path in MODEL_CANDIDATES:
        if os.path.exists(path):
            return os.path.abspath(path)
    return MODEL_CANDIDATES[0]


def _load_models():
    global _models
    if _models is not None:
        return _models

    import torch
    import librosa
    import torch.nn.functional as F
    from transformers import WavLMModel, AutoFeatureExtractor
    from app.model import build_classifier_from_checkpoint, run_classifier

    model_path = _resolve_model_path()

    if not os.path.exists(model_path):
        raise FileNotFoundError(
            f"Model weights not found. Place best_model.pt or backup_model.pt in "
            f"{SAVED_MODELS_DIR}"
        )

    print(f"Using model weights: {model_path}")

    device = "cuda" if torch.cuda.is_available() else "cpu"

    print("Loading WavLM...")
    wavlm = WavLMModel.from_pretrained("microsoft/wavlm-base-plus").to(device)
    wavlm.eval()

    print("Loading classifier...")
    state_dict = torch.load(model_path, map_location=device)
    model, model_type = build_classifier_from_checkpoint(state_dict)
    model.to(device)
    model.eval()
    print(f"Classifier ready ({model_type})")

    feature_extractor = AutoFeatureExtractor.from_pretrained("microsoft/wavlm-base-plus")
    print("Model ready")

    _models = {
        "torch": torch,
        "librosa": librosa,
        "F": F,
        "wavlm": wavlm,
        "model": model,
        "model_type": model_type,
        "run_classifier": run_classifier,
        "feature_extractor": feature_extractor,
        "device": device,
    }
    return _models


def predict(file_path):
    ctx = _load_models()

    torch = ctx["torch"]
    librosa = ctx["librosa"]
    F = ctx["F"]
    wavlm = ctx["wavlm"]
    model = ctx["model"]
    model_type = ctx["model_type"]
    run_classifier = ctx["run_classifier"]
    feature_extractor = ctx["feature_extractor"]
    device = ctx["device"]

    audio, _ = librosa.load(file_path, sr=16000)
    max_len = 32000

    if len(audio) > max_len:
        audio = audio[:max_len]
    else:
        audio = torch.nn.functional.pad(
            torch.tensor(audio),
            (0, max_len - len(audio)),
        ).numpy()

    inputs = feature_extractor(
        audio,
        sampling_rate=16000,
        return_tensors="pt",
        padding=True,
    )
    inputs = {k: v.to(device) for k, v in inputs.items()}

    with torch.no_grad():
        features = wavlm(**inputs).last_hidden_state
        output = run_classifier(model, model_type, features)

    probs = F.softmax(output, dim=1)
    pred = torch.argmax(probs, dim=1).item()
    confidence = torch.max(probs).item()

    result = "deepfake" if pred == 1 else "real"
    return {"result": result, "confidence": round(confidence, 4)}


if __name__ == "__main__":
    test_path = os.path.join(BASE_DIR, "test.wav")
    print(predict(test_path))
