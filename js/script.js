// Simple test to see if JavaScript is running
console.log('🧪 JavaScript file loaded successfully');

// --- Video & Asset Lazy Loading ---
function initLazyLoading() {
    // Target all videos that have the "lazy" class
    const lazyVideos = document.querySelectorAll("video.lazy");

    if ("IntersectionObserver" in window) {
        // Create a new observer
        let lazyVideoObserver = new IntersectionObserver(function(entries, observer) {
            entries.forEach(function(videoEntry) {
                // If the video is in the viewport
                if (videoEntry.isIntersecting) {
                    const video = videoEntry.target;
                    // Find all <source> tags within the video
                    for (const source of video.children) {
                        if (source.tagName === "SOURCE" && source.dataset.src) {
                            // Set the src from the data-src attribute
                            source.src = source.dataset.src;
                        }
                    }
                    // Load and play the video, then stop observing it
                    video.load();
                    const playPromise = video.play();
                    if (playPromise !== undefined) {
                        playPromise.catch(error => console.error("Lazy-load video play failed:", error));
                    }
                    video.classList.remove("lazy");
                    lazyVideoObserver.unobserve(video);
                    console.log('🎬 Lazy-loaded video:', video);
                }
            });
        });

        // Observe each lazy video
        lazyVideos.forEach(function(lazyVideo) {
            lazyVideoObserver.observe(lazyVideo);
        });
    }
}

// Background audio functionality
function initBackgroundAudio() {
    const backgroundAudio = document.getElementById('backgroundAudio');
    const audioBtn = document.getElementById('playAudioBtn');
    
    if (backgroundAudio && audioBtn) {
        // If we've already initialized the audio element, avoid re-calling load()/play()
        // This prevents restarting playback on PJAX navigation.
        if (backgroundAudio.dataset && backgroundAudio.dataset._initialized === 'true') {
            if (!backgroundAudio.paused) {
                audioBtn.innerHTML = '<i class="fas fa-volume-up"></i><span>Audio On</span>';
                audioBtn.classList.add('playing');
            } else {
                audioBtn.innerHTML = '<i class="fas fa-volume-mute"></i><span>Enable Audio</span>';
                audioBtn.classList.remove('playing');
            }
            return;
        }

        // Mark as initialized so subsequent calls are no-ops
        try { backgroundAudio.dataset._initialized = 'true'; } catch (e) {}

        // Set volume to a subtle level
        backgroundAudio.volume = 0.3; 
        // Ensure audio loops
        backgroundAudio.loop = true;

        // Persisted playback position key
        const _AUDIO_TIME_KEY = 'bk_audio_time';
        // Try to restore previous playback position if available
        try {
            const storedTime = parseFloat(localStorage.getItem(_AUDIO_TIME_KEY));
            if (!isNaN(storedTime) && storedTime > 0) {
                if (backgroundAudio.readyState > 0) {
                    backgroundAudio.currentTime = Math.min(storedTime, backgroundAudio.duration || storedTime);
                } else {
                    const setTime = function() {
                        try {
                            backgroundAudio.currentTime = Math.min(storedTime, backgroundAudio.duration || storedTime);
                        } catch (e) {}
                        backgroundAudio.removeEventListener('loadedmetadata', setTime);
                    };
                    backgroundAudio.addEventListener('loadedmetadata', setTime);
                }
            }
        } catch (e) {
            console.warn('Could not restore audio time from localStorage', e);
        }

        // Save playback position periodically (throttled)
        try {
            let _lastSavedAt = 0;
            backgroundAudio.addEventListener('timeupdate', function() {
                const now = Date.now();
                if (now - _lastSavedAt > 3000) { // every ~3s
                    try { localStorage.setItem(_AUDIO_TIME_KEY, String(backgroundAudio.currentTime)); } catch (e) {}
                    _lastSavedAt = now;
                }
            });

            // Also save on pause/unload to capture final position
            backgroundAudio.addEventListener('pause', function() {
                try { localStorage.setItem(_AUDIO_TIME_KEY, String(backgroundAudio.currentTime)); } catch (e) {}
            });
            window.addEventListener('beforeunload', function() {
                try { localStorage.setItem(_AUDIO_TIME_KEY, String(backgroundAudio.currentTime)); } catch (e) {}
            });
        } catch (e) {
            console.warn('Could not attach timeupdate listener for audio position', e);
        }
        
        // Audio control button functionality
        audioBtn.addEventListener('click', function() {
            console.log('🎵 Audio button clicked');
            if (backgroundAudio.paused) {
                backgroundAudio.play().then(() => {
                    audioBtn.innerHTML = '<i class="fas fa-volume-up"></i><span>Audio On</span>';
                    audioBtn.classList.add('playing');
                    // Persist user preference
                    try { localStorage.setItem('bk_audio_enabled', 'true'); } catch (e) {}
                    console.log('🎵 Background audio started successfully');
                }).catch(function(error) {
                    console.error('🎵 Background audio play failed:', error);
                    audioBtn.innerHTML = '<i class="fas fa-volume-mute"></i><span>Enable Audio</span>';
                    audioBtn.classList.remove('playing');
                });
            } else {
                backgroundAudio.pause();
                audioBtn.innerHTML = '<i class="fas fa-volume-mute"></i><span>Audio Off</span>';
                audioBtn.classList.remove('playing');
                // Persist user preference
                try { localStorage.setItem('bk_audio_enabled', 'false'); } catch (e) {}
                console.log('🔇 Background audio paused');
            }
        });

        // Ensure button shows muted state initially
        audioBtn.innerHTML = '<i class="fas fa-volume-mute"></i><span>Enable Audio</span>';
        audioBtn.classList.remove('playing');

        // If the user previously enabled audio, attempt to resume it now.
        try {
            const wasEnabled = localStorage.getItem('bk_audio_enabled') === 'true';
            if (wasEnabled) {
                // Ensure the audio element is loaded and try to play.
                backgroundAudio.load();
                backgroundAudio.play().then(() => {
                    audioBtn.innerHTML = '<i class="fas fa-volume-up"></i><span>Audio On</span>';
                    audioBtn.classList.add('playing');
                    console.log('🎵 Background audio resumed from previous page');
                }).catch((err) => {
                    console.warn('🎵 Could not auto-resume audio (browser may block autoplay):', err);
                });
            }
        } catch (e) {
            console.warn('🎵 localStorage unavailable:', e);
        }

        console.log('🎵 Background audio initialized');
    }
}

