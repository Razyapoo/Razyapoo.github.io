async function fetchData(APIUrl, timestampType) {
   let response = await fetch(APIUrl);

   if (!response.ok) throw new Error('Response was not ok');

   data = await response.text();

   parseData(data, timestampType == "camera" ? "cameraBody" : "uwbBody" );
}

function parseData(rowData, parentElement) {
   let rowDataArray = rowData.split("\n");
   let tableElement = document.getElementById(parentElement);
   
   for (let data of rowDataArray) {
      let parts = data.split(",");

      let row = document.createElement('tr');
      for (let i = 0; i < parts.length; i++) {
         let dataElement = document.createElement('td');
         dataElement.textContent = parts[i];
         if (i != 2) row.append(dataElement);
         if (i == 1) {
            let timeElement = document.createElement('td');
            let date = new Date(parseInt(parts[i]));
            let options = { 
               year: "numeric", 
               month: "numeric", 
               day: "numeric",
               hour: "numeric",
               minute: "numeric",
               second: "numeric",
               hour12: false,
               millisecond: "numeric"
            };
            timeElement.textContent = date.toLocaleString(undefined, options) + '.' + date.getMilliseconds().toString().padStart(3, '0'); 
            row.append(timeElement);
         }

         if (i == 2) {
            let regex = /(\w+\s*):\s*(\d+\.?\d*)/g;
            let [...rowDataParsed] = parts[i].matchAll(regex);
            for (let dataArray of rowDataParsed) {
               if (dataArray[2] != "101" && dataArray[2] != "102") {
                  let dElement = document.createElement('td');
                  dElement.textContent = dataArray[2];
                  row.append(dElement);

               }
            }

         }
      }
      tableElement.append(row);
   }
   
}


document.addEventListener('DOMContentLoaded', () => {
   fetchData('https://raw.githubusercontent.com/Razyapoo/razyapoo.github.io/main/timestamp.txt', "camera");
   fetchData('https://raw.githubusercontent.com/Razyapoo/razyapoo.github.io/main/timestamp_ESP32.txt', "uwb");

})