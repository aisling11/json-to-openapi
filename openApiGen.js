function convert() {
  'use strict';
  // ---- Global variables ----
  var inJSON, openApiOutput, tabCount, indentator;

  // ---- Functions definitions ----

  function toFixed(x) {
    /*
    Avoid number in cientific notation
    */
    if (Math.abs(x) < 1.0) {
      var e = parseInt(x.toString().split('e-')[1]);
      if (e) {
          x *= Math.pow(10,e-1);
          x = '0.' + (new Array(e)).join('0') + x.toString().substring(2);
      }
    } else {
      var e = parseInt(x.toString().split('+')[1]);
      if (e > 20) {
          e -= 20;
          x /= Math.pow(10,e);
          x += (new Array(e+1)).join('0');
      }
    }
    return x;
  }

  function countDecimals(value) {
    /*
    Count the number of decimals of a float
    */
    let text = value.toString()
    // verify if number 0.000005 is represented as "5e-6"
    if (text.indexOf('e-') > -1) {
      let [base, trail] = text.split('e-');
      let deg = parseInt(trail, 10);
      return deg;
    }
    // count decimals for number in representation like "0.123456"
    if (Math.floor(value) !== value) {
      return value.toString().split(".")[1].length || 0;
    }
    return 0;
  }

  function changeIndentation(count) {
    /* 
    Assign 'indentator' a string beginning with newline and followed by 'count' tabs
    Updates variable 'tabCount' with the number of tabs used
    Global variables updated: 
    -identator 
    -tabcount
    */

    let i;
    if (count >= tabCount) {
      i = tabCount
    } else {
      i = 0;
      indentator = '\n';
    }
    for (; i < count; i++) {
      indentator += '\t';
    }
    //Update tabCount
    tabCount = count;
  };

  function conversorSelection(obj) {
    /* 
      Selects which conversion method to call based on given obj
    Global variables updated: 
      -openApiOutput
      */

    changeIndentation(tabCount + 1);
    if (typeof obj === "number") { //attribute is a number
      convertNumber(obj);
    } else if (Object.prototype.toString.call(obj) === '[object Array]') { //attribute is an array
      convertArray(obj[0]);
    } else if (typeof obj === "object") { //attribute is an object
      convertObject(obj);
    } else if (typeof obj === "string") { //attribute is a string
      convertString(obj);
    } else if (typeof obj === "boolean") { // attribute is a boolean
      convertBoolean(obj)
    } else { // not a valid openAPI type
      alert('Property type "' + typeof obj + '" not valid for OpenAPI definitions');
    }
    changeIndentation(tabCount - 1);
  };

  function convertNumber(num) {
    /* 
    Append to 'openApiOutput' string with OpenAPI schema attributes relative to given number
    Global variables updated: 
    -openApiOutput
    */

    if (num % 1 === 0 ) {
      openApiOutput += indentator + 'type: integer,';
      if (num < 2147483647 && num > -2147483647) {
        openApiOutput += indentator + 'format: int32';
      } else if (Number.isSafeInteger(num)) {
        openApiOutput += indentator + 'format: int64';
      } else {
        openApiOutput += indentator + 'format: unsafe';
      }
    } else {
      openApiOutput += indentator + 'type: number,';
      var num_decimals = countDecimals(num)
      if(num_decimals < 8){
        openApiOutput += indentator + 'format: float';
      } else if(num_decimals < 16 && num_decimals >= 8){
        openApiOutput += indentator + 'format: double';
      } else{
        openApiOutput += indentator + 'format: unsafe';
      }
    }

    openApiOutput += indentator + 'example: ' + toFixed(num);
  };

  //date is ISO8601 format - https://xml2rfc.tools.ietf.org/public/rfc/html/rfc3339.html#anchor14
  function convertString(str) {
    /* 
      Append to 'openApiOutput' string with OpenAPI schema attributes relative to given string
      Global variables updated: 
      -openApiOutput
      */

    let regxDate = /^(19|20)\d{2}-(0[1-9]|1[0-2])-(0[1-9]|[12][0-9]|3[01])$/,
      regxDateTime = /^(19|20)\d{2}-(0[1-9]|1[0-2])-(0[1-9]|[12][0-9]|3[01]).([0-1][0-9]|2[0-3]):[0-5][0-9]:[0-5][0-9](\.[0-9]{1,2})?(Z|(\+|\-)([0-1][0-9]|2[0-3]):[0-5][0-9])$/;

    openApiOutput += indentator + 'type: string,';
    if (regxDateTime.test(str)) {
      openApiOutput += ','
      openApiOutput += indentator + 'format: date-time';
    } else if (regxDate.test(str)) {
      openApiOutput += ','
      openApiOutput += indentator + 'format: date';
    }
    openApiOutput += "," + indentator + 'example: \"' + str + '\"';
  };

  function convertBoolean(obj){
      /* 
      Append to 'openApiOutput' string with OpenAPI schema attributes relative to given boolean
      Global variables updated: 
      -openApiOutput
      */
    openApiOutput += indentator + 'type: boolean';
    if ((obj.toString()) != 'true'){
      openApiOutput += "," + indentator + 'example: false';
    }

  }
  function convertArray(obj) {
    /* 
      Append to 'openApiOutput' string with OpenAPI schema attributes relative to given array
      Global variables updated: 
      -openApiOutput
      */

    openApiOutput += indentator + 'type: array';
    // ---- Begin items scope ----
    openApiOutput += indentator + 'items: {';
    conversorSelection(obj);
    openApiOutput += indentator + '}';
    // ---- End items scope ----
  };

  function convertObject(obj) {
    /* 
      Append to 'openApiOutput' string with OpenAPI schema attributes relative to given object
      Global variables updated: 
      -openApiOutput
      */

    //Convert null attributes to given type
    if (obj === null) {
      openApiOutput += indentator + 'type: ' + document.getElementById("nullType").value + ',';
      openApiOutput += indentator + 'format: nullable';
      return;
    }
    // ---- Begin properties scope ----
    openApiOutput += indentator + 'type: object,'
    openApiOutput += indentator + 'properties: {';
    changeIndentation(tabCount + 1);
    for (var prop in obj) {
      // ---- Begin property type scope ----
      openApiOutput += indentator + prop + ': {';
      conversorSelection(obj[prop]);
      openApiOutput += indentator + '},'
    }
    changeIndentation(tabCount - 1);
    if (Object.keys(obj).length > 0) { //At least 1 property inserted
      openApiOutput = openApiOutput.substring(0, openApiOutput.length - 1); //Remove last comma
      openApiOutput += indentator + '}'
    } else { // No property inserted
      openApiOutput += ' }';
    }

    // ---- Begin required scope ----
    openApiOutput += indentator + 'required: {';
    changeIndentation(tabCount + 1);
    for (var prop in obj) {
      openApiOutput += indentator + '- ' + prop ;
    }
    changeIndentation(tabCount - 1);
    if (Object.keys(obj).length > 0) { //At least 1 required property inserted
      openApiOutput += indentator + '}'
    } else { // No required property inserted
      openApiOutput += ' }';
    }
  };

  function format(value) {
    /*
    Convert JSON to YAML
    */
    return value.replace(/[{},]+/g, '').replace(/\t/g, '  ').replace(/(^ *\n)/gm, '');
  }

  // ---- Execution begins here ----

  // Remove comments to generate JSON content
  var textContent = document.getElementById("JSON").value;
  var lines = textContent.trim().split('\n');

  for (var i = 0; i < lines.length; i++) {
    if (lines[i].includes("//")) {
      lines[i] = lines[i].split('//')[0];
    }
    lines[i] = lines[i] + '\n';
  }
  var newTextContent = lines.join('')

  // Build JSON
  try {
    inJSON = JSON.parse(newTextContent);
  } catch (e) {
    alert("Your JSON is invalid!\n(" + e + ")");
    return;
  }

  // For recursive functions to keep track of the tab spacing
  tabCount = 0;
  indentator = "\n";
  // ---- Begin schema ----
  openApiOutput = 'schema: {';
  changeIndentation(1);

  openApiOutput += indentator + 'type: object,'
  openApiOutput += indentator + 'properties: {';
  changeIndentation(tabCount +1);
  // For each object inside the JSON
  for (var obj in inJSON) {
    // ---- Begin object scope ----
    openApiOutput += indentator + obj + ': {'
    conversorSelection(inJSON[obj]);
    openApiOutput += indentator + '},';
  }

  // ---- Begin required scope ----
  changeIndentation(tabCount - 1);
  openApiOutput += indentator + 'required: {';
  changeIndentation(tabCount + 1);
  for (var obj in inJSON) {
    openApiOutput += indentator + ' - ' + obj ;
  }
  changeIndentation(tabCount - 1);
  if (Object.keys(obj).length > 0) { //At least 1 required property inserted
    openApiOutput += indentator + '}'
  } else { // No required property inserted
    openApiOutput += ' }';
  }

  // Remove last comma
  openApiOutput = openApiOutput.substring(0, openApiOutput.length - 1);
  // ---- END schema----
  changeIndentation(tabCount - 1);
  openApiOutput += indentator + '}';
  changeIndentation(tabCount - 1);
  openApiOutput += indentator + '}';


  document.getElementById("OpenAPI").value = format(openApiOutput);
} 