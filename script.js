const video = document.getElementById('video');
const canvas = document.getElementById('canvas');
const captureLink = document.getElementById('captureLink');

// Cloudinary configuration
const cloudName = 'dsfc6qjqx';
const uploadPreset = 'ml_default';

// Access the camera
navigator.mediaDevices.getUserMedia({ video: true })
  .then(stream => {
    video.srcObject = stream;
  })
  .catch(error => {
    console.error('Error accessing the camera:', error);
  });

// Capture image when the link is clicked
captureLink.addEventListener('click', () => {
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
      // You can do something with the uploaded image URL, like displaying it on the page
    })
    .catch(error => {
      console.error('Error uploading image to Cloudinary:', error);
    });
  }, 'image/jpeg');
}); 