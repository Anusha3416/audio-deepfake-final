import torch
import torch.nn as nn

from app.lcnn import LCNN
from app.attention_pooling import AttentionPooling


class MLPDeepfakeDetector(nn.Module):
    """Classifier trained with mean-pooled WavLM embeddings (matches saved weights)."""

    def __init__(self):
        super().__init__()
        self.net = nn.Sequential(
            nn.Linear(768, 512),
            nn.ReLU(),
            nn.Dropout(0.3),
            nn.Linear(512, 128),
            nn.ReLU(),
            nn.Dropout(0.3),
            nn.Linear(128, 2),
        )

    def forward(self, x):
        return self.net(x)


class DeepfakeDetector(nn.Module):

    def __init__(self):

        super().__init__()

        self.lcnn = LCNN()

        self.pool = AttentionPooling(
            input_dim=64
        )

        self.classifier = nn.Sequential(

            nn.Linear(64, 128),

            nn.ReLU(),

            nn.Dropout(0.3),

            nn.Linear(128, 2)
        )

    def forward(self, x):

        x = self.lcnn(x)

        x = self.pool(x)

        return self.classifier(x)


def build_classifier_from_checkpoint(state_dict):
    keys = list(state_dict.keys())

    if any(key.startswith("lcnn.") for key in keys):
        model = DeepfakeDetector()
        model.load_state_dict(state_dict)
        return model, "lcnn"

    if any(key.startswith("net.") for key in keys):
        model = MLPDeepfakeDetector()
        model.load_state_dict(state_dict)
        return model, "mlp"

    raise ValueError(f"Unrecognized checkpoint format: {keys[:5]}")


def run_classifier(model, model_type, features):
    if model_type == "mlp":
        pooled = features.mean(dim=1)
        return model(pooled)

    return model(features)
