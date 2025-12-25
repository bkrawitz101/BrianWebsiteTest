// JavaScript file loaded successfully

// Video Lazy Loading System
function initVideoLazyLoading() {
    const videos = document.querySelectorAll('video[data-src]');
    
    // Intersection Observer for lazy loading
    const videoObserver = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                const video = entry.target;
                loadVideo(video);
                videoObserver.unobserve(video);
            }
        });
    }, {
        rootMargin: '50px', // Start loading 50px before video comes into view
        threshold: 0.1
    });
    
    // Load video function
    function loadVideo(video) {
        const dataSrc = video.dataset.src;
        if (dataSrc && !video.src) {
            video.src = dataSrc;
            video.load();
            
            // Only autoplay if it's the header background video
            if (video.closest('.header-background-video')) {
                video.play().catch(() => {
                    // Autoplay failed - this is normal
                });
            }
        }
    }
    
    // Observe all videos
    videos.forEach(video => {
        videoObserver.observe(video);
    });
    
    // Load header video immediately (above the fold)
    const headerVideo = document.querySelector('.header-background-video video');
    if (headerVideo) {
        loadVideo(headerVideo);
    }
}

// Global function to start background audio
function startBackgroundAudioGlobal() {
    const backgroundAudio = document.getElementById('backgroundAudio');
    const audioBtn = document.getElementById('playAudioBtn');
    
    if (backgroundAudio && audioBtn) {
        backgroundAudio.volume = 0.3;
        backgroundAudio.loop = true;
        
        // Check if audio is already playing
        if (!backgroundAudio.paused) {
            return;
        }
        
        // Try to play audio
        const playPromise = backgroundAudio.play();
        
        if (playPromise !== undefined) {
            playPromise.then(() => {
                // Update audio button to show playing state
                audioBtn.innerHTML = '<i class="fas fa-volume-up"></i><span>Audio On</span>';
                audioBtn.classList.add('playing');
            }).catch(function(error) {
                // Show button in muted state if audio fails
                audioBtn.innerHTML = '<i class="fas fa-volume-mute"></i><span>Enable Audio</span>';
                audioBtn.classList.remove('playing');
            });
        }
    }
}

// Background audio functionality
function initBackgroundAudio() {
    const backgroundAudio = document.getElementById('backgroundAudio');
    const audioBtn = document.getElementById('playAudioBtn');
    
    if (backgroundAudio && audioBtn) {
        // Set volume to a subtle level
        backgroundAudio.volume = 0.3;
        
        // Ensure audio loops
        backgroundAudio.loop = true;
        
        // Audio control button functionality
        audioBtn.addEventListener('click', function() {
            if (backgroundAudio.paused) {
                // Start playing
                backgroundAudio.play().then(() => {
                    audioBtn.innerHTML = '<i class="fas fa-volume-up"></i><span>Audio On</span>';
                    audioBtn.classList.add('playing');
                }).catch(function(error) {
                    audioBtn.innerHTML = '<i class="fas fa-volume-mute"></i><span>Enable Audio</span>';
                    audioBtn.classList.remove('playing');
                });
            } else {
                // Pause playing
                backgroundAudio.pause();
                audioBtn.innerHTML = '<i class="fas fa-volume-mute"></i><span>Audio Off</span>';
                audioBtn.classList.remove('playing');
            }
        });
        
        // Try to play audio on page load (only if video intro is not active)
        document.addEventListener('DOMContentLoaded', function() {
            const videoIntro = document.getElementById('videoIntro');
            // Only try autoplay if video intro is not present or hidden
            if (!videoIntro || videoIntro.style.display === 'none') {
                // Try to play audio (may be blocked by browser autoplay policy)
                backgroundAudio.play().then(() => {
                    audioBtn.innerHTML = '<i class="fas fa-volume-up"></i><span>Audio On</span>';
                    audioBtn.classList.add('playing');
                }).catch(function(error) {
                    // Autoplay blocked - this is normal
                });
            }
        });
        
        // Audio event listeners for debugging and state management
        backgroundAudio.addEventListener('loadstart', function() {
            // Audio load started
        });
        
        backgroundAudio.addEventListener('loadedmetadata', function() {
            // Audio metadata loaded
        });
        
        backgroundAudio.addEventListener('canplay', function() {
            // Audio can play
        });
        
        backgroundAudio.addEventListener('playing', function() {
            // Audio started playing
        });
        
        backgroundAudio.addEventListener('error', function(e) {
            // Audio error occurred
        });
    }
}

// Video intro functionality
function initVideoIntro() {
    const videoIntro = document.getElementById('videoIntro');
    const introVideo = document.getElementById('introVideo');
    const backgroundAudio = document.getElementById('backgroundAudio');
    
    if (videoIntro && introVideo) {
        // Set video duration for mobile fallback
        introVideo.addEventListener('loadedmetadata', function() {
            const videoDuration = introVideo.duration;
            
            // Mobile fallback: if video doesn't play properly, force transition after video duration
            if (videoDuration > 0) {
                setTimeout(() => {
                    // Transitioning to main site well before video ends
                    if (videoIntro.style.display !== 'none') {
                        transitionToMainSite();
                    }
                }, (videoDuration - 2) * 1000);
            }
        });
        
        // Video event listeners for mobile fallback
        introVideo.addEventListener('ended', function() {
            // Video intro ended (fallback transition)
            if (videoIntro.style.display !== 'none') {
                transitionToMainSite();
            }
        });
        
        introVideo.addEventListener('error', function(e) {
            // Video error on mobile
            if (videoIntro.style.display !== 'none') {
                transitionToMainSite();
            }
        });
        
        introVideo.addEventListener('stalled', function() {
            // Video stalled on mobile
            if (videoIntro.style.display !== 'none') {
                transitionToMainSite();
            }
        });
        
        introVideo.addEventListener('waiting', function() {
            // Video waiting on mobile
            if (videoIntro.style.display !== 'none') {
                transitionToMainSite();
            }
        });
        
        introVideo.addEventListener('play', function() {
            // Video started, attempting to start audio
            if (backgroundAudio && backgroundAudio.paused) {
                startBackgroundAudioGlobal();
            }
        });
        
        introVideo.addEventListener('canplay', function() {
            // Video can play, attempting to start audio
            if (backgroundAudio && backgroundAudio.paused) {
                startBackgroundAudioGlobal();
            }
        });
        
        introVideo.addEventListener('loadstart', function() {
            // Video load started
        });
        
        introVideo.addEventListener('loadedmetadata', function() {
            // Video metadata loaded
        });
        
        // Try to start background audio when video starts
        introVideo.addEventListener('canplay', function() {
            if (backgroundAudio && backgroundAudio.paused) {
                startBackgroundAudioGlobal();
            }
        });
        
        // Video click handler to skip intro
        videoIntro.addEventListener('click', function() {
            // Video intro clicked, starting audio
            if (backgroundAudio && backgroundAudio.paused) {
                startBackgroundAudioGlobal();
            }
            transitionToMainSite();
        });
        
        // Initialize video intro
        videoIntro.style.display = 'block';
        videoIntro.style.opacity = '1';
        videoIntro.style.visibility = 'visible';
        videoIntro.style.zIndex = '1000';
    }
}

