// Three.js scene manager
class SceneManager {
    constructor() {
        this.scene = null;
        this.camera = null;
        this.renderer = null;
        this.mmdModel = null;
        this.MODEL_PATH = '/models/your_model.pmx';
    }

    initialize(containerElement) {
        this.scene = new THREE.Scene();
        
        this.camera = new THREE.PerspectiveCamera(
            45, 
            window.innerWidth / window.innerHeight, 
            0.1, 
            1000
        );
        this.camera.position.set(0, 10, 30);
        this.camera.lookAt(0, 10, 0);

        this.renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true });
        this.renderer.setSize(window.innerWidth, window.innerHeight);
        this.renderer.setClearColor(0x000000, 0);
        containerElement.appendChild(this.renderer.domElement);

        const ambientLight = new THREE.AmbientLight(0xffffff, 0.6);
        this.scene.add(ambientLight);

        const directionalLight = new THREE.DirectionalLight(0xffffff, 0.8);
        directionalLight.position.set(1, 1, 1);
        this.scene.add(directionalLight);

        window.addEventListener('resize', () => this.onWindowResize());
    }

    loadMMDModel() {
        // Placeholder for MMD model loading
        // Uncomment and use when .pmx model is available
        /*
        const loader = new THREE.MMDLoader();
        loader.load(
            this.MODEL_PATH,
            (mesh) => {
                this.mmdModel = mesh;
                this.mmdModel.position.set(0, 0, 0);
                this.mmdModel.scale.set(1, 1, 1);
                this.scene.add(this.mmdModel);
            },
            (xhr) => {
                console.log((xhr.loaded / xhr.total * 100) + '% loaded');
            },
            (error) => {
                console.error('Error loading MMD model:', error);
            }
        );
        */
    }

    onWindowResize() {
        this.camera.aspect = window.innerWidth / window.innerHeight;
        this.camera.updateProjectionMatrix();
        this.renderer.setSize(window.innerWidth, window.innerHeight);
    }

    animate() {
        requestAnimationFrame(() => this.animate());
        this.renderer.render(this.scene, this.camera);
    }

    checkHandModelInteraction(handPosition) {
        if (this.mmdModel) {
            const distance = Math.sqrt(
                Math.pow(handPosition.x - this.mmdModel.position.x, 2) +
                Math.pow(handPosition.y - this.mmdModel.position.y, 2) +
                Math.pow(handPosition.z - this.mmdModel.position.z, 2)
            );
            
            if (distance < 5) {
                // Trigger interaction logic here
                return true;
            }
        }
        return false;
    }
}
