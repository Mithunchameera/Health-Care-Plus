/**
 * Three.js Video Background for Healthcare E-Channelling
 * Creates animated medical-themed 3D background
 */

import * as THREE from 'https://unpkg.com/three@0.160.0/build/three.module.js';

class HealthcareVideoBackground {
    constructor(container) {
        this.container = container;
        this.scene = null;
        this.camera = null;
        this.renderer = null;
        this.particles = [];
        this.medicalIcons = [];
        this.animationId = null;
        this.time = 0;
        
        this.init();
    }
    
    init() {
        this.setupScene();
        this.createParticles();
        this.createMedicalElements();
        this.setupLighting();
        this.animate();
        this.handleResize();
    }
    
    setupScene() {
        // Scene
        this.scene = new THREE.Scene();
        this.scene.background = new THREE.Color(0x001122);
        
        // Camera
        this.camera = new THREE.PerspectiveCamera(
            75,
            this.container.offsetWidth / this.container.offsetHeight,
            0.1,
            1000
        );
        this.camera.position.z = 30;
        
        // Renderer
        this.renderer = new THREE.WebGLRenderer({ 
            alpha: true,
            antialias: true 
        });
        this.renderer.setSize(this.container.offsetWidth, this.container.offsetHeight);
        this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
        this.container.appendChild(this.renderer.domElement);
    }
    
    createParticles() {
        const particleCount = 200;
        const geometry = new THREE.BufferGeometry();
        const positions = new Float32Array(particleCount * 3);
        const colors = new Float32Array(particleCount * 3);
        
        const healthColors = [
            new THREE.Color(0x00ff88), // Medical green
            new THREE.Color(0x0099ff), // Medical blue
            new THREE.Color(0xffffff), // White
            new THREE.Color(0x88ddff)  // Light blue
        ];
        
        for (let i = 0; i < particleCount; i++) {
            const i3 = i * 3;
            
            // Random positions
            positions[i3] = (Math.random() - 0.5) * 100;
            positions[i3 + 1] = (Math.random() - 0.5) * 100;
            positions[i3 + 2] = (Math.random() - 0.5) * 100;
            
            // Random colors from health palette
            const color = healthColors[Math.floor(Math.random() * healthColors.length)];
            colors[i3] = color.r;
            colors[i3 + 1] = color.g;
            colors[i3 + 2] = color.b;
        }
        
        geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
        geometry.setAttribute('color', new THREE.BufferAttribute(colors, 3));
        
        const material = new THREE.PointsMaterial({
            size: 2,
            vertexColors: true,
            transparent: true,
            opacity: 0.8
        });
        
        this.particles = new THREE.Points(geometry, material);
        this.scene.add(this.particles);
    }
    
    createMedicalElements() {
        // Create floating medical cross symbols
        this.createMedicalCrosses();
        
        // Create DNA helix
        this.createDNAHelix();
        
        // Create heartbeat wave
        this.createHeartbeatWave();
    }
    
    createMedicalCrosses() {
        const crossGeometry = new THREE.BoxGeometry(0.2, 1, 0.1);
        const crossGeometry2 = new THREE.BoxGeometry(1, 0.2, 0.1);
        const crossMaterial = new THREE.MeshBasicMaterial({ 
            color: 0x00ff88,
            transparent: true,
            opacity: 0.7
        });
        
        for (let i = 0; i < 5; i++) {
            const crossGroup = new THREE.Group();
            
            const vertical = new THREE.Mesh(crossGeometry, crossMaterial);
            const horizontal = new THREE.Mesh(crossGeometry2, crossMaterial);
            
            crossGroup.add(vertical);
            crossGroup.add(horizontal);
            
            crossGroup.position.set(
                (Math.random() - 0.5) * 80,
                (Math.random() - 0.5) * 60,
                (Math.random() - 0.5) * 40
            );
            
            crossGroup.rotation.set(
                Math.random() * Math.PI,
                Math.random() * Math.PI,
                Math.random() * Math.PI
            );
            
            this.medicalIcons.push(crossGroup);
            this.scene.add(crossGroup);
        }
    }
    