// Transition to main site
function transitionToMainSite() {
    const videoIntro = document.getElementById('videoIntro');
    const mainSite = document.querySelector('.container');
    
    if (videoIntro && mainSite) {
        // Starting transition to main site
        videoIntro.style.opacity = '0';
        videoIntro.style.transition = 'opacity 1s ease-in-out';
        
        setTimeout(() => {
            videoIntro.style.display = 'none';
            mainSite.style.opacity = '1';
            mainSite.style.visibility = 'visible';
            // Transition to main site complete
        }, 1000);
    }
}

// Test audio functionality
function testAudio() {
    const backgroundAudio = document.getElementById('backgroundAudio');
    
    if (backgroundAudio) {
        // Testing audio element...
        if (backgroundAudio) {
            // Audio element found
            // Audio readyState: backgroundAudio.readyState
            // Audio networkState: backgroundAudio.networkState
            // Audio paused: backgroundAudio.paused
            // Audio src: backgroundAudio.src
            // Audio duration: backgroundAudio.duration
            // Audio currentTime: backgroundAudio.currentTime
            
            // Try to load and play audio
            backgroundAudio.load();
            
            backgroundAudio.addEventListener('loadstart', function() {
                // Audio load started
            });
            
            backgroundAudio.addEventListener('loadedmetadata', function() {
                // Audio metadata loaded
            });
            
            backgroundAudio.addEventListener('canplay', function() {
                // Audio can play
                backgroundAudio.play().then(() => {
                    // Audio started playing
                }).catch(function(e) {
                    // Audio error occurred
                });
            });
        }
    }
}

// Initialize audio on user interaction
function initAudioOnInteraction() {
    const backgroundAudio = document.getElementById('backgroundAudio');
    const audioBtn = document.getElementById('playAudioBtn');
    
    if (backgroundAudio && audioBtn) {
        // Audio started on user interaction
        backgroundAudio.play().then(() => {
            audioBtn.innerHTML = '<i class="fas fa-volume-up"></i><span>Audio On</span>';
            audioBtn.classList.add('playing');
        }).catch(function(error) {
            // Audio failed on interaction
        });
    }
}

// Initiate Sequence functionality
function initInitiateSequence() {
    const initiateSequence = document.getElementById('initiateSequence');
    const videoIntro = document.getElementById('videoIntro');
    const introVideo = document.getElementById('introVideo');
    const backgroundAudio = document.getElementById('backgroundAudio');
    const audioBtn = document.getElementById('playAudioBtn');
    
    if (initiateSequence) {
        // Add click handler to the flashing box
        const flashingBox = initiateSequence.querySelector('.flashing-box');
        
        if (flashingBox) {
            flashingBox.addEventListener('click', function() {
                
                // Change button text and add flashing red effect
                const sequenceText = flashingBox.querySelector('.sequence-text');
                if (sequenceText) {
                    sequenceText.textContent = 'System Activated';
                    sequenceText.style.color = '#ff0000';
                    sequenceText.style.textShadow = '0 0 20px #ff0000, 0 0 40px #ff0000, 0 0 60px #ff0000';
                }
                
                // Add flashing animation to the button
                flashingBox.style.animation = 'flash-red 0.5s ease-in-out infinite';
                
                // Voice announcement
                if ('speechSynthesis' in window) {
                    const speechSynth = window.speechSynthesis;
                    const speechUtterance = new SpeechSynthesisUtterance('System activated');
                    speechUtterance.rate = 0.8;
                    speechUtterance.pitch = 0.8;
                    speechUtterance.volume = 1.0;
                    
                    // Set voice
                    const voices = speechSynth.getVoices();
                    const trinoidsVoice = voices.find(voice => voice.name.includes('Trinoids'));
                    if (trinoidsVoice) {
                        speechUtterance.voice = trinoidsVoice;
                    }
                    
                    // Track speech timing
                    let speechStartTime = null;
                    let speechDuration = null;
                    
                    speechUtterance.onstart = () => {
                        speechStartTime = Date.now();
                    };
                    
                    speechUtterance.onend = () => {
                        speechDuration = Date.now() - speechStartTime;
                        
                        // Stop the blinking animation
                        flashingBox.style.animation = 'none';
                        
                        // Hide the initiate sequence immediately
                        initiateSequence.style.opacity = '0';
                        initiateSequence.style.display = 'none';
                        
                        // Start video immediately after voice ends
                        startVideoSequence();
                    };
                    
                    speechSynth.speak(speechUtterance);
                } else {
                    // Fallback if speech synthesis not available
                    setTimeout(() => {
                        // Stop the blinking animation
                        flashingBox.style.animation = 'none';
                
                // Hide the initiate sequence
                initiateSequence.style.opacity = '0';
                    initiateSequence.style.display = 'none';
                        
                        startVideoSequence();
                    }, 3000); // 3 second fallback
                }
            });
        }
    }
}

