const video = document.getElementById('video');
const statusDiv = document.getElementById('status');
let model;

async function setupCamera() {
    try{
        const stream = await navigator.mediaDevices.getUserMedia({
            video: {facingMode: 'environment' },
            audio: false
        });
        video.srcObject = stream;
        return new Promise((resolve) => video.onloadedmetadata = () => resolve(video));
    } catch (e) {
        statusDiv.innerText = "カメラの起動に失敗" + e.message;
    }
}

async function initAI() {
    statusDiv.innerText = "カメラと１０００種類識別AIを準備中…";
    await setupCamera();

    try{
        model = await mobilenet.load({ version: 2, alpha: 1.0 });
        statusDiv.innerText ="準備完了！カメラに物を映してください。";
        predictLoop();
    } catch (e) {
        statusDiv.innerText = "AIの読み込みに失敗しました:" + e.message;
        console.error(e);
    }
}

async function predictLoop() {
    if (video.readyState >= 2) {
        try {
            const predictions = await model.classify(video, 3);

            if (predictions && predictions.length > 0) {
                const topResult = predictions[0];
                const name = topResult.className;
                const score = Math.round(topResult.probability * 100);

                statusDiv.innerHTML = `<span style="font-size: 1.8rem; front-weight:bold; color: #00249c;">${name}</span> (${score}%`;
            }
        } catch (err) {
            console.error(err);
        }
    }
    window.requestAnimationFrame(predictLoop);
}

window.addEventListener('load', initAI);