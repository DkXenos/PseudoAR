// Hand tracking module using MediaPipe
class HandTracker {
    constructor() {
        this.hands = null;
        this.webcamCamera = null;
        this.handCanvas = null;
        this.handCtx = null;
        this.handPosition = { x: 0, y: 0, z: 0 };
        this.onHandDetected = null;
    }

    async initialize(videoElement, canvasElement) {
        this.handCanvas = canvasElement;
        this.handCtx = this.handCanvas.getContext('2d');
        
        this.handCanvas.width = window.innerWidth;
        this.handCanvas.height = window.innerHeight;
        
        window.addEventListener('resize', () => {
            this.handCanvas.width = window.innerWidth;
            this.handCanvas.height = window.innerHeight;
        });
        
        try {
            const stream = await navigator.mediaDevices.getUserMedia({ 
                video: { 
                    width: 1280, 
                    height: 720,
                    facingMode: 'user'
                } 
            });
            
            videoElement.srcObject = stream;
            
            await new Promise((resolve) => {
                videoElement.onloadedmetadata = () => {
                    videoElement.play();
                    resolve();
                };
            });
            
            this.hands = new Hands({
                locateFile: (file) => {
                    return `https://cdn.jsdelivr.net/npm/@mediapipe/hands/${file}`;
                }
            });

            this.hands.setOptions({
                maxNumHands: 2,
                modelComplexity: 1,
                minDetectionConfidence: 0.7,
                minTrackingConfidence: 0.7
            });

            this.hands.onResults((results) => this.onResults(results));

            this.webcamCamera = new Camera(videoElement, {
                onFrame: async () => {
                    await this.hands.send({ image: videoElement });
                },
                width: 1280,
                height: 720
            });
            
            await this.webcamCamera.start();
            return true;
            
        } catch (error) {
            console.error('Camera access error:', error);
            throw error;
        }
    }

    onResults(results) {
        this.handCtx.save();
        this.handCtx.clearRect(0, 0, this.handCanvas.width, this.handCanvas.height);
        
        if (results.multiHandLandmarks && results.multiHandLandmarks.length > 0) {
            for (const landmarks of results.multiHandLandmarks) {
                this.drawHandLandmarks(landmarks);
            }
            
            const landmarks = results.multiHandLandmarks[0];
            const indexFingerTip = landmarks[8];
            
            const normalizedX = indexFingerTip.x - 0.5;
            const normalizedY = -(indexFingerTip.y - 0.5);
            
            this.handPosition.x = normalizedX * 40;
            this.handPosition.y = normalizedY * 30 + 10;
            this.handPosition.z = -indexFingerTip.z * 20;
            
            if (this.onHandDetected) {
                this.onHandDetected({
                    detected: true,
                    position: this.handPosition,
                    fingerPos: { x: indexFingerTip.x, y: indexFingerTip.y }
                });
            }
            
        } else {
            this.handPosition = { x: 0, y: 0, z: 0 };
            
            if (this.onHandDetected) {
                this.onHandDetected({
                    detected: false,
                    position: { x: 0, y: 0, z: 0 },
                    fingerPos: { x: 0, y: 0 }
                });
            }
        }
        
        this.handCtx.restore();
    }

    drawHandLandmarks(landmarks) {
        const width = this.handCanvas.width;
        const height = this.handCanvas.height;
        
        const connections = [
            [0, 1], [1, 2], [2, 3], [3, 4],
            [0, 5], [5, 6], [6, 7], [7, 8],
            [5, 9], [9, 10], [10, 11], [11, 12],
            [9, 13], [13, 14], [14, 15], [15, 16],
            [13, 17], [17, 18], [18, 19], [19, 20],
            [0, 17]
        ];
        
        this.handCtx.strokeStyle = '#00FF00';
        this.handCtx.lineWidth = 3;
        for (const [start, end] of connections) {
            const startPoint = landmarks[start];
            const endPoint = landmarks[end];
            
            this.handCtx.beginPath();
            this.handCtx.moveTo(startPoint.x * width, startPoint.y * height);
            this.handCtx.lineTo(endPoint.x * width, endPoint.y * height);
            this.handCtx.stroke();
        }
        
        this.handCtx.fillStyle = '#FF0000';
        for (const landmark of landmarks) {
            this.handCtx.beginPath();
            this.handCtx.arc(landmark.x * width, landmark.y * height, 5, 0, 2 * Math.PI);
            this.handCtx.fill();
        }
        
        const indexTip = landmarks[8];
        this.handCtx.fillStyle = '#00FFFF';
        this.handCtx.beginPath();
        this.handCtx.arc(indexTip.x * width, indexTip.y * height, 8, 0, 2 * Math.PI);
        this.handCtx.fill();
    }

    getHandPosition() {
        return this.handPosition;
    }
}