// Start video sequence after supernova completes
function startVideoSequence() {
    const videoIntro = document.getElementById('videoIntro');
    const introVideo = document.getElementById('introVideo');
    const backgroundAudio = document.getElementById('backgroundAudio');
    const audioBtn = document.getElementById('playAudioBtn');
                
                // Show video intro
                if (videoIntro) {
                    videoIntro.style.display = 'block';
                    videoIntro.style.opacity = '1';
        videoIntro.style.visibility = 'visible';
        videoIntro.style.zIndex = '9999';
        
                } else {
                    console.error('❌ Video intro element not found');
                }
                
                // Start video
                if (introVideo) {
                    // Set video properties for mobile
                    introVideo.muted = true; // Required for mobile autoplay
                    introVideo.playsInline = true; // Prevents fullscreen on mobile
        
        // Ensure video overlay is visible on mobile
        const videoOverlay = videoIntro.querySelector('.video-overlay');
        if (videoOverlay) {
            videoOverlay.style.display = 'flex';
            videoOverlay.style.visibility = 'visible';
            videoOverlay.style.zIndex = '9999';
        }
                    
                    introVideo.play().then(() => {
                        
                        // Start audio when video starts
                        if (backgroundAudio && audioBtn) {
                            backgroundAudio.volume = 0.3;
                            backgroundAudio.loop = true;
                            backgroundAudio.play().then(() => {
                                audioBtn.innerHTML = '<i class="fas fa-volume-up"></i><span>Audio On</span>';
                                audioBtn.classList.add('playing');
                            }).catch((error) => {
                                // Audio failed
                            });
                        }
            
            // Clean up supernova explosion container after video starts
            setTimeout(() => {
                if (window.supernovaExplosionContainer && window.supernovaExplosionContainer.parentNode) {
                    window.supernovaExplosionContainer.parentNode.removeChild(window.supernovaExplosionContainer);
                    window.supernovaExplosionContainer = null;
                }
            }, 500);
            
                    }).catch((error) => {
                        // Video failed to start - fallback: if video fails, still show the main site
                        setTimeout(() => {
                            transitionToMainSite();
                        }, 1000);
                    });
        
        // Mobile fallback: ensure video intro is visible after a delay
        setTimeout(() => {
            if (videoIntro && videoIntro.style.display !== 'none') {
                videoIntro.style.display = 'block';
                videoIntro.style.opacity = '1';
                videoIntro.style.visibility = 'visible';
                
                const videoOverlay = videoIntro.querySelector('.video-overlay');
                if (videoOverlay) {
                    videoOverlay.style.display = 'flex';
                    videoOverlay.style.visibility = 'visible';
                }
            }
        }, 500);
    }
}

// Create supernova explosion effect
function createSupernovaEffect(centerX, centerY) {
    // Create explosion container with full black background
    const explosionContainer = document.createElement('div');
    explosionContainer.style.cssText = `
        position: fixed;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        pointer-events: none;
        z-index: 10001;
        background: #000000;
    `;
    document.body.appendChild(explosionContainer);
    
    // Create realistic supernova core
    const supernovaCore = document.createElement('div');
    supernovaCore.style.cssText = `
        position: absolute;
        left: ${centerX}px;
        top: ${centerY}px;
        width: 0;
        height: 0;
        background: radial-gradient(circle, 
            rgba(255, 255, 255, 1) 0%,
            rgba(255, 255, 255, 0.9) 5%,
            rgba(255, 255, 255, 0.7) 15%,
            rgba(255, 255, 255, 0.4) 30%,
            rgba(255, 255, 255, 0.2) 50%,
            transparent 70%);
        border-radius: 50%;
        pointer-events: none;
        z-index: 10002;
        transform: translate(-50%, -50%);
        animation: supernovaCore 0.5s ease-out forwards;
    `;
    explosionContainer.appendChild(supernovaCore);
    
    // Create intense initial flash
    const initialFlash = document.createElement('div');
    initialFlash.style.cssText = `
        position: fixed;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        background: radial-gradient(circle at ${centerX}px ${centerY}px, 
            rgba(255, 255, 255, 1) 0%, 
            rgba(255, 255, 255, 0.95) 5%, 
            rgba(255, 255, 255, 0.8) 15%, 
            rgba(255, 255, 255, 0.5) 30%, 
            rgba(255, 255, 255, 0.2) 50%, 
            transparent 80%);
        z-index: 10003;
        opacity: 0;
        animation: initialFlash 0.3s ease-out forwards;
    `;
    document.body.appendChild(initialFlash);
    
    // Create multiple particle systems for realistic explosion
    const particleSystems = [
        { count: 120, colors: ['hsl(15, 100%, 70%)', 'hsl(45, 100%, 70%)', 'hsl(60, 100%, 70%)'], size: [2, 8], speed: [0.6, 1.2] }, // Core particles
        { count: 80, colors: ['hsl(30, 100%, 80%)', 'hsl(50, 100%, 80%)', 'hsl(0, 100%, 80%)'], size: [1, 4], speed: [0.8, 1.5] }, // Secondary particles
        { count: 60, colors: ['hsl(20, 100%, 60%)', 'hsl(40, 100%, 60%)'], size: [3, 6], speed: [1.0, 1.8] } // High-speed particles
    ];
    
    particleSystems.forEach((system, systemIndex) => {
        for (let i = 0; i < system.count; i++) {
            const particle = document.createElement('div');
            const angle = (Math.PI * 2 * i) / system.count + (Math.random() - 0.5) * 0.5;
            const distance = 100 + Math.random() * 300;
            const size = system.size[0] + Math.random() * (system.size[1] - system.size[0]);
            const speed = system.speed[0] + Math.random() * (system.speed[1] - system.speed[0]);
            const delay = Math.random() * 0.4;
            const color = system.colors[Math.floor(Math.random() * system.colors.length)];
            
            particle.style.cssText = `
                position: absolute;
                left: ${centerX}px;
                top: ${centerY}px;
                width: ${size}px;
                height: ${size}px;
                background: ${color};
                border-radius: 50%;
                box-shadow: 0 0 ${size * 4}px ${color}, 0 0 ${size * 8}px ${color};
                pointer-events: none;
                z-index: ${10004 + systemIndex};
                transform: translate(-50%, -50%);
                animation: realisticSupernovaExplosion 2.5s ease-out ${delay}s forwards;
            `;
            
            particle.style.setProperty('--angle', angle + 'rad');
            particle.style.setProperty('--distance', distance + 'px');
            particle.style.setProperty('--speed', speed);
            
            explosionContainer.appendChild(particle);
        }
    });
    
    // Create multiple shockwave rings with different properties
    const shockwaveRings = [
        { size: 600, duration: 1.2, opacity: 0.9, color: 'rgba(255, 255, 255, 0.9)' },
        { size: 800, duration: 1.5, opacity: 0.7, color: 'rgba(255, 255, 255, 0.7)' },
        { size: 1000, duration: 1.8, opacity: 0.5, color: 'rgba(255, 255, 255, 0.5)' },
        { size: 1200, duration: 2.1, opacity: 0.3, color: 'rgba(255, 255, 255, 0.3)' }
    ];
    
    shockwaveRings.forEach((ring, index) => {
        const shockwave = document.createElement('div');
        shockwave.style.cssText = `
            position: absolute;
            left: ${centerX}px;
            top: ${centerY}px;
            width: 0;
            height: 0;
            border: 2px solid ${ring.color};
            border-radius: 50%;
            pointer-events: none;
            z-index: 10008;
            transform: translate(-50%, -50%);
            animation: realisticShockwaveRing ${ring.duration}s ease-out ${index * 0.1}s forwards;
        `;
        
        shockwave.style.setProperty('--max-size', ring.size + 'px');
        shockwave.style.setProperty('--opacity', ring.opacity);
        
        explosionContainer.appendChild(shockwave);
    });
    
    // Create energy waves with different colors
    const energyWaves = [
        { color: 'rgba(255, 165, 0, 0.8)', size: 500, duration: 1.0 },
        { color: 'rgba(255, 255, 0, 0.6)', size: 700, duration: 1.3 },
        { color: 'rgba(255, 200, 0, 0.7)', size: 900, duration: 1.6 }
    ];
    
    energyWaves.forEach((wave, index) => {
        const energyWave = document.createElement('div');
        energyWave.style.cssText = `
            position: absolute;
            left: ${centerX}px;
            top: ${centerY}px;
            width: 0;
            height: 0;
            border: 3px solid ${wave.color};
            border-radius: 50%;
            pointer-events: none;
            z-index: 10009;
            transform: translate(-50%, -50%);
            animation: realisticEnergyWave ${wave.duration}s ease-out ${index * 0.2}s forwards;
        `;
        
        energyWave.style.setProperty('--max-size', wave.size + 'px');
        
        explosionContainer.appendChild(energyWave);
    });
    
    // Create debris field
    for (let i = 0; i < 40; i++) {
        const debris = document.createElement('div');
        const angle = (Math.PI * 2 * i) / 40;
        const distance = 200 + Math.random() * 400;
        const size = 1 + Math.random() * 3;
        const delay = 0.2 + Math.random() * 0.5;
        
        debris.style.cssText = `
            position: absolute;
            left: ${centerX}px;
            top: ${centerY}px;
            width: ${size}px;
            height: ${size}px;
            background: rgba(255, 255, 255, 0.6);
            border-radius: 50%;
            pointer-events: none;
            z-index: 10010;
            transform: translate(-50%, -50%);
            animation: debrisField 3s ease-out ${delay}s forwards;
        `;
        
        debris.style.setProperty('--angle', angle + 'rad');
        debris.style.setProperty('--distance', distance + 'px');
        
        explosionContainer.appendChild(debris);
    }
    
    // Clean up flash overlay
    setTimeout(() => {
        if (initialFlash.parentNode) {
            initialFlash.parentNode.removeChild(initialFlash);
        }
    }, 300);
    
    // Clean up explosion elements but keep black background
    setTimeout(() => {
        if (supernovaCore.parentNode) {
            supernovaCore.parentNode.removeChild(supernovaCore);
        }
        // Keep explosionContainer for black background until video starts
    }, 3000);
    
    // Add enhanced CSS animations
    if (!document.getElementById('realistic-supernova-animations')) {
        const style = document.createElement('style');
        style.id = 'realistic-supernova-animations';
        style.textContent = `
            @keyframes supernovaCore {
                0% {
                    width: 0;
                    height: 0;
                    opacity: 0;
                }
                50% {
                    width: 200px;
                    height: 200px;
                    opacity: 1;
                }
                100% {
                    width: 400px;
                    height: 400px;
                    opacity: 0;
                }
            }
            
            @keyframes initialFlash {
                0% {
                    opacity: 0;
                }
                50% {
                    opacity: 1;
                }
                100% {
                    opacity: 0;
                }
            }
            
            @keyframes realisticSupernovaExplosion {
                0% {
                    transform: translate(-50%, -50%) scale(0);
                    opacity: 1;
                }
                10% {
                    opacity: 1;
                }
                100% {
                    transform: translate(-50%, -50%) scale(1) translate(
                        calc(cos(var(--angle)) * var(--distance)),
                        calc(sin(var(--angle)) * var(--distance))
                    );
                    opacity: 0;
                }
            }
            
            @keyframes realisticShockwaveRing {
                0% {
                    width: 0;
                    height: 0;
                    opacity: var(--opacity);
                    border-width: 3px;
                }
                50% {
                    opacity: calc(var(--opacity) * 0.8);
                }
                100% {
                    width: var(--max-size);
                    height: var(--max-size);
                    opacity: 0;
                    border-width: 1px;
                }
            }
            
            @keyframes realisticEnergyWave {
                0% {
                    width: 0;
                    height: 0;
                    opacity: 1;
                }
                50% {
                    opacity: 0.8;
                }
                100% {
                    width: var(--max-size);
                    height: var(--max-size);
                    opacity: 0;
                }
            }
            
            @keyframes debrisField {
                0% {
                    transform: translate(-50%, -50%) scale(0);
                    opacity: 1;
                }
                20% {
                    opacity: 1;
                }
                100% {
                    transform: translate(-50%, -50%) scale(1) translate(
                        calc(cos(var(--angle)) * var(--distance)),
                        calc(sin(var(--angle)) * var(--distance))
                    );
                    opacity: 0;
                }
            }
        `;
        document.head.appendChild(style);
    }
    
    // Store reference for cleanup
    window.supernovaExplosionContainer = explosionContainer;
}