// Video intro functionality
function initVideoIntro() {
    const videoIntro = document.getElementById('videoIntro');
    const loadingProgress = document.querySelector('.loading-progress');
    
    if (videoIntro && introVideo) {
        let videoDuration = 0;
        let currentTime = 0;
        
        // Get video duration when metadata is loaded
        introVideo.addEventListener('loadedmetadata', function() {
            videoDuration = introVideo.duration;
            console.log('🎬 Video duration:', videoDuration, 'seconds');
            
            // Mobile fallback: if video doesn't end properly, force transition after duration
            setTimeout(() => {
                if (videoIntro.style.display !== 'none') {
                    console.log('🎬 Mobile timeout fallback: Forcing transition after video duration');
                    transitionToMainSite();
                }
            }, (videoDuration * 1000) + 1000); // Video duration + 1 second buffer
        });
        
        // Update loading bar based on video progress
        introVideo.addEventListener('timeupdate', function() {
            currentTime = introVideo.currentTime;
            const progress = (currentTime / videoDuration) * 100;
            if (loadingProgress) {
                loadingProgress.style.width = progress + '%';
            }
            
            // Transition to main site much earlier to avoid any freezing
            if (videoDuration > 0 && currentTime >= videoDuration - 2.0) {
                console.log('🎬 Transitioning to main site well before video ends');
                transitionToMainSite();
                // Remove the timeupdate listener to prevent multiple transitions
                introVideo.removeEventListener('timeupdate', arguments.callee);
                // Pause the video to prevent it from reaching the end
                introVideo.pause();
            }
        });
        
        // Handle video end - transition to main site (fallback)
        introVideo.addEventListener('ended', function() {
            console.log('🎬 Video intro ended (fallback transition)');
            // Only transition if not already done
            const videoIntro = document.getElementById('videoIntro');
            if (videoIntro && videoIntro.style.display !== 'none') {
            transitionToMainSite();
            }
        });
        
        // Mobile-specific debugging
        introVideo.addEventListener('error', function(e) {
            console.log('🎬 Video error on mobile:', e);
        });
        
        introVideo.addEventListener('stalled', function() {
            console.log('🎬 Video stalled on mobile');
        });
        
        introVideo.addEventListener('waiting', function() {
            console.log('🎬 Video waiting on mobile');
        });
        
        // Debug video loading
        introVideo.addEventListener('loadstart', function() {
            console.log('🎬 Video load started');
        });
        
        console.log('🎬 Video intro initialized');
    }
}

