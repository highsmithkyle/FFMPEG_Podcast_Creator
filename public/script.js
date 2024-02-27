const imageInput = document.getElementById('imageInput');
const imagePreviewContainer = document.getElementById('imagePreviewContainer');

imageInput.addEventListener('change', function() {
    imagePreviewContainer.innerHTML = '';

   
    for (const file of this.files) {
        const img = new Image();
        img.src = URL.createObjectURL(file); 
        img.style.maxWidth = '200px'; 
        img.style.margin = '10px';
        imagePreviewContainer.appendChild(img);

        img.onload = function() {
            URL.revokeObjectURL(this.src);
        };
    }
});