// Transition to main site (only called after video ends)
function transitionToMainSite() {
    const videoIntro = document.getElementById('videoIntro');
    const audioBtn = document.getElementById('playAudioBtn');
    
    if (videoIntro) {
        // Starting transition to main site
        videoIntro.style.opacity = '0';
        videoIntro.style.transition = 'opacity 1s ease-in-out';
        
        setTimeout(() => {
            videoIntro.style.display = 'none';
            // Transition to main site complete
        }, 1000);
    }
}

// Start audio on first user interaction (fallback)
function startAudioOnInteraction() {
    const backgroundAudio = document.getElementById('backgroundAudio');
    const audioBtn = document.getElementById('playAudioBtn');
    
    if (backgroundAudio && audioBtn && backgroundAudio.paused) {
        backgroundAudio.play().then(() => {
            audioBtn.innerHTML = '<i class="fas fa-volume-up"></i><span>Audio On</span>';
            audioBtn.classList.add('playing');
        }).catch((error) => {
            // Audio failed on interaction
        });
    }
}

// Initialize initiate sequence
document.addEventListener('DOMContentLoaded', function() {
    initInitiateSequence();
    initVideoLazyLoading();
});

// Listen for user interactions to start audio (fallback)
document.addEventListener('click', startAudioOnInteraction, { once: true });
document.addEventListener('mousedown', startAudioOnInteraction, { once: true });
document.addEventListener('keydown', startAudioOnInteraction, { once: true });
document.addEventListener('touchstart', startAudioOnInteraction, { once: true });

