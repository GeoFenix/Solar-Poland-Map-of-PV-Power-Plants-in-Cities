# Smart-table 

This is my first plugin made as JS course final project :mortar_board: - with a lot of tears and sweat but also with a lot more satisfaction. 
The Smart Table is aimed to store the user's data :computer: and enables him to operate on it by inserting, editing, removing, filtering ect. 
![alt tag](src/table_demo.png) 

## Descritpion and application 

The smart table plugin is available in :open_file_folder: js/plugin_smart_table.js and can be viewed in browser by index.html. 
There are 6 exemplary table instances with different features enabled, executed from a file :open_file_folder: js/smart_table_instances.js. 
Exemplary data for demonstration are delivered in data_for_smart_table.js 

## Example of usage and input options

To bring a smart table to life (like in :open_file_folder: js/smart_table_instances.js) you need to: 

:pushpin: Choose and element from you HTML code that will contain a smart table instance: 

``` 
var elForTable1 = document.querySelector('#smart-table'); 
``` 

:pushpin: Specify a columns name, configuration and input data type: 

``` 
var columns_2 = [{
    columnName: 'ID',
    dataType: 'number',
}, {
    columnName: 'First Name',
    dataType: 'string',
}, {
    columnName: 'Last Name',
    dataType: 'string',
}, {
    columnName: 'Username',
    dataType: 'string',
}, {
    columnName: 'E-mail',
    dataType: 'email',
}, {
    columnName: 'Age',
    dataType: 'string',
}];
``` 

:pushpin: Prepare the input data in a right table format: 

``` 
var data = [{
        "id": 1,
        "firstName": "Mark",
        "lastName": "Otto",
        "username": "@mdo",
        "email": "mdo@gmail.com",
        "age": "28",
    }, {
        "id": 2,
        "firstName": "Jacob",
        "lastName": "Thornton",
        "username": "@fat",
        "email": "fat@yandex.ru",
        "age": "45",
    },

// ... list of items 

   {
        "id": 60,
        "firstName": "Lou",
        "lastName": "Conner",
        "username": "@Sanchez",
        "email": "lousanchez@comtours.com",
        "age": 16,
    }
];
``` 

:pushpin: Define an option model - it's up to you which feature you choose 

``` 
var parameters2 = { 
    nextPreviousButtons: true,
    rowsPerPage: 10,
    rowsColoring: true,
    toolTips: true,
};
``` 

:pushpin: As a last step you have to write your miraculous code to evoke your smart table instance (good job, dr. Frankeinstein :wink: ). A pagination plugin you run externally. 

``` 
var table1 = new SmartTable(elForTable1, columns_2, data_2, parameters2); 
table1.pagination(); 
``` 

## Plugin methods example 

And here is a piece of my code style with comments (rowColoring @public method):

``` 
 //Metoda 14. Kolorowanie co drugiego wiersza____________Metoda 14 ROWS COLORING____(this.allRows)
    /**
     * Colors every second row of the table, available in option parameters
     * @public
     */
    SmartTable.prototype.rowsColoring = function () {
        if (!!this.parameters.rowsColoring){
            this.allRows = this.table.querySelectorAll('tr');
            var rowsArray = [];
            for (it = 2; it < this.allRows.length; it++) {
                this.allRows[it].style.backgroundColor = '';
                if (this.allRows[it].style.display === ''){
                    rowsArray.push(this.allRows[it]);
                }
            };
            for (var it = 0; it < rowsArray.length; it++) {
                rowsArray[it].style.backgroundColor = '';
                if (it % 2 === 0) {
                    rowsArray[it].style.backgroundColor = '#fac000';
                }
            };
        }
    };
    //Metoda 14
``` 

## Further Documentation 

:closed_book: I prepared a detailed documentation using jsdoc. It is available in :open_file_folder: /js/out/index.html 

## How can I support developers? 

:+1: Support me with stars, good advice and keep your fingers crossed for my future in IT :smiley: 

## Features 

* Filtering 
* Tooltips 
* Coloring 
* Pagination (run externally) 
* Add/Edit/Delete Data 

## License 

[MIT](LICENSE.txt) license

## Special thanks 

Special thanks to Adrian, my teacher, to teach me extra JEDI(LE) JS force :smiley: