"""
LTX-2.3 — Text-to-Audio-Video generation on Kaggle / Colab
==========================================================
Verified setup (source: modelscope/DiffSynth-Studio docs/en/Model_Details/LTX-2.md
and examples/ltx2/model_inference/LTX-2.3-T2AV-TwoStage.py).

>>> HARDWARE REALITY CHECK (read before running) <<<
This uses the full LTX-2.3 dev model (~44GB bf16) + Gemma-3-12B text encoder (~24GB).
- The 8GB-VRAM claim in the docs assumes ~32-64GB SYSTEM RAM for CPU offload.
- Kaggle/Colab FREE tiers (~13-16GB RAM) WILL run out of memory. It will not run there.
- To actually run this you need a backend with >=32GB RAM:
    * Colab Pro / Pro+ (A100, 32GB+ RAM)  -> paid, but "unlimited" (no credit cap)
    * Kaggle with a high-RAM accelerator    -> paid tier
    * Your own desktop + NVIDIA GPU (32GB VRAM) -> truly free + unlimited
- If you only have free tiers, use LTX Studio free credits (ltx.studio) instead; this
  notebook is for a capable GPU backend.

HOW TO USE (Kaggle):
  1. New notebook -> Settings -> Accelerator = GPU (must be a >=32GB-RAM backend).
  2. Paste CELL 1 and CELL 2 below as two cells, run them top to bottom.
  3. Output mp4 appears in the notebook filesystem; download / view it.

HOW TO USE (Colab):
  Same two cells. Runtime -> Change runtime type -> GPU (Pro for enough RAM).
"""

# =====================================================================
# CELL 1 — install DiffSynth-Studio
# (not on PyPI; clone + editable install, per official docs)
# =====================================================================
import subprocess, sys, os

print("Cloning DiffSynth-Studio ...")
subprocess.run(
    "git clone https://github.com/modelscope/DiffSynth-Studio.git",
    shell=True, check=True,
)
os.chdir("DiffSynth-Studio")
print("Installing (this may reinstall torch/diffusers; if it breaks the env, restart the runtime) ...")
subprocess.run(
    f"{sys.executable} -m pip install -e .",
    shell=True, check=True,
)
print("Done installing.")

# =====================================================================
# CELL 2 — run LTX-2.3 text-to-audio-video (two-stage)
# Edit `prompt` to whatever you want. Reduce height/width/num_frames
# if you must lower memory further (still needs >=32GB RAM total).
# =====================================================================
import torch
from diffsynth.pipelines.ltx2_audio_video import LTX2AudioVideoPipeline, ModelConfig
from diffsynth.utils.data.media_io_ltx2 import write_video_audio_ltx2

# VRAM management: offload unused layers to CPU RAM, compute on CUDA.
vram_config = {
    "offload_dtype": torch.bfloat16,
    "offload_device": "cpu",
    "onload_dtype": torch.bfloat16,
    "onload_device": "cuda",
    "preparing_dtype": torch.bfloat16,
    "preparing_device": "cuda",
    "computation_dtype": torch.bfloat16,
    "computation_device": "cuda",
}

pipe = LTX2AudioVideoPipeline.from_pretrained(
    torch_dtype=torch.bfloat16,
    device="cuda",
    model_configs=[
        ModelConfig(model_id="google/gemma-3-12b-it-qat-q4_0-unquantized",
                    origin_file_pattern="model-*.safetensors", **vram_config),
        ModelConfig(model_id="Lightricks/LTX-2.3",
                    origin_file_pattern="ltx-2.3-22b-dev.safetensors", **vram_config),
        ModelConfig(model_id="Lightricks/LTX-2.3",
                    origin_file_pattern="ltx-2.3-spatial-upscaler-x2-1.0.safetensors", **vram_config),
    ],
    tokenizer_config=ModelConfig(model_id="google/gemma-3-12b-it-qat-q4_0-unquantized"),
    stage2_lora_config=ModelConfig(model_id="Lightricks/LTX-2.3",
                                   origin_file_pattern="ltx-2.3-22b-distilled-lora-384.safetensors"),
)

prompt = "Two cute orange cats, wearing boxing gloves, stand in a boxing ring and fight each other. They are punching each other fast and yelling: 'I will win!'"
negative_prompt = pipe.default_negative_prompt["LTX-2.3"]

# Keep resolution/frames modest on the first run.
height, width, num_frames = 1024, 1536, 121   # must be mult of 64 for two-stage; frames = 8n+1
video, audio = pipe(
    prompt=prompt,
    negative_prompt=negative_prompt,
    seed=43,
    height=height,
    width=width,
    num_frames=num_frames,
    tiled=True,
    use_two_stage_pipeline=True,
)

write_video_audio_ltx2(
    video=video,
    audio=audio,
    output_path="ltx2.3_output.mp4",
    fps=24,
    audio_sample_rate=pipe.audio_vocoder.output_sampling_rate,
)
print("Saved ltx2.3_output.mp4")