// Global function to show section - accessible from anywhere
function showSection(sectionId) {
    
    // Find elements fresh each time to avoid scope issues
    const contentSections = document.querySelectorAll('.content-section');
    const navTabs = document.querySelectorAll('.nav-tab');

        // Hide all sections
        contentSections.forEach(section => {
            section.classList.remove('active');
        });

        // Remove active class from all nav tabs
        navTabs.forEach(tab => {
            tab.classList.remove('active');
        });

        // Show target section
        const targetSection = document.getElementById(sectionId);
        if (targetSection) {
            targetSection.classList.add('active');
    } else {
        console.error('❌ Section not found:', sectionId);
        }

        // Add active class to clicked nav tab
        const activeTab = document.querySelector(`[data-section="${sectionId}"]`);
        if (activeTab) {
            activeTab.classList.add('active');
    }
    }

// Navigation functionality
document.addEventListener('DOMContentLoaded', function() {
    const navTabs = document.querySelectorAll('.nav-tab');
    const contentSections = document.querySelectorAll('.content-section');

    // Add click event listeners to nav tabs
    navTabs.forEach(tab => {
        tab.addEventListener('click', function(e) {
            e.preventDefault();
            const sectionId = this.getAttribute('data-section');
            showSection(sectionId);
        });
    });

    // Add smooth scrolling for anchor links
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function (e) {
            e.preventDefault();
            const targetId = this.getAttribute('href').substring(1);
            showSection(targetId);
        });
    });

    // Simple project link handling - just let links work naturally
    document.querySelectorAll('.project-link').forEach(link => {
        link.addEventListener('click', function(e) {
            // Let the link work normally - no interference
        });
    });

    // Initialize with About section
    showSection('about');
    
    // Update data-section attributes for portfolio
    const portfolioTab = document.querySelector('[data-section="portfolio"]');
    if (portfolioTab) {
        portfolioTab.setAttribute('data-section', 'portfolio');
    }
});

// Enhanced interactive effects
document.addEventListener('DOMContentLoaded', function() {
    // Add hover effects to cards
    const cards = document.querySelectorAll('.experience-card, .project-card, .education-card, .contact-card');
    
    cards.forEach(card => {
        card.addEventListener('mouseenter', function() {
            this.style.transform = 'translateY(-8px) scale(1.02)';
            this.style.boxShadow = '0 15px 35px rgba(0, 212, 255, 0.3)';
        });
        
        card.addEventListener('mouseleave', function() {
            this.style.transform = 'translateY(0) scale(1)';
            this.style.boxShadow = 'none';
        });
    });

    // Add typing effect to the name
    const nameElement = document.querySelector('.name');
    if (nameElement) {
        const text = nameElement.textContent;
        nameElement.textContent = '';
        
        let i = 0;
        const typeWriter = () => {
            if (i < text.length) {
                nameElement.textContent += text.charAt(i);
                i++;
                setTimeout(typeWriter, 60);
            }
        };
        
        // Start typing effect after a short delay
        setTimeout(typeWriter, 500);
    }

    // Add parallax effect to background
    window.addEventListener('scroll', function() {
        const scrolled = window.pageYOffset;
        const parallax = document.querySelector('.container');
        const speed = scrolled * 0.3;
        
        if (parallax) {
            parallax.style.transform = `translateY(${speed}px)`;
        }
    });

    // Add enhanced glow effect to logo on hover
    const logo = document.querySelector('.logo');
    if (logo) {
        logo.addEventListener('mouseenter', function() {
            this.style.boxShadow = '0 0 50px rgba(0, 212, 255, 0.8), inset 0 0 30px rgba(255, 69, 0, 0.6)';
        });
        
        logo.addEventListener('mouseleave', function() {
            this.style.boxShadow = '0 0 40px rgba(0, 212, 255, 0.6), inset 0 0 30px rgba(255, 69, 0, 0.4)';
        });
    }

    // Add keyboard navigation
    document.addEventListener('keydown', function(e) {
        const activeTab = document.querySelector('.nav-tab.active');
        const tabs = Array.from(document.querySelectorAll('.nav-tab'));
        const currentIndex = tabs.indexOf(activeTab);
        
        if (e.key === 'ArrowRight' || e.key === 'ArrowDown') {
            e.preventDefault();
            const nextIndex = (currentIndex + 1) % tabs.length;
            tabs[nextIndex].click();
        } else if (e.key === 'ArrowLeft' || e.key === 'ArrowUp') {
            e.preventDefault();
            const prevIndex = currentIndex === 0 ? tabs.length - 1 : currentIndex - 1;
            tabs[prevIndex].click();
        }
    });

    // Add scroll to top button
    const scrollToTopBtn = document.createElement('button');
    scrollToTopBtn.innerHTML = '<i class="fas fa-arrow-up"></i>';
    scrollToTopBtn.style.cssText = `
        position: fixed;
        bottom: 30px;
        right: 30px;
        width: 50px;
        height: 50px;
        background: rgba(0, 212, 255, 0.2);
        border: 2px solid rgba(0, 212, 255, 0.5);
        border-radius: 50%;
        color: #00d4ff;
        font-size: 1.2rem;
        cursor: pointer;
        z-index: 1000;
        opacity: 0;
        transition: all 0.3s ease;
        backdrop-filter: blur(10px);
    `;
    
    document.body.appendChild(scrollToTopBtn);
    
    // Show/hide scroll to top button
    window.addEventListener('scroll', function() {
        if (window.pageYOffset > 300) {
            scrollToTopBtn.style.opacity = '1';
        } else {
            scrollToTopBtn.style.opacity = '0';
        }
    });
    
    // Scroll to top functionality
    scrollToTopBtn.addEventListener('click', function() {
        window.scrollTo({
            top: 0,
            behavior: 'smooth'
        });
    });

    // Add particle effects
    function createParticle() {
        const particle = document.createElement('div');
        particle.style.cssText = `
            position: fixed;
            width: 4px;
            height: 4px;
            background: rgba(0, 212, 255, 0.6);
            border-radius: 50%;
            pointer-events: none;
            z-index: 1;
            animation: particleFloat 6s linear infinite;
        `;
        
        particle.style.left = Math.random() * window.innerWidth + 'px';
        particle.style.top = window.innerHeight + 'px';
        
        document.body.appendChild(particle);
        
        setTimeout(() => {
            if (particle.parentNode) {
                particle.parentNode.removeChild(particle);
            }
        }, 6000);
    }
    
    // Create particles periodically
    setInterval(createParticle, 2000);
    
    // Add CSS for particle animation
    const style = document.createElement('style');
    style.textContent = `
        @keyframes particleFloat {
            0% {
                transform: translateY(0) rotate(0deg);
                opacity: 1;
            }
            100% {
                transform: translateY(-100vh) rotate(360deg);
                opacity: 0;
            }
        }
    `;
    document.head.appendChild(style);

    // Add contact link click handlers
    document.querySelectorAll('.contact-link').forEach(link => {
        link.addEventListener('click', function(e) {
            const href = this.getAttribute('href');
            const linkText = this.textContent;
            
            // Show notification
            const notification = document.createElement('div');
            notification.style.cssText = `
                position: fixed;
                top: 20px;
                right: 20px;
                background: rgba(0, 212, 255, 0.9);
                color: white;
                padding: 1rem 2rem;
                border-radius: 8px;
                font-family: 'Orbitron', sans-serif;
                font-weight: 300;
                z-index: 1000;
                box-shadow: 0 0 20px rgba(0, 212, 255, 0.5);
                transform: translateX(100%);
                transition: transform 0.3s ease;
            `;
            notification.textContent = `Opening: ${linkText}`;
            document.body.appendChild(notification);
            
            // Animate in
            setTimeout(() => {
                notification.style.transform = 'translateX(0)';
            }, 100);
            
            // Remove after 3 seconds
            setTimeout(() => {
                notification.style.transform = 'translateX(100%)';
                setTimeout(() => {
                    if (document.body.contains(notification)) {
                        document.body.removeChild(notification);
                    }
                }, 300);
            }, 3000);
        });
    });

    // Add photo placeholder click handlers
    document.querySelectorAll('.photo-placeholder').forEach(placeholder => {
        placeholder.addEventListener('click', function() {
            const input = document.createElement('input');
            input.type = 'file';
            input.accept = 'image/*';
            input.style.display = 'none';
            
            input.addEventListener('change', function(e) {
                const file = e.target.files[0];
                if (file) {
                    const reader = new FileReader();
                    reader.onload = function(e) {
                        placeholder.innerHTML = `<img src="${e.target.result}" style="width: 100%; height: 100%; object-fit: cover; border-radius: 12px;">`;
                    };
                    reader.readAsDataURL(file);
                }
            });
            
            document.body.appendChild(input);
            input.click();
            document.body.removeChild(input);
        });
    });
});

