var express = require('express');
var router = express.Router();

/* PostgreSQL and PostGIS module and connection setup */
const { Client, Query } = require('pg');

var dbCredentials = {
    user: "",
    password: "",
    database: "",
    port: 5432,
    host: "",
    ssl: true
};

// Database query to display GeoJSON
var solar_plants_query = "SELECT row_to_json(fc) FROM ( SELECT 'FeatureCollection' As type, array_to_json(array_agg(f)) As features FROM (SELECT 'Feature' As type, ST_AsGeoJSON(lg.geom)::json As geometry, row_to_json((id, nazwa, rodz_sp, miasto, rok_odd, adres, ile_inst, rodz_inst, moc_cal, ener_rok, koszty, realizat, co2_red, info)) As properties FROM elektrownie_test As lg) As f) As fc";

/* GET home page */
router.get('/', function(req, res, next) {
  res.render('public', { title: 'Public' });
});

/* GET Postgres JSON data for QC */
router.get('/data', function (req, res) {
    var client = new Client(dbCredentials);
    client.connect();
    var query = client.query(new Query(solar_plants_query));
    query.on("row", function (row, result) {
        result.addRow(row);
    });
    query.on("end", function (result) {
        res.send(result.rows[0].row_to_json);
        res.end();
    });
});

/* GET the map page */
router.get('/map*', function(req, res) {
    // var name = req.query.name;
    var name;
    if (req.query.name) {
        name = req.query.name;
    } else {
        name = 'f2';
    }

    var client = new Client(dbCredentials);
    client.connect(); // connect to the client
    var query = client.query(new Query(solar_plants_query)); // Run our Query
    query.on("row", function (row, result) {
        result.addRow(row);
    });

    // Query for country_lines vector data inside previous query
    query.on("end", function (result) {
        var dataSolarPowerPlants = result.rows[0].row_to_json // Save the JSON as variable data
        var country_lines_query = "SELECT row_to_json(fc) FROM ( SELECT 'FeatureCollection' As type, array_to_json(array_agg(f)) As features FROM (SELECT 'Feature' As type, ST_AsGeoJSON(lg.geom)::json As geometry, row_to_json((id, type)) As properties FROM country_lines As lg) As f) As fc";

        var query2 = client.query(new Query(country_lines_query)); // Run our Query
        query2.on("row", function (row, result) {
            result.addRow(row);
        });
        // Pass the result to the map page
        query2.on("end", function (result) {
            var dataCountryLines = result.rows[0].row_to_json // Save the JSON as variable data
            res.render('public', {
                title: "Solar Poland", // Give a title to our page
                jsonDataSolarPowerPlants: dataSolarPowerPlants,
                jsonDataCountryLines: dataCountryLines, // Pass data to the View
                attributeParameter: { attribute: name }
            });
        });
    });
// } // Ten do else
});
module.exports = router;

