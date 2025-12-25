// Minimal test script
console.log('Minimal script loaded');

// Simple audio test
document.addEventListener('DOMContentLoaded', function() {
    console.log('DOM loaded');
    
    const backgroundAudio = document.getElementById('backgroundAudio');
    const audioBtn = document.getElementById('playAudioBtn');
    
    if (backgroundAudio && audioBtn) {
        console.log('Audio elements found');
        
        // Simple audio button functionality
        audioBtn.addEventListener('click', function() {
            if (backgroundAudio.paused) {
                backgroundAudio.play().then(() => {
                    audioBtn.innerHTML = '<i class="fas fa-volume-up"></i><span>Audio On</span>';
                    audioBtn.classList.add('playing');
                    console.log('Audio started');
                }).catch((error) => {
                    console.log('Audio failed:', error);
                });
            } else {
                backgroundAudio.pause();
                audioBtn.innerHTML = '<i class="fas fa-volume-mute"></i><span>Audio Off</span>';
                audioBtn.classList.remove('playing');
                console.log('Audio paused');
            }
        });
        
        // Try to start audio on page load
        backgroundAudio.volume = 0.3;
        backgroundAudio.loop = true;
        backgroundAudio.play().then(() => {
            console.log('Audio autostarted');
            audioBtn.innerHTML = '<i class="fas fa-volume-up"></i><span>Audio On</span>';
            audioBtn.classList.add('playing');
        }).catch((error) => {
            console.log('Audio autostart failed:', error);
        });
    } else {
        console.log('Audio elements not found');
    }
}); 