    createDNAHelix() {
        const helixPoints = [];
        const helixColors = [];
        
        for (let i = 0; i < 200; i++) {
            const angle = (i / 200) * Math.PI * 8;
            const x = Math.cos(angle) * 3;
            const y = (i / 200) * 20 - 10;
            const z = Math.sin(angle) * 3;
            
            helixPoints.push(x, y, z);
            
            // Alternate colors for DNA strands
            if (i % 2 === 0) {
                helixColors.push(0, 1, 0.5); // Cyan
            } else {
                helixColors.push(1, 0.2, 0.8); // Magenta
            }
        }
        
        const helixGeometry = new THREE.BufferGeometry();
        helixGeometry.setAttribute('position', new THREE.Float32BufferAttribute(helixPoints, 3));
        helixGeometry.setAttribute('color', new THREE.Float32BufferAttribute(helixColors, 3));
        
        const helixMaterial = new THREE.PointsMaterial({
            size: 4,
            vertexColors: true,
            transparent: true,
            opacity: 0.8
        });
        
        this.dnaHelix = new THREE.Points(helixGeometry, helixMaterial);
        this.dnaHelix.position.set(-30, 0, -20);
        this.scene.add(this.dnaHelix);
    }
    
    createHeartbeatWave() {
        const wavePoints = [];
        const waveColors = [];
        
        for (let i = 0; i < 100; i++) {
            const x = (i / 100) * 40 - 20;
            let y = 0;
            
            // Create heartbeat pattern
            if (i % 20 < 2) {
                y = Math.sin((i % 20) * Math.PI) * 5;
            } else if (i % 20 < 5) {
                y = Math.sin(((i % 20) - 2) * Math.PI * 2) * 2;
            }
            
            const z = 0;
            
            wavePoints.push(x, y, z);
            waveColors.push(1, 0.2, 0.2); // Red for heartbeat
        }
        
        const waveGeometry = new THREE.BufferGeometry();
        waveGeometry.setAttribute('position', new THREE.Float32BufferAttribute(wavePoints, 3));
        waveGeometry.setAttribute('color', new THREE.Float32BufferAttribute(waveColors, 3));
        
        const waveMaterial = new THREE.LineBasicMaterial({
            vertexColors: true,
            transparent: true,
            opacity: 0.8,
            linewidth: 3
        });
        
        this.heartbeatWave = new THREE.Line(waveGeometry, waveMaterial);
        this.heartbeatWave.position.set(0, -15, -10);
        this.scene.add(this.heartbeatWave);
    }
    
    setupLighting() {
        // Ambient light
        const ambientLight = new THREE.AmbientLight(0x404040, 0.3);
        this.scene.add(ambientLight);
        
        // Point lights for medical atmosphere
        const light1 = new THREE.PointLight(0x00ff88, 1, 50);
        light1.position.set(20, 20, 20);
        this.scene.add(light1);
        
        const light2 = new THREE.PointLight(0x0099ff, 1, 50);
        light2.position.set(-20, -20, 20);
        this.scene.add(light2);
    }
    
    animate() {
        this.animationId = requestAnimationFrame(() => this.animate());
        
        this.time += 0.01;
        
        // Animate particles
        if (this.particles) {
            this.particles.rotation.y += 0.002;
            this.particles.rotation.x += 0.001;
        }
        
        // Animate medical crosses
        this.medicalIcons.forEach((cross, index) => {
            cross.rotation.y += 0.01 + index * 0.002;
            cross.rotation.x += 0.005;
            cross.position.y += Math.sin(this.time + index) * 0.02;
        });
        
        // Animate DNA helix
        if (this.dnaHelix) {
            this.dnaHelix.rotation.y += 0.01;
            this.dnaHelix.position.y = Math.sin(this.time) * 2;
        }
        
        // Animate heartbeat wave
        if (this.heartbeatWave) {
            this.heartbeatWave.position.x = Math.sin(this.time * 2) * 5;
        }
        
        // Camera movement
        this.camera.position.x = Math.sin(this.time * 0.5) * 5;
        this.camera.position.y = Math.cos(this.time * 0.3) * 3;
        this.camera.lookAt(0, 0, 0);
        
        this.renderer.render(this.scene, this.camera);
    }
    
    handleResize() {
        window.addEventListener('resize', () => {
            const width = this.container.offsetWidth;
            const height = this.container.offsetHeight;
            
            this.camera.aspect = width / height;
            this.camera.updateProjectionMatrix();
            this.renderer.setSize(width, height);
        });
    }
    
    destroy() {
        if (this.animationId) {
            cancelAnimationFrame(this.animationId);
        }
        
        if (this.renderer) {
            this.renderer.dispose();
            this.container.removeChild(this.renderer.domElement);
        }
    }
}

// Initialize when DOM is loaded
window.addEventListener('DOMContentLoaded', () => {
    const heroSection = document.querySelector('.hero');
    if (heroSection) {
        // Create container for 3D background
        const videoContainer = document.createElement('div');
        videoContainer.className = 'video-background';
        videoContainer.style.cssText = `
            position: absolute;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            z-index: -1;
            overflow: hidden;
        `;
        
        heroSection.style.position = 'relative';
        heroSection.insertBefore(videoContainer, heroSection.firstChild);
        
        new HealthcareVideoBackground(videoContainer);
    }
});