// Initiate Sequence functionality
function initInitiateSequence() {
    console.log('🔧 Initiate sequence function called');
    const initiateSequence = document.getElementById('initiateSequence');
    const videoIntro = document.getElementById('videoIntro');
    const introVideo = document.getElementById('introVideo');
    const backgroundAudio = document.getElementById('backgroundAudio');
    const audioBtn = document.getElementById('playAudioBtn');
    
    console.log('🔧 Initiate sequence elements found:', {
        initiateSequence: !!initiateSequence,
        videoIntro: !!videoIntro,
        introVideo: !!introVideo,
        backgroundAudio: !!backgroundAudio,
        audioBtn: !!audioBtn
    });
    
    if (initiateSequence) {
        // Add click handler to the flashing box
        const flashingBox = initiateSequence.querySelector('.flashing-box');
        console.log('🔧 Flashing box found:', !!flashingBox);
        
        if (flashingBox) {
            flashingBox.addEventListener('click', function() {
                // --- KEY CHANGE: Add class to body to prevent scrolling ---
                document.body.classList.add('intro-active');

                console.log('🚀 Initiate sequence clicked');
                
                // Change button text and add flashing red effect
                const sequenceText = flashingBox.querySelector('.sequence-text');
                if (sequenceText) {
                    sequenceText.textContent = 'System Activated';
                }
                
                // Add 'activated' class to apply styles from CSS
                flashingBox.classList.add('activated');

                // --- KEY CHANGE: Attempt to play audio on the first user click ---
                if (backgroundAudio && backgroundAudio.paused) {
                    backgroundAudio.load(); // Explicitly load the audio before playing
                    backgroundAudio.play().then(() => {
                        console.log('🎵 Audio playback started successfully.');
                        if (audioBtn) {
                            audioBtn.innerHTML = '<i class="fas fa-volume-up"></i><span>Audio On</span>';
                            audioBtn.classList.add('playing');
                        }
                    }).catch(error => {
                        console.error('🎵 Audio failed to play on initial click:', error);
                        if (audioBtn) {
                            audioBtn.innerHTML = '<i class="fas fa-exclamation-triangle"></i><span>Audio Error</span>';
                            audioBtn.disabled = true;
                        }
                    });
                }
                
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
                        flashingBox.classList.remove('activated');
                        
                        // Hide the initiate sequence immediately
                        initiateSequence.style.display = 'none';
                        
                        // Start video immediately after voice ends
                        console.log('🎬 Starting video immediately after voice ends');
                        startVideoSequence();
                    };
                    
                    speechSynth.speak(speechUtterance);
                } else {
                    // Fallback if speech synthesis not available
                    setTimeout(() => {
                        // Stop the blinking animation and hide the sequence
                        flashingBox.classList.remove('activated');
                        initiateSequence.style.display = 'none';
                        
                        startVideoSequence();
                    }, 3000); // 3 second fallback
                }
            });
        }
    }
}

// Start video sequence
function startVideoSequence() {
    const videoIntro = document.getElementById('videoIntro');
    const introVideo = document.getElementById('introVideo');
    const backgroundAudio = document.getElementById('backgroundAudio');
    const audioBtn = document.getElementById('playAudioBtn');
                
                // Show video intro
                if (videoIntro) {
                    console.log('🎬 Showing video intro');
                    videoIntro.style.display = 'block';
                    videoIntro.style.opacity = '1';
        videoIntro.style.visibility = 'visible';
        videoIntro.style.zIndex = '9999';
        
        // Mobile-specific debugging
        console.log('🎬 Video intro display:', videoIntro.style.display);
        console.log('🎬 Video intro opacity:', videoIntro.style.opacity);
        console.log('🎬 Video intro visibility:', videoIntro.style.visibility);
        console.log('🎬 Video intro z-index:', videoIntro.style.zIndex);
                } else {
                    console.log('❌ Video intro element not found');
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
            console.log('🎬 Video overlay made visible');
        }
                    
                    introVideo.play().then(() => {
                        console.log('🎬 Video started');
            
                    }).catch((error) => {
                        console.log('🎬 Video failed to start:', error);
                        // Fallback: if video fails, still show the main site
                        setTimeout(() => {
                            transitionToMainSite();
                        }, 1000);
                    });
        
        // Mobile fallback: ensure video intro is visible after a delay
        setTimeout(() => {
            if (videoIntro && videoIntro.style.display !== 'none') {
                console.log('🎬 Mobile fallback: Ensuring video intro is visible');
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

// Transition to main site (only called after video ends)
function transitionToMainSite() {
    const videoIntro = document.getElementById('videoIntro');
    const mainContainer = document.querySelector('.container');
    
    if (videoIntro && videoIntro.style.display !== 'none') {
        console.log('🎬 Starting transition to main site');
        
        // Fade out video intro
        videoIntro.classList.add('fade-out');
        // Redirect to the About page after the intro finishes so the site is separate pages
        setTimeout(() => {
            // Ensure any intro locks are removed
            document.body.classList.remove('intro-active');
            // Hide the intro overlay
            videoIntro.style.display = 'none';
            videoIntro.classList.remove('fade-out');
            // Reveal the main container if it was hidden during the intro
            try {
                if (mainContainer && mainContainer.classList.contains('site-hidden')) {
                    mainContainer.classList.remove('site-hidden');
                }
            } catch (e) {}
            // Persist current audio state so the next page can resume if needed
            try {
                const backgroundAudio = document.getElementById('backgroundAudio');
                if (backgroundAudio) {
                    const enabled = !backgroundAudio.paused;
                    localStorage.setItem('bk_audio_enabled', enabled ? 'true' : 'false');
                }
            } catch (e) {
                console.warn('Could not persist audio state before redirect', e);
            }
            console.log('🎬 Redirecting to About page');
            // Capture DOM state before transition (diagnostic)
            try { _captureDomSnapshot('before-transition'); } catch (e) {}

            if (typeof pjaxNavigate === 'function') {
                pjaxNavigate('about.html');
            } else {
                window.location.href = 'about.html';
            }
        }, 800);
    }
}

// Start audio on first user interaction (fallback)
function startAudioOnInteraction() {
    const backgroundAudio = document.getElementById('backgroundAudio');
    const audioBtn = document.getElementById('playAudioBtn');
    
    if (backgroundAudio && audioBtn && backgroundAudio.paused) {
        backgroundAudio.play().then(() => {
            console.log('🎵 Audio started on user interaction');
            audioBtn.innerHTML = '<i class="fas fa-volume-up"></i><span>Audio On</span>';
            audioBtn.classList.add('playing');
        }).catch((error) => {
            console.log('🎵 Audio failed on interaction:', error);
        });
    }
}

// --- Global State and Cached Elements ---
// Prevent re-initializing background audio on PJAX/navigation
let _backgroundAudioInitialized = false;
const AppState = {
    contentSections: null,
    navTabs: null
};

// Diagnostic helper: capture simple DOM + computed-style snapshot for debugging PJAX/layout issues
function _captureDomSnapshot(label, opts) {
    try {
        opts = opts || {};
        const header = document.querySelector('.header');
        const topNav = document.querySelector('.top-nav');
        const container = document.querySelector('.container');
        const main = document.querySelector('.main-content');
        const mobileNavItems = document.querySelectorAll('.mobile-nav-item');

        const snapshot = {
            label: label || 'snapshot',
            timestamp: Date.now(),
            counts: {
                header: !!header,
                topNav: !!topNav,
                container: !!container,
                main: !!main,
                mobileNavItems: mobileNavItems ? mobileNavItems.length : 0
            },
            styles: {}
        };

        const addStyles = (el, key) => {
            if (!el) return;
            const cs = window.getComputedStyle(el);
            snapshot.styles[key] = {
                display: cs.display,
                visibility: cs.visibility,
                position: cs.position,
                top: cs.top,
                zIndex: cs.zIndex,
                height: el.offsetHeight,
                width: el.offsetWidth
            };
        };

        addStyles(header, 'header');
        addStyles(topNav, 'topNav');
        addStyles(container, 'container');
        addStyles(main, 'main');

        // Store last snapshot for retrieval and log concise summary
        window.__lastPjaxSnapshot = snapshot;
        console.log('📦 PJAX Snapshot:', snapshot);

        // If requested, trigger a download of the snapshot as a JSON file.
        if (opts.download) {
            try {
                const filename = opts.filename || `pjax-snapshot-${snapshot.timestamp}.json`;
                const blob = new Blob([JSON.stringify(snapshot, null, 2)], {type: 'application/json'});
                const url = URL.createObjectURL(blob);
                const a = document.createElement('a');
                a.href = url;
                a.download = filename;
                // Append to DOM to make click work in some browsers
                document.body.appendChild(a);
                a.click();
                setTimeout(() => {
                    try { document.body.removeChild(a); } catch (e) {}
                    try { URL.revokeObjectURL(url); } catch (e) {}
                }, 100);
                console.log('📥 PJAX snapshot download started:', filename);
            } catch (e) {
                console.warn('Could not download snapshot:', e);
            }
        }
    } catch (e) {
        console.warn('Could not capture DOM snapshot:', e);
    }
}

document.addEventListener('DOMContentLoaded', function() {
    console.log('🚀 DOM Content Loaded - Starting initialization');

    // Cache DOM elements
    AppState.contentSections = document.querySelectorAll('.content-section');
    AppState.navTabs = document.querySelectorAll('.nav-tab');

    // Initialize all modules
    initVideoIntro();
    initBackgroundAudio();
    initInitiateSequence();
    initLazyLoading();
    initNavigation();
    initPjaxNavigation();
    initInteractiveEffects();
    initClickableEntries();
    initMobileNavigation();
    initHeaderNavLayout();
    listAvailableVoices();
});

// Central app initializer — idempotent; run on initial load and after PJAX loads
function initApp() {
    console.log('🔁 initApp: normalizing content and re-registering handlers');

    // Ensure background audio is initialized but not restarted
    try { initBackgroundAudio(); } catch (e) { console.warn('initBackgroundAudio in initApp failed:', e); }

    // Normalize sections: show only the relevant section inside .main-content
    try { hideOtherSections(); } catch (e) { console.warn('hideOtherSections failed:', e); }

    // Ensure layout recalculation after any DOM changes
    requestAnimationFrame(() => setTimeout(() => {
        try { initHeaderNavLayout && initHeaderNavLayout(); } catch (e) {}
        try { initMobileNavigation && initMobileNavigation(); } catch (e) {}
        try { window.dispatchEvent(new Event('resize')); } catch (e) {}
    }, 80));
}

// Hide other sections in .main-content so only the intended section shows
function hideOtherSections() {
    // Operate on all .content-section elements in the document to avoid
    // cases where sections exist outside .main-content after PJAX.
    const sections = Array.from(document.querySelectorAll('.content-section'));
    if (!sections || sections.length === 0) return;

    // Determine active section preference order:
    // 1. explicit .active class
    // 2. section whose id matches the current pathname (e.g., about.html -> #about)
    // 3. first section inside .main-content
    // 4. first section overall
    let active = sections.find(s => s.classList.contains('active'));
    if (!active) {
        const current = window.location.pathname.split('/').pop();
        if (current) {
            const expectedId = current.replace('.html', '') || null;
            if (expectedId) {
                const byId = sections.find(s => s.id === expectedId);
                if (byId) active = byId;
            }
        }
    }

    if (!active) {
        const main = document.querySelector('.main-content');
        if (main) active = Array.from(main.querySelectorAll('.content-section'))[0] || null;
    }
    if (!active) active = sections[0];

    console.log('hideOtherSections: chosen active section:', active && (active.id || active.className));

    sections.forEach(s => {
        if (s === active) {
            s.classList.remove('section-hidden');
            s.style.display = '';
        } else {
            s.classList.add('section-hidden');
            s.style.display = 'none';
        }
    });
}

// When PJAX completes, run app init
document.addEventListener('pjax:loaded', function(e) {
    console.log('ℹ️ pjax:loaded event received', e && e.detail ? e.detail : '');
    try { initApp(); } catch (err) { console.warn('initApp after pjax:loaded failed:', err); }
});

// Ensure header stays fixed and nav locks below it; content scrolls under nav
function initHeaderNavLayout() {
    const header = document.querySelector('.header');
    const topNav = document.querySelector('.top-nav');
    const main = document.querySelector('.main-content');
    if (!header || !topNav || !main) return;

    function applyLayout() {
        const headerH = header.offsetHeight;
        const navH = topNav.offsetHeight;

        // Let the header remain in normal flow so it will scroll off the page.
        header.style.position = '';
        header.style.top = '';
        header.style.left = '';
        header.style.right = '';
        header.style.zIndex = 1100;

        // Make the top navigation sticky so it will lock to the top once scrolled into place.
        // Sticky preserves layout space, so no layout jump is required.
        topNav.style.position = '-webkit-sticky';
        topNav.style.position = 'sticky';
        // match the console inset so the nav locks inside the console border
        topNav.style.top = '20px';
        topNav.style.left = '';
        topNav.style.right = '';
        topNav.style.zIndex = 1115;

        // Ensure the main content remains below the header/nav visually.
        main.style.marginTop = '';
        main.style.zIndex = 1;
    }

    // Run once and on resize
    applyLayout();
    window.addEventListener('resize', applyLayout);
}

// --- Navigation ---
function initNavigation() {
    // Nav tabs are now links to separate pages. Do not intercept clicks.
    // Mark the current nav tab active based on the current URL/pathname.
    try {
        const current = window.location.pathname.split('/').pop() || 'index.html';
        AppState.navTabs.forEach(t => t.classList.remove('active'));
        AppState.navTabs.forEach(tab => {
            const href = tab.getAttribute('href');
            if (!href) return;
            const hrefFile = href.split('/').pop();
            if (hrefFile === current || (current === '' && hrefFile === 'index.html')) {
                tab.classList.add('active');
            }
        });
    } catch (err) {
        console.warn('initNavigation: could not set active tab', err);
    }
}

// PJAX-style navigation: fetch page content and replace main container
function initPjaxNavigation() {
    // Intercept clicks on internal nav links to avoid full page reloads
    document.addEventListener('click', function(e) {
        if (e.defaultPrevented) return;
        if (e.button && e.button !== 0) return; // only left-click
        if (e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return; // allow modifier shortcuts

        const a = e.target.closest && e.target.closest('a');
        if (!a) return;

        const href = a.getAttribute('href') || '';
        if (!href || href.startsWith('#')) return; // ignore anchors

        // Ignore mailto/tel and external links
        if (href.startsWith('mailto:') || href.startsWith('tel:')) return;
        if (href.startsWith('http') && !href.startsWith(window.location.origin)) return;

        // Only intercept likely HTML internal navigations
        if (!href.endsWith('.html') && !href.endsWith('/') && !href.includes('.html#')) return;

        // Allow links that open in new tab or explicitly target a different browsing context
        if (a.target && a.target !== '' && a.target !== '_self') return;

        // Prevent default and perform AJAX navigation
        e.preventDefault();
        console.log('🔗 PJAX intercept click:', href);
        pjaxNavigate(href);
    });

    // Handle back/forward navigation
    window.addEventListener('popstate', function(ev) {
        const url = (ev.state && ev.state.url) || window.location.pathname.split('/').pop() || 'index.html';
        pjaxNavigate(url, {replace: true});
    });
}

async function pjaxNavigate(url, opts = {}) {
    const path = url;
    try {
        const response = await fetch(url, {credentials: 'same-origin'});
        if (!response.ok) {
            window.location.href = url; // fallback
            return;
        }

        const text = await response.text();
        const parser = new DOMParser();
        const doc = parser.parseFromString(text, 'text/html');

        // Remove any shell-level audio or header/nav elements that might exist in full-page
        // responses so we only extract the intended fragment.
        try { doc.querySelectorAll && doc.querySelectorAll('#backgroundAudio, header, .top-nav, nav, .container').forEach(n => n.remove()); } catch (e) {}

        // Prefer replacing only the main.content.frame-panel to preserve header/nav and mobile nav
        const newMain = doc.querySelector('main.main-content.frame-panel') || doc.querySelector('.main-content');
        const curMain = document.querySelector('main.main-content.frame-panel') || document.querySelector('.main-content');

        if (newMain && curMain) {
            // Remove any background audio elements from the fetched content
            try { newMain.querySelectorAll && newMain.querySelectorAll('#backgroundAudio').forEach(n => n.remove()); } catch (e) {}

            // Replace only the main content (keeps header/nav outside the replacement)
            // IMPORTANT: use replace, not append — overwrite existing main content.
            curMain.innerHTML = newMain.innerHTML;

            // Ensure the main container is visible (remove any intro hide class)
            try {
                const curContainer = document.querySelector('.container');
                if (curContainer && curContainer.classList.contains('site-hidden')) curContainer.classList.remove('site-hidden');
            } catch (e) {}

            // Update document title
            const newTitle = doc.querySelector('title');
            if (newTitle) document.title = newTitle.textContent;

            // Update active nav state
            // Re-cache app state (nav tabs / sections) to reflect injected content
            try {
                AppState.contentSections = document.querySelectorAll('.content-section');
                AppState.navTabs = document.querySelectorAll('.nav-tab');
            } catch (e) {}

            initNavigation();

            // Re-initialize interactive modules for the newly injected content
            initLazyLoading();
            initInteractiveEffects();
            initClickableEntries && initClickableEntries();
            initMobileNavigation && initMobileNavigation();
            initHeaderNavLayout && initHeaderNavLayout();

            // Re-initialize audio UI (does not recreate audio element)
            initBackgroundAudio();

            // Re-run only content-dependent initializers (accordions, reveals, scroll handlers, lazy media)
            try {
                initLazyLoading && initLazyLoading();
                initClickableEntries && initClickableEntries();
                // initInteractiveEffects contains both global and content-specific effects;
                // call only the parts that are content-dependent if available. For safety,
                // call the whole function only if it is written to be idempotent for globals.
                if (typeof initInteractiveEffects === 'function') {
                    try { initInteractiveEffects(); } catch (e) { console.warn('initInteractiveEffects error (non-fatal):', e); }
                }
            } catch (e) {
                console.warn('Error re-initializing content modules after PJAX:', e);
            }

            // Delay global layout initializers slightly to avoid race conditions with parsing/paint
            const _delayedReinit = () => {
                try {
                    initHeaderNavLayout && initHeaderNavLayout();
                } catch (e) { console.warn('initHeaderNavLayout error:', e); }
                try {
                    initMobileNavigation && initMobileNavigation();
                } catch (e) { console.warn('initMobileNavigation error:', e); }

                // Trigger a resize event so sticky positioning and height calculations recompute
                try { window.dispatchEvent(new Event('resize')); } catch (e) {}

                // Emit a custom event for other listeners
                try { document.dispatchEvent(new CustomEvent('pjax:loaded', {detail:{url:path}})); } catch (e) {}
            };

            // Use requestAnimationFrame + small timeout as a robust delay across browsers
            requestAnimationFrame(() => setTimeout(_delayedReinit, 80));

            // Capture DOM snapshot after injection (diagnostic)
            try { _captureDomSnapshot('after-inject'); } catch (e) {}

            // Push or replace history
            const path = url;
            if (opts.replace) {
                history.replaceState({url: path}, '', path);
            } else {
                history.pushState({url: path}, '', path);
            }

            // Scroll to top of new content
            window.scrollTo({top:0, behavior:'smooth'});
        } else {
            // If container not found, fallback to full navigation
            window.location.href = url;
        }
    } catch (err) {
        console.error('PJAX navigation failed, falling back to full load:', err);
        window.location.href = url;
    }
}

// Global function to show section - accessible from anywhere
function showSection(sectionId) {
    console.log('🔄 showSection called with:', sectionId);
    // New behavior: smooth-scroll to the section and mark nav tab active.
    const targetSection = document.getElementById(sectionId);
    if (targetSection) {
        targetSection.scrollIntoView({ behavior: 'smooth', block: 'start' });
        console.log('🔄 Scrolling to section:', sectionId);
    } else {
        console.error('❌ Section not found:', sectionId);
    }

    // Update only the nav active state (do not hide/show sections)
    if (AppState.navTabs) {
        AppState.navTabs.forEach(tab => tab.classList.remove('active'));
        const activeTab = document.querySelector(`.nav-tab[data-section="${sectionId}"]`);
        if (activeTab) activeTab.classList.add('active');
    }
}

// --- Enhanced Interactive Effects ---
function initInteractiveEffects() {
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

    // --- PARALLAX EFFECT REMOVED ---
    // The parallax effect was causing the scrolling glitch in Safari.
    // It has been removed to ensure a stable, cross-browser compatible experience.
    console.log('🚫 Parallax effect has been disabled to fix Safari rendering bugs.');

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
        const activeTab = document.querySelector('.nav-tab.active'); // This can stay as it changes
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
}

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
        console.log('=== AVAILABLE VOICES ===');
        voices.forEach((voice, index) => {
            console.log(`${index + 1}. ${voice.name} (${voice.lang}) - ${voice.localService ? 'Local' : 'Remote'}`);
        });
        console.log('=== END VOICES ===');
        return voices;
    }
    return [];
}

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
        
        console.log('🔇 ALL SPEECH STOPPED');
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
        
        console.log('🌿 DYNAMIC TRINOIDS VOICE CONFIGURED:', {
            rate: speechUtterance.rate,
            pitch: speechUtterance.pitch,
            volume: speechUtterance.volume,
            text: trinoidsText.substring(0, 100) + '...'
        });
        
        // Wait for voices to load if needed
        const setVoice = () => {
            const voices = speechSynth.getVoices();
            if (voices.length > 0) {
                // Log all available voices for debugging
                console.log('Available voices:', voices.map(v => `${v.name} (${v.lang})`));
                
                // Only use voices that include 'Trinoids' in the name
                const trinoidsVoice = voices.find(voice => 
                    voice.name.includes('Trinoids')
                );
                
                if (trinoidsVoice) {
                    speechUtterance.voice = trinoidsVoice;
                    console.log('🌿 TRINOIDS VOICE SELECTED:', trinoidsVoice.name);
                } else {
                    console.log('🌿 No Trinoids voice found, using default');
                }
                
                // Add dynamic Trinoids voice processing
                speechUtterance.onstart = () => {
                    isCurrentlySpeaking = true;
                    currentSpeechUtterance = speechUtterance;
                    speechStartTime = Date.now();
                    console.log('🌿 DYNAMIC TRINOIDS VOICE STARTED - Natural organic active!');
                    console.log('🌿 Voice settings:', {
                        rate: speechUtterance.rate,
                        pitch: speechUtterance.pitch,
                        volume: speechUtterance.volume
                    });
                };
                
                speechUtterance.onend = () => {
                    isCurrentlySpeaking = false;
                    currentSpeechUtterance = null;
                    speechDuration = Date.now() - speechStartTime;
                    console.log('🌿 Speech duration:', speechDuration + 'ms');
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
                    console.log('🚀 SPEEDING UP - Typing behind speech by', Math.abs(timeDiff), 'ms');
                } else if (timeDiff > 100) { // If typing is more than 100ms ahead
                    typingSpeed = 100; // Slow down typing
                    console.log('🐌 SLOWING DOWN - Typing ahead of speech by', timeDiff, 'ms');
                } else {
                    typingSpeed = 80; // Normal speed
                }
                
                // Log timing every 10 characters for debugging
                if (i % 10 === 0) {
                    console.log('⏱️ TIMING:', {
                        progress: Math.round(progress * 100) + '%',
                        expectedTime: Math.round(expectedTime),
                        actualTime: Math.round(actualTime),
                        timeDiff: Math.round(timeDiff),
                        typingSpeed: typingSpeed
                    });
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
    console.log('⌨️ Typing sound played');
}

// Mobile Navigation Functionality
function toggleMobileNav(element) {
    console.log('🔄 toggleMobileNav called with element:', element);
    
    const navTree = element.closest('.mobile-nav-tree');
    console.log('🔄 Found nav tree:', navTree);
    
    if (navTree) {
        const wasActive = navTree.classList.contains('active');
        navTree.classList.toggle('active');
        const isNowActive = navTree.classList.contains('active');
        
        console.log('🔄 Mobile nav toggled:', {
            wasActive: wasActive,
            isNowActive: isNowActive,
            element: element,
            navTree: navTree
        });
    } else {
        console.error('❌ Could not find mobile nav tree for element:', element);
    }
}

// Initialize mobile navigation
function initMobileNavigation() {
    console.log('🔧 Initializing mobile navigation...');
    
    // Find mobile navigation elements
    const mobileNavMain = document.querySelectorAll('.mobile-nav-main');
    const mobileNavItems = document.querySelectorAll('.mobile-nav-item');
    
    console.log('📱 Found mobile nav main buttons:', mobileNavMain.length);
    console.log('📱 Found mobile nav items:', mobileNavItems.length);
    
    // Add click functionality to mobile nav main button
    mobileNavMain.forEach((button, index) => {
        console.log(`📱 Adding click listener to mobile nav main button ${index}`);
        button.addEventListener('click', function(e) {
            console.log('📱 Mobile nav main button clicked!');
            e.preventDefault();
            e.stopPropagation();
            toggleMobileNav(this);
        });
    });
    
    // Add click functionality to mobile nav items
    mobileNavItems.forEach((item, index) => {
        console.log(`📱 Adding click listener to mobile nav item ${index}:`, item.getAttribute('data-section'));
        item.addEventListener('click', function(e) {
            // If this is an <a> with an href, allow the browser to navigate normally
            const href = this.getAttribute('href');
            const section = this.getAttribute('data-section');
            if (href) {
                // Let the default navigation occur
                return;
            }

            // Otherwise, handle legacy data-section behavior
            e.preventDefault();
            e.stopPropagation();

            if (section) {
                // Hide mobile menu
                const navTree = this.closest('.mobile-nav-tree');
                if (navTree) navTree.classList.remove('active');

                // Navigate to the page for the section
                window.location.href = section + '.html';
            }
        });
    });
    
    // Add click functionality to dropdown items (allow normal link navigation)
    document.querySelectorAll('.dropdown-item').forEach(item => {
        item.addEventListener('click', function(e) {
            const href = this.getAttribute('href');
            if (!href) return;
            if (href.startsWith('#')) {
                e.preventDefault();
                const section = href.substring(1);
                showSection(section);
            }
        });
    });
} 