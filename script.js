let cameraDataJSON = [];
let uwbDataJSON = [];
const regex = /(\w+\s*):\s*(\d+\.?\d*)/g;
const regexID = /(\d+)/;
let tableContainerID = 0;

const options = { 
         year: "numeric", 
         month: "numeric", 
         day: "numeric",
         hour: "numeric",
         minute: "numeric",
         second: "numeric",
         hour12: false,
         millisecond: "numeric"
      };

async function fetchData(dataUrls) {


   const getData = (url) => {
   
      const data = fetch(url)
         .then(response => response.text())
         // .then(data => data)
         .catch(error => {console.error(error);})

      return data;
   } 

   const getImageUrls = (leftImagesFolder, rightImagesFolder) => {
      const images = fetch('https://api.github.com/repos/Razyapoo/razyapoo.github.io/git/trees/main?recursive=1')
         .then(response => response.json())
         .then(data => {

            let leftImagesUrls = [];
            let rightImagesUrls = [];
            for (let file of data.tree) {
               if (file.type === 'blob') {
                  if (file.path.startsWith(leftImagesFolder)) {
                     leftImagesUrls.push(`https://raw.githubusercontent.com/Razyapoo/razyapoo.github.io/main/${file.path}`)
                  } else if (file.path.startsWith(rightImagesFolder)) {
                     rightImagesUrls.push(`https://raw.githubusercontent.com/Razyapoo/razyapoo.github.io/main/${file.path}`)
                  }
               }
            }

            function sortByIndex(first, second) {
               const firstIndex = parseInt(first.match(/(\d+) - \d+.jpg/)[1]);
               const secondIndex = parseInt(second.match(/(\d+) - \d+.jpg/)[1]);

               return firstIndex - secondIndex;
            }

            leftImagesUrls = leftImagesUrls.sort(sortByIndex);
            rightImagesUrls = rightImagesUrls.sort(sortByIndex);

            return {leftImagesUrls, rightImagesUrls};
         })
         .catch(error => {
            console.error("Error when fetching image URLs: ", error);
         });

      return images;   
   }

   for (let experiment in dataUrls) {
      const cameraData = await getData(dataUrls[experiment].cameraDataUrl);
      const uwbData = await getData(dataUrls[experiment].uwbDataUrl);
      const images = await getImageUrls(dataUrls[experiment].leftImagesFolder, dataUrls[experiment].rightImagesFolder)
   
      parseData(cameraData, uwbData, images.leftImagesUrls, images.rightImagesUrls, dataUrls[experiment].title);
   }


}

function createEmptyRow(timestamp) {
   const row = document.createElement('tr');

   // Index
   const indexElement = document.createElement('td');
   
   // Timestamp
   const timestampElement = document.createElement('td');
   timestampElement.textContent = timestamp;

   // Formatted date
   const formattedDateElement = document.createElement('td');  
   const date = new Date(parseInt(timestamp));
   formattedDateElement.textContent = date.toLocaleString(undefined, options) + '.' + date.getMilliseconds().toString().padStart(3, '0');

   const tagIDElement = document.createElement('td');
   const headerAnchor101Element = document.createElement('td');
   const headerAnchor102Element = document.createElement('td');
   row.append(indexElement);
   row.append(timestampElement);
   row.append(formattedDateElement);
   row.append(tagIDElement);
   row.append(headerAnchor101Element);
   row.append(headerAnchor102Element);

   return row;
}

function createRow(data, imageLeft=undefined, imageRight=undefined, isHeader=false, isUwbData=false) {
   
   let row = document.createElement('tr');

   // Index
   const index = document.createElement('td');
   index.textContent = data[0];
   
   // Timestamp
   const timestamp = document.createElement('td');
   timestamp.textContent = data[1];

   // Formatted date
   const formattedDate = document.createElement('td');
   date = new Date(parseInt(data[1]));
   formattedDate.textContent = date.toLocaleString(undefined, options) + '.' + date.getMilliseconds().toString().padStart(3, '0');
   
   row.append(index);
   row.append(timestamp);
   row.append(formattedDate);
   if (isUwbData) {
      // Tag ID
      const [...tagDataParsed] = data[2].matchAll(regex);
      const tagID = document.createElement('td');
      tagID.textContent = tagDataParsed[0][2];
      const headerAnchor101 = document.createElement('td');
      const headerAnchor102 = document.createElement('td');
      if (tagDataParsed[1][2] == "101") {
         headerAnchor101.textContent = tagDataParsed[2][2];
         headerAnchor102.textContent = tagDataParsed[4][2];
      } else if (tagDataParsed[1][2] == "102") {
         headerAnchor102.textContent = tagDataParsed[2][2];
         headerAnchor101.textContent = tagDataParsed[4][2];
      }

      row.append(tagID);
      row.append(headerAnchor101);
      row.append(headerAnchor102);
   } else {
      for (let image of [imageLeft, imageRight]) {
         const imageElement = document.createElement('td');
         const imageLinkElement = document.createElement('a');
         imageLinkElement.setAttribute('href', image);
         imageLinkElement.textContent = image.match(/(\d+ - \d+.jpg)/)[1];
         imageLinkElement.onclick = (event) => {
            event.preventDefault();
            const imageUrl = event.target.href;
            window.open(imageUrl, '_blank', `width=640, height=360`);
         }
         imageElement.append(imageLinkElement);
         row.append(imageElement);
      }
   }

   if (!isUwbData && !isHeader) {
      const subRow = row;
      row = document.createElement('tr');
      const tableDataElement = document.createElement('td');
      // because header row is only for camera data => calSapn = 5
      tableDataElement.colSpan = 5;
      const subTableElement = document.createElement('table');
      subTableElement.className = 'inner-table';
      subTableElement.append(subRow);
      tableDataElement.append(subTableElement);
      row.append(tableDataElement);
   }

   return row;
}

