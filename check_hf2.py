import huggingface_hub as hf
for repo in ["Comfy-Org/flux_text_encoders", "Comfy-Org/FLUX.1-schnell", "black-forest-labs/FLUX.1-schnell"]:
    try:
        files = hf.list_repo_files(repo)
        print(f"=== {repo} ===")
        for f in files:
            print(f)
    except Exception as e:
        print(f"=== {repo} === ERROR: {str(e)[:80]}")
