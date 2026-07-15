async function generateVideo() {
    console.log("Requesting video from Fal.ai...");
    try {
        const response = await fetch("https://queue.fal.run/fal-ai/ltx-video", {
            method: "POST",
            headers: {
                "Authorization": `Key ${process.env.FAL_KEY}`,
                "Content-Type": "application/json"
            },
            body: JSON.stringify({
                prompt: "A futuristic city skyline"
            })
        });
        const data = await response.json();
        console.log("Response:", JSON.stringify(data, null, 2));
    } catch (err) {
        console.error("Error:", err.message);
    }
}
generateVideo();
