// const { response } = require("express")

document.addEventListener('DOMContentLoaded', () => {
   fetch('https://raw.githubusercontent.com/Razyapoo/razyapoo.github.io/main/timestamp.txt')
   .then(response => {
    if (!response.ok) throw Error('Response is not OK');
    // console.log(response);
    return response.text();
   })
   .then(data => console.log(data))
   .catch(error => console.log(`Error: ${error}`));

})