function createPairOfTables(title) {
   const body = document.querySelector('body');
   const tableContainer = document.createElement('div');
   const fisrtTable = createTable(false);
   const secondTable = createTable(true);

   const titleElement = document.createElement('h2');
   titleElement.textContent = title;

   // tableContainer.classList.add('table-container');
   // tableContainer.classList.add(`tc${tableContainerID++}`);
   tableContainer.className = 'table-container';

   tableContainer.append(fisrtTable);
   tableContainer.append(secondTable);
   body.append(titleElement);
   body.append(tableContainer);

   return tableContainer;
}

function createTable(isUwbTable) {
   
   let headers = {
      timestamp: "Timestamp",
      formattedDate: "Timestamp in date format"
   };

   if (isUwbTable) {
      headers.index = "Record ID";
      headers.tagID = "Tag ID";
      headers.anchor101 = "Anchor 101";
      headers.anchor102 = "Anchor 102";
   } else {
      headers.index = "Frame ID";
      headers.cameraFrame1 = "Frame Camera 1"
      headers.cameraFrame2 = "Frame Camera 2"
   }

   const div = document.createElement('div');
   div.className = isUwbTable ? "second-table" : "first-table"
   
   const table = document.createElement('table');
   const header = document.createElement('thead');
   const headerFirstRow = document.createElement('tr');
   const headerFirstH = document.createElement('th');
   if (isUwbTable) {
      headerFirstH.colSpan = 6;
      headerFirstH.textContent = "UWB";
   } else {
      headerFirstH.colSpan = 5;
      headerFirstH.textContent = "Camera";
   }
   headerFirstRow.append(headerFirstH);
   header.append(headerFirstRow);

   const headerSecondRow = document.createElement('tr');
   for (let key of Object.keys(headers)) {
      const headerSecondH = document.createElement('th');
      headerSecondH.textContent = headers[key];
      headerSecondRow.append(headerSecondH);
   }
   header.append(headerSecondRow);
   table.append(header);

   const body = document.createElement('tbody');
   body.id = isUwbTable ? "uwbBody" : "cameraBody";
   table.append(body);
   div.append(table);

   return div;
}

function parseData(rawCameraData, rawUwbData, imagesLeft, imagesRight, title) {

   const tableContainer = createPairOfTables(title);

   rawCameraData = rawCameraData.split("\n");
   rawUwbData = rawUwbData.split("\n");
   rawCameraData.splice(-1);
   rawUwbData.splice(-1);

   const uwbTable = tableContainer.querySelector('#uwbBody');
   const cameraTable = tableContainer.querySelector('#cameraBody');

   let uwbTimestamp, cameraTimestamp;
   let i = 0; // camera
   let j = 0; // uwb

   let row;
   let isHeaderRow;
   while (rawUwbData.length != j) {
      let rawCameraDataArray = rawCameraData[i].split(",");
      const rawUwbDataArray = rawUwbData[j].split(",");

      uwbTimestamp = parseInt(rawUwbDataArray[1]);
      cameraTimestamp = parseInt(rawCameraDataArray[1]);

      isHeaderRow = true;
      while (cameraTimestamp < uwbTimestamp) {
         if (isHeaderRow) { 
            row = createRow(rawCameraDataArray, imagesLeft[i], imagesRight[i], isHeader=true, isUwbData=false);
            isHeaderRow = false;
            row.classList.add('group-header');
            row.addEventListener('click', function () {
               let parent = this.parentNode;
               while (parent && parent.className != "table-container") {
                  parent = parent.parentNode;
               }

               const index = parseInt(this.id.match(regexID)[1]);
               this.classList.toggle('--active');

               const uwbElement1 = parent.querySelector(`#uwbRow${index}`);
               uwbElement1.classList.toggle('--active');
            
               let uwbElement2;
               if (index - 1 >= 0) {
                  uwbElement2 = parent.querySelector(`#uwbRow${index - 1}`);
                  uwbElement2.classList.toggle('--active');
               }
               
               let rowInsideGroup = this.nextElementSibling;
               while (rowInsideGroup && !rowInsideGroup.classList.contains('group-header')) {
                  rowInsideGroup.classList.toggle('--visible');
                  rowInsideGroup = rowInsideGroup.nextElementSibling;
               }
            });
         } else {
            row = createRow(rawCameraDataArray, imagesLeft[i], imagesRight[i], isHeader=false, isUwbData=false);
            row.classList.add('inside-group');
         }
         // row.classList.add(j);
         row.id = `cameraRow${j}`;
         cameraTable.append(row);
         i++;
         rawCameraDataArray = rawCameraData[i].split(",");
         cameraTimestamp = parseInt(rawCameraDataArray[1]);
      }
      if (j == 0) {
         const row = createEmptyRow(uwbTimestamp);
         // row.className = 'empty';
         uwbTable.append(row);
      }
      isHeaderRow = true;

      row = createRow(rawUwbDataArray, undefined, undefined, isHeader=false, isUwbData=true);
      // row.classList.add(j);
      row.id = `uwbRow${j}`;
      uwbTable.append(row);
      j++;
   }

   isHeaderRow = true;
   while (rawCameraData.length != i) {
      let rawCameraDataArray = rawCameraData[i].split(",");
      cameraTimestamp = parseInt(rawCameraDataArray[1]);

      if (isHeaderRow) { 
         row = createRow(rawCameraDataArray, imagesLeft[i], imagesRight[i], isHeader=true, isUwbData=false);
         isHeaderRow = false;
         row.classList.add('group-header');
         row.addEventListener('click', function () {
            let parent = this.parentNode;
            while (parent && parent.className != "table-container") {
               parent = parent.parentNode;
            }

            const index = parseInt(this.id.match(regexID)[1]);
            // console.log(index);
            this.classList.toggle('--active');
            let uwbElement;
            uwbElement = parent.querySelector(`#uwbRow${index - 1}`);
            uwbElement.classList.toggle('--active');

            let rowInsideGroup = this.nextElementSibling;
            while (rowInsideGroup && !rowInsideGroup.classList.contains('group-header')) {
               rowInsideGroup.classList.toggle('--visible');
               rowInsideGroup = rowInsideGroup.nextElementSibling;
            }
         });
      } else {
         row = createRow(rawCameraDataArray, imagesLeft[i], imagesRight[i], isHeader=false, isUwbData=false);
         row.classList.add('inside-group');
      }
      // row.classList.add(j);
      row.id = `cameraRow${j}`;
      cameraTable.append(row);
      i++;
      if (rawCameraData[i]) {
         rawCameraDataArray = rawCameraData[i].split(",");
         cameraTimestamp = parseInt(rawCameraDataArray[1]);
      }
   }

}


document.addEventListener('DOMContentLoaded', () => {

   const dataUrls = {
      Experiment1: {
         title: "First Experiment",
         cameraDataUrl: 'https://raw.githubusercontent.com/Razyapoo/razyapoo.github.io/main/Experiment 1/timestamp.txt',
         uwbDataUrl: 'https://raw.githubusercontent.com/Razyapoo/razyapoo.github.io/main/Experiment 1/timestamp_ESP32.txt',
         leftImagesFolder: 'Experiment 1/images/Left/',
         rightImagesFolder: 'Experiment 1/images/Right/'
      },

      Experiment2: {
         title: "Second Experiment",
         cameraDataUrl: 'https://raw.githubusercontent.com/Razyapoo/razyapoo.github.io/main/Experiment 2/timestamp.txt',
         uwbDataUrl: 'https://raw.githubusercontent.com/Razyapoo/razyapoo.github.io/main/Experiment 2/timestamp_ESP32.txt',
         leftImagesFolder: 'Experiment 2/images/Left/',
         rightImagesFolder: 'Experiment 2/images/Right/'
      },

      Experiment3: {
         title: "Third Experiment",
         cameraDataUrl: 'https://raw.githubusercontent.com/Razyapoo/razyapoo.github.io/main/Experiment 3 (angle)/timestamp.txt',
         uwbDataUrl: 'https://raw.githubusercontent.com/Razyapoo/razyapoo.github.io/main/Experiment 3 (angle)/timestamp_ESP32.txt',
         leftImagesFolder: 'Experiment 3 (angle)/images/Left/',
         rightImagesFolder: 'Experiment 3 (angle)/images/Right/'
      }
   }

   fetchData(dataUrls)
   // let cameraDataUrl = 'https://raw.githubusercontent.com/Razyapoo/razyapoo.github.io/main/Experiment 1/timestamp.txt';
   // let uwbDataUrl = 'https://raw.githubusercontent.com/Razyapoo/razyapoo.github.io/main/Experiment 1/timestamp_ESP32.txt';
   // let title = "First Experiment";
   // fetchData(cameraDataUrl, uwbDataUrl, title);

   // cameraDataUrl = 'https://raw.githubusercontent.com/Razyapoo/razyapoo.github.io/main/Experiment 2/timestamp.txt';
   // uwbDataUrl = 'https://raw.githubusercontent.com/Razyapoo/razyapoo.github.io/main/Experiment 2/timestamp_ESP32.txt';
   // title = "Second Experiment";
   // fetchData(cameraDataUrl, uwbDataUrl, title);
   

})