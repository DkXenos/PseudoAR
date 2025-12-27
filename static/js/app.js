// Main application controller
class App {
    constructor() {
        this.handTracker = new HandTracker();
        this.sceneManager = new SceneManager();
        this.isInitialized = false;
    }

    async initialize() {
        if (this.isInitialized) return;

        const videoElement = document.getElementById('webcam');
        const canvasElement = document.getElementById('hand-canvas');
        const containerElement = document.getElementById('canvas-container');
        const loadingElement = document.getElementById('loading');

        try {
            // Initialize Three.js scene
            this.sceneManager.initialize(containerElement);
            this.sceneManager.animate();

            // Show loading message
            loadingElement.style.display = 'block';
            loadingElement.textContent = 'Requesting camera access...';

            // Initialize hand tracking
            await this.handTracker.initialize(videoElement, canvasElement);

            loadingElement.textContent = 'Initializing hand tracking...';

            // Set up hand detection callback
            this.handTracker.onHandDetected = (handData) => {
                this.updateUI(handData);
                if (handData.detected) {
                    this.sceneManager.checkHandModelInteraction(handData.position);
                }
            };

            // Hide loading
            loadingElement.style.display = 'none';
            this.isInitialized = true;

        } catch (error) {
            loadingElement.textContent = 'ERROR: Cannot access camera';
            loadingElement.style.color = 'red';

            let errorMsg = 'Camera Error: ';
            if (error.name === 'NotAllowedError') {
                errorMsg += 'Permission denied. Click the camera icon in the address bar to allow access.';
            } else if (error.name === 'NotFoundError') {
                errorMsg += 'No camera found on your device.';
            } else if (error.name === 'NotReadableError') {
                errorMsg += 'Camera is already in use by another application.';
            } else {
                errorMsg += error.message;
            }
            alert(errorMsg);
        }
    }

    updateUI(handData) {
        document.getElementById('hand-status').textContent = handData.detected ? 'Yes' : 'No';
        
        if (handData.detected) {
            document.getElementById('finger-pos').textContent = 
                `(${handData.fingerPos.x.toFixed(3)}, ${handData.fingerPos.y.toFixed(3)})`;
            document.getElementById('3d-pos').textContent = 
                `(${handData.position.x.toFixed(2)}, ${handData.position.y.toFixed(2)}, ${handData.position.z.toFixed(2)})`;
        } else {
            document.getElementById('finger-pos').textContent = 'N/A';
            document.getElementById('3d-pos').textContent = 'N/A';
        }
    }
}

// Initialize app when DOM is ready
document.addEventListener('DOMContentLoaded', function() {
    const app = new App();
    
    const startButton = document.getElementById('start-button');
    startButton.onclick = function() {
        document.getElementById('start-screen').style.display = 'none';
        app.initialize();
    };
});
