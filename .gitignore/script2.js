const repository = 'Razyapoo/razyapoo.github.io'; // Replace with the owner and repository name
    const folderPath = 'Experiment 1/images/'; // Replace with the path to the folder inside the repository
    const imageExtensions = ['.jpg', '.jpeg', '.png', '.gif', '.bmp'];

function getFolderImageUrls() {
  const url = `https://api.github.com/repos/${repository}/git/trees/main?recursive=1`;

  return fetch(url)
    .then(response => response.json())
    .then(data => {
      // Filter the response to include only files within the specified folder
      const imageFiles = data.tree.filter(file => file.type === 'blob' && file.path.startsWith(folderPath));

      // Filter the folder files to include only image files
    //   const imageFiles = folderFiles.filter(file => isImageFile(file.path));

      // Extract the URLs of the images
      const imageUrls = imageFiles.map(file => `https://raw.githubusercontent.com/${repository}/main/${file.path}`);

      return imageUrls;
    })
    .catch(error => {
      console.error('Error fetching image URLs:', error);
    });
}

// Function to check if a file has an image extension
// function isImageFile(filepath) {
//   const ext = filepath.substring(filepath.lastIndexOf('.')).toLowerCase();
//   return imageExtensions.includes(ext);
// }

// Usage
getFolderImageUrls()
  .then(imageUrls => {
    console.log(imageUrls);
  });