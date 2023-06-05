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

async function fetchData(cameraDataUrl, uwbDataUrl, title) {


   const getData = (APIUrl) => {
   
      const data = fetch(APIUrl)
         .then(response => response.text())
         .then(data => data)
         .catch(error => {console.error(error);})

      return data;
   }

   const cameraData = await getData(cameraDataUrl);
   const uwbData = await getData(uwbDataUrl);

   parseData(cameraData, uwbData, title);

}

function createEmptyRow() {
   const row = document.createElement('tr');

   // Index
   const index = document.createElement('td');
   
   // Timestamp
   const timestamp = document.createElement('td');

   // Formatted date
   const formattedDate = document.createElement('td');  
   const tagID = document.createElement('td');
   const headerAnchor101 = document.createElement('td');
   const headerAnchor102 = document.createElement('td');
   row.append(index);
   row.append(timestamp);
   row.append(formattedDate);
   row.append(tagID);
   row.append(headerAnchor101);
   row.append(headerAnchor102);

   return row;
}

function createRow(data, isHeader, isUwbData) {
   
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

      if (!data[2]) {
         console.log("do data");
      }
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
   }


   if (!isHeader && !isUwbData) {
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
   const fisrtTable = createTable(true);
   const secondTable = createTable(false);

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
      index: "Index",
      timestamp: "Timestamp",
      formattedDate: "Timestamp in date format"
   };

   if (isUwbTable) {
      headers.tagID = "Tag ID";
      headers.anchor101 = "Anchor 101";
      headers.anchor102 = "Anchor 102";
   } else {
      headers.cameraFrame1 = "Frame Camera 1"
      headers.cameraFrame2 = "Frame Camera 2"
   }

   const div = document.createElement('div');
   div.className = isUwbTable ? "first-table" : "second-table"
   
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

function parseData(rawCameraData, rawUwbData, title) {

   const tableContainer = createPairOfTables(title);

   rawCameraData = rawCameraData.split("\n");
   rawUwbData = rawUwbData.split("\n");

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

      if (!rawCameraDataArray[0] || !rawUwbDataArray[0]) {
         console.log("no data array");
      }
      uwbTimestamp = parseInt(rawUwbDataArray[1]);
      cameraTimestamp = parseInt(rawCameraDataArray[1]);

      isHeaderRow = true;
      while (cameraTimestamp < uwbTimestamp) {
         if (isHeaderRow) { 
            row = createRow(rawCameraDataArray, isHeader=true, isUwbData=false);
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
            row = createRow(rawCameraDataArray, isHeader=false, isUwbData=false);
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
         const row = createEmptyRow();
         row.className = 'empty';
         uwbTable.append(row);
      }
      isHeaderRow = true;

      row = createRow(rawUwbDataArray, isHeader=false, isUwbData=true);
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
         row = createRow(rawCameraDataArray, isHeader=true, isUwbData=false);
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
         row = createRow(rawCameraDataArray, isHeader=false, isUwbData=false);
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

   let cameraDataUrl = 'https://raw.githubusercontent.com/Razyapoo/razyapoo.github.io/main/Experiment%201/timestamp.txt';
   let uwbDataUrl = 'https://raw.githubusercontent.com/Razyapoo/razyapoo.github.io/main/Experiment%201/timestamp_ESP32.txt';
   let title = "First Experiment";
   fetchData(cameraDataUrl, uwbDataUrl, title);

   cameraDataUrl = 'https://raw.githubusercontent.com/Razyapoo/razyapoo.github.io/main/Experiment%202/timestamp.txt';
   uwbDataUrl = 'https://raw.githubusercontent.com/Razyapoo/razyapoo.github.io/main/Experiment%202/timestamp_ESP32.txt';
   title = "Second Experiment";
   fetchData(cameraDataUrl, uwbDataUrl, title);
   

})