// Smooth scrolling utility
const smoothScroll = (target) => {
    const element = document.querySelector(target);
    if (element) {
        element.scrollIntoView({
            behavior: 'smooth',
            block: 'start'
        });
    }
};

// Scroll to top utility
const scrollToTop = () => {
    window.scrollTo({
        top: 0,
        behavior: 'smooth'
    });
}; 

// Speech synthesis state
let speechEnabled = true;













// Function to list all available voices
function listAvailableVoices() {
    if ('speechSynthesis' in window) {
        const voices = window.speechSynthesis.getVoices();
        return voices;
    }
    return [];
}

// Initialize when page loads
document.addEventListener('DOMContentLoaded', function() {
    // List available voices
    listAvailableVoices();
    
    // Initialize clickable entries with typing effect
    initClickableEntries();
    
    // Initialize mobile navigation
    initMobileNavigation();
});

// Clickable Entries with Typing Effect
// Global variables for speech control
let currentSpeechUtterance = null;
let isCurrentlySpeaking = false;

// Function to stop all speech
function stopAllSpeech() {
    if ('speechSynthesis' in window) {
        window.speechSynthesis.cancel();
        window.speechSynthesis.pause();
        window.speechSynthesis.resume();
        
        // Force stop by speaking and immediately cancelling a dummy utterance
        const dummyUtterance = new SpeechSynthesisUtterance('');
        window.speechSynthesis.speak(dummyUtterance);
        window.speechSynthesis.cancel();
        
    }
    currentSpeechUtterance = null;
    isCurrentlySpeaking = false;
}

function initClickableEntries() {
    const clickableEntries = document.querySelectorAll('.clickable-entry');
    
    clickableEntries.forEach(entry => {
        const header = entry.querySelector('.entry-header');
        const content = entry.querySelector('.entry-content');
        const typingText = entry.querySelector('.typing-text');
        const clickIndicator = entry.querySelector('.click-indicator');
        const fullContent = entry.getAttribute('data-content');
        
        if (!fullContent) return;
        
        // Initially hide content
        content.style.display = 'none';
        
        // Add click event to the chevron specifically
        clickIndicator.addEventListener('click', function(e) {
            e.stopPropagation(); // Prevent header click from firing
            
            const isExpanded = entry.classList.contains('expanded');
            
            if (!isExpanded) {
                // Stop any existing speech first
                stopAllSpeech();
                
                // Expand and start typing
                entry.classList.add('expanded');
                content.style.display = 'block';
                
                // Update chevron to point up
                const chevron = clickIndicator.querySelector('i');
                chevron.className = 'fas fa-chevron-up';
                
                // Check if this is a category (timeline-category, experience-category, or project-category) - do speech for categories
                if (entry.classList.contains('timeline-category') || entry.classList.contains('experience-category') || entry.classList.contains('project-category')) {
                    // For categories, say only the category title
                    if ('speechSynthesis' in window && speechEnabled) {
                        const categoryTitle = entry.querySelector('.category-title');
                        if (categoryTitle) {
                            const speechSynth = window.speechSynthesis;
                            const speechUtterance = new SpeechSynthesisUtterance(categoryTitle.textContent);
                            speechUtterance.rate = 0.8;
                            speechUtterance.pitch = 0.8;
                            speechUtterance.volume = 1.0;
                            
                            // Set voice
                            const voices = speechSynth.getVoices();
                            const trinoidsVoice = voices.find(voice => voice.name.includes('Trinoids'));
                            if (trinoidsVoice) {
                                speechUtterance.voice = trinoidsVoice;
                            }
                            
                            speechSynth.speak(speechUtterance);
                        }
                    }
                    return;
                }
                
                // For experience cards, do speech for job titles but no typing
                if (entry.classList.contains('experience-card')) {
                    // Get the job title from the header
                    const jobTitle = entry.querySelector('.entry-header h4');
                    if (jobTitle && 'speechSynthesis' in window && speechEnabled) {
                        const speechSynth = window.speechSynthesis;
                        const speechUtterance = new SpeechSynthesisUtterance(jobTitle.textContent);
                        speechUtterance.rate = 0.8;
                        speechUtterance.pitch = 0.8;
                        speechUtterance.volume = 1.0;
                        
                        // Set voice
                        const voices = speechSynth.getVoices();
                        const trinoidsVoice = voices.find(voice => voice.name.includes('Trinoids'));
                        if (trinoidsVoice) {
                            speechUtterance.voice = trinoidsVoice;
                        }
                                        
                                        speechSynth.speak(speechUtterance);
                                    }
                    
                    // Show content immediately without typing
                    const bulletsList = content.querySelector('.experience-bullets');
                    if (bulletsList) {
                        // Show all bullet points immediately
                        const bullets = bulletsList.querySelectorAll('li');
                        bullets.forEach(bullet => {
                            bullet.style.opacity = '1';
                        });
                    }
                    return;
                }
                
                // For project cards, do speech for project titles but no typing
                if (entry.classList.contains('project-card')) {
                    // Get the project title from the header
                    const projectTitle = entry.querySelector('.entry-header h4');
                    if (projectTitle && 'speechSynthesis' in window && speechEnabled) {
                        const speechSynth = window.speechSynthesis;
                        const speechUtterance = new SpeechSynthesisUtterance(projectTitle.textContent);
                        speechUtterance.rate = 0.8;
                        speechUtterance.pitch = 0.8;
                        speechUtterance.volume = 1.0;
                        
                        // Set voice
                        const voices = speechSynth.getVoices();
                        const trinoidsVoice = voices.find(voice => voice.name.includes('Trinoids'));
                        if (trinoidsVoice) {
                            speechUtterance.voice = trinoidsVoice;
                        }
                        
                        speechSynth.speak(speechUtterance);
                    }
                    
                    // Show content immediately without typing
                    const bulletsList = content.querySelector('.experience-bullets');
                    if (bulletsList) {
                        // Show all bullet points immediately
                        const bullets = bulletsList.querySelectorAll('li');
                        bullets.forEach(bullet => {
                            bullet.style.opacity = '1';
                        });
                    }
                    return;
                }
                
                // Only start typing if there's a typing-text element (mission statement)
                if (typingText) {
                    // Clear any existing text and cursor
                    typingText.innerHTML = '';
                    // DON'T start typing effect - just show the content immediately
                    typingText.textContent = fullContent;
                    
                    // Say "Mission Statement" when clicked
                    if ('speechSynthesis' in window && speechEnabled) {
                        const speechSynth = window.speechSynthesis;
                        const speechUtterance = new SpeechSynthesisUtterance('Mission Statement');
                        speechUtterance.rate = 0.8;
                        speechUtterance.pitch = 0.8;
                        speechUtterance.volume = 1.0;
                        
                        // Set voice
                        const voices = speechSynth.getVoices();
                        const trinoidsVoice = voices.find(voice => voice.name.includes('Trinoids'));
                        if (trinoidsVoice) {
                            speechUtterance.voice = trinoidsVoice;
                        }
                        
                        speechSynth.speak(speechUtterance);
                    }
                } else {
                    // For experience cards and project cards, show content immediately without typing
                    const bulletsList = content.querySelector('.experience-bullets');
                    if (bulletsList && (entry.classList.contains('experience-card') || entry.classList.contains('project-card'))) {
                        // Show all bullet points immediately
                        const bullets = bulletsList.querySelectorAll('li');
                        bullets.forEach(bullet => {
                            bullet.style.opacity = '1';
                        });
                    }
                }
                
            } else {
                // Stop speech
                stopAllSpeech();
                
                // Collapse
                entry.classList.remove('expanded');
                content.style.display = 'none';
                
                // Update chevron to point down
                const chevron = clickIndicator.querySelector('i');
                chevron.className = 'fas fa-chevron-down';
                
                if (typingText) {
                    typingText.innerHTML = '';
                }
            }
        });
        
        // Keep the header click as a fallback
        header.addEventListener('click', function(e) {
            // Only trigger if chevron wasn't clicked
            if (e.target.closest('.click-indicator')) return;
            
            const isExpanded = entry.classList.contains('expanded');
            
            if (!isExpanded) {
                // Stop any existing speech first
                stopAllSpeech();
                
                // Expand and start typing
                entry.classList.add('expanded');
                content.style.display = 'block';
                
                // Update chevron to point up
                const chevron = clickIndicator.querySelector('i');
                chevron.className = 'fas fa-chevron-up';
                
                // Check if this is a category (timeline-category, experience-category, or project-category) - do speech for categories
                if (entry.classList.contains('timeline-category') || entry.classList.contains('experience-category') || entry.classList.contains('project-category')) {
                    // For categories, do speech but no typing
                                    if ('speechSynthesis' in window && speechEnabled) {
                                        const speechSynth = window.speechSynthesis;
                        const speechUtterance = new SpeechSynthesisUtterance(fullContent);
                        speechUtterance.rate = 0.8;
                        speechUtterance.pitch = 0.8;
                                        speechUtterance.volume = 1.0;
                                        
                                        // Set voice
                                        const voices = speechSynth.getVoices();
                                        const trinoidsVoice = voices.find(voice => voice.name.includes('Trinoids'));
                                        if (trinoidsVoice) {
                                            speechUtterance.voice = trinoidsVoice;
                                        }
                                        
                                        speechSynth.speak(speechUtterance);
                                    }
                    return;
                }
                
                // Only start typing if there's a typing-text element (header click)
                if (typingText) {
                    // Clear any existing text and cursor
                    typingText.innerHTML = '';
                    // DON'T start typing effect - just show the content immediately
                    typingText.textContent = fullContent;
                    
                    // Say "Mission Statement" when clicked
                    if ('speechSynthesis' in window && speechEnabled) {
                        const speechSynth = window.speechSynthesis;
                        const speechUtterance = new SpeechSynthesisUtterance('Mission Statement');
                        speechUtterance.rate = 0.8;
                        speechUtterance.pitch = 0.8;
                        speechUtterance.volume = 1.0;
                        
                        // Set voice
                        const voices = speechSynth.getVoices();
                        const trinoidsVoice = voices.find(voice => voice.name.includes('Trinoids'));
                        if (trinoidsVoice) {
                            speechUtterance.voice = trinoidsVoice;
                        }
                        
                        speechSynth.speak(speechUtterance);
                    }
                } else {
                    // For experience cards and project cards, show content immediately without typing
                    const bulletsList = content.querySelector('.experience-bullets');
                    if (bulletsList && (entry.classList.contains('experience-card') || entry.classList.contains('project-card'))) {
                        // Show all bullet points immediately
                        const bullets = bulletsList.querySelectorAll('li');
                        bullets.forEach(bullet => {
                            bullet.style.opacity = '1';
                        });
                    }
                }
                
            } else {
                // Stop speech
                stopAllSpeech();
                
                // Collapse
                entry.classList.remove('expanded');
                content.style.display = 'none';
                
                // Update chevron to point down
                const chevron = clickIndicator.querySelector('i');
                chevron.className = 'fas fa-chevron-down';
                
                if (typingText) {
                    typingText.innerHTML = '';
                }
            }
        });
    });
}



// Typing effect function WITHOUT speech synthesis (for Mission Statement)
function typeTextWithoutSpeech(element, text, speed = 80) {
    let i = 0;
    const cursor = document.createElement('span');
    cursor.className = 'typing-cursor';
    element.appendChild(cursor);
    
    function type() {
        if (i < text.length) {
            element.insertBefore(document.createTextNode(text.charAt(i)), cursor);
            i++;
            
            // Play typing sound for each character with variation
            if (i % 2 === 0) { // Play sound every 2 characters for more realistic typing
                playTypingSound();
            }
            
            // Continue typing
            setTimeout(type, speed);
        } else {
            // Remove cursor when done
            if (cursor.parentNode) {
                cursor.parentNode.removeChild(cursor);
            }
        }
    }
    
    // Start typing
    type();
}

// Typing effect function with speech synthesis
function typeText(element, text, speed = 80) { // Slower speed to match speech
    let i = 0;
    const cursor = document.createElement('span');
    cursor.className = 'typing-cursor';
    element.appendChild(cursor);
    
    // Initialize speech synthesis
    let speechSynth = null;
    let speechUtterance = null;
    let speechStartTime = null;
    let speechDuration = null;
    
    // Check if speech synthesis is available and enabled
    if ('speechSynthesis' in window && speechEnabled) {
        speechSynth = window.speechSynthesis;
        
        // Use natural Trinoids text - no artificial processing
        let trinoidsText = text;
        
        // Create speech utterance with deeper voice and slower rate for dynamic adjustment
        speechUtterance = new SpeechSynthesisUtterance(trinoidsText);
        speechUtterance.rate = 0.5; // Even slower rate to give typing time to catch up
        speechUtterance.pitch = 0.6; // Deeper voice (lower pitch)
        speechUtterance.volume = 1.0; // Full volume
        
        // Wait for voices to load if needed
        const setVoice = () => {
            const voices = speechSynth.getVoices();
            if (voices.length > 0) {
                // Only use voices that include 'Trinoids' in the name
                const trinoidsVoice = voices.find(voice => 
                    voice.name.includes('Trinoids')
                );
                
                if (trinoidsVoice) {
                    speechUtterance.voice = trinoidsVoice;
                } else {
                    // No Trinoids voice found, using default
                }
                
                // Add dynamic Trinoids voice processing
                speechUtterance.onstart = () => {
                    isCurrentlySpeaking = true;
                    currentSpeechUtterance = speechUtterance;
                    speechStartTime = Date.now();
                };
                
                speechUtterance.onend = () => {
                    isCurrentlySpeaking = false;
                    currentSpeechUtterance = null;
                    speechDuration = Date.now() - speechStartTime;
                };
                
                speechUtterance.onerror = () => {
                    isCurrentlySpeaking = false;
                    currentSpeechUtterance = null;
                };
                
                // Start speech synthesis
                speechSynth.speak(speechUtterance);
            } else {
                // If voices aren't loaded yet, try again in 100ms
                setTimeout(setVoice, 100);
            }
        };
        
        setVoice();
    }
    
    function type() {
        if (i < text.length) {
            element.insertBefore(document.createTextNode(text.charAt(i)), cursor);
            i++;
            
            // Play typing sound for each character with variation
            if (i % 2 === 0) { // Play sound every 2 characters for more realistic typing
                playTypingSound();
            }
            
            // Calculate dynamic speed based on speech progress
            const progress = i / text.length;
            const expectedTime = speechDuration ? (speechDuration * progress) : (80 * i);
            const actualTime = Date.now() - speechStartTime;
            
            // Adjust typing speed to match speech timing - make typing faster to keep up
            let typingSpeed = 80; // Faster default speed
            if (speechDuration && speechStartTime) {
                const timeDiff = expectedTime - actualTime;
                if (timeDiff < -100) { // If typing is more than 100ms behind speech
                    typingSpeed = 60; // Speed up typing significantly
                } else if (timeDiff > 100) { // If typing is more than 100ms ahead
                    typingSpeed = 100; // Slow down typing
                } else {
                    typingSpeed = 80; // Normal speed
                }
            }
            
            const speedVariation = typingSpeed + (Math.random() - 0.5) * 10; // Slightly more variation
            setTimeout(type, speedVariation);
        } else {
            // Remove cursor when typing is complete
            cursor.remove();
            
            // Don't stop speech - let it finish naturally
            // This prevents the mid-speech stopping issue
        }
    }
    
    type();
}

// Simple typing sound effect (no audio processing)
function playTypingSound() {
    // Simple console log for typing sound (no audio processing)
}

// Mobile Navigation Functionality
function toggleMobileNav(element) {
    
    const navTree = element.closest('.mobile-nav-tree');
    
    if (navTree) {
        const wasActive = navTree.classList.contains('active');
        navTree.classList.toggle('active');
        const isNowActive = navTree.classList.contains('active');
        
    } else {
        console.error('❌ Could not find mobile nav tree for element:', element);
    }
}

// Initialize mobile navigation
function initMobileNavigation() {
    
    // Find mobile navigation elements
    const mobileNavMain = document.querySelectorAll('.mobile-nav-main');
    const mobileNavItems = document.querySelectorAll('.mobile-nav-item');
    
    // Add click functionality to mobile nav main button
    mobileNavMain.forEach((button, index) => {
        button.addEventListener('click', function(e) {
            e.preventDefault();
            e.stopPropagation();
            toggleMobileNav(this);
        });
    });
    
    // Add click functionality to mobile nav items
    mobileNavItems.forEach((item, index) => {
        item.addEventListener('click', function(e) {
            e.preventDefault();
            e.stopPropagation();
            
            const section = this.getAttribute('data-section');
            if (section) {
                // Hide mobile menu
                const navTree = this.closest('.mobile-nav-tree');
                navTree.classList.remove('active');
                
                // Show the corresponding section
                showSection(section);
                
                // Update active nav tab
                document.querySelectorAll('.nav-tab').forEach(tab => {
                    tab.classList.remove('active');
                });
                
                // Find and activate the corresponding desktop nav tab
                const desktopTab = document.querySelector(`[data-section="${section}"]`);
                if (desktopTab) {
                    desktopTab.classList.add('active');
                }
                
            }
        });
    });
    
    // Add click functionality to dropdown items
    document.querySelectorAll('.dropdown-item').forEach(item => {
        item.addEventListener('click', function(e) {
            e.preventDefault();
            const href = this.getAttribute('href');
            if (href && href.startsWith('#')) {
                const section = href.substring(1);
                showSection(section);
                
                // Update active nav tab
                document.querySelectorAll('.nav-tab').forEach(tab => {
                    tab.classList.remove('active');
                });
                
                // Find and activate the corresponding desktop nav tab
                const desktopTab = document.querySelector(`[data-section="${section}"]`);
                if (desktopTab) {
                    desktopTab.classList.add('active');
                }
                
            }
        });
    });
} 