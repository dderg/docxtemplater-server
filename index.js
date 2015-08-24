'use strict';

var fs = require('fs');
var Docxtemplater = require('docxtemplater');
var ChartModule = require('docxtemplater-chart-module');
var ImageModule = require('docxtemplater-image-module');

var express = require('express');
var bodyParser = require('body-parser');
var formidable = require('formidable');
var app = express();
app.use(bodyParser.urlencoded({extended: true}));

var chartModule = new ChartModule();
var imageModule = new ImageModule();

app.post('/', function (req, res) {
	// console.log(JSON.parse(req.body.json));
	
	var form = new formidable.IncomingForm();

	form.parse(req, function(err, fields, files) {
		var content = fs.readFileSync(files.docx.path, "binary");
		var data = JSON.parse(fs.readFileSync(files.json.path, "utf8"));
		var doc = new Docxtemplater()
			.attachModule(chartModule)
			.attachModule(imageModule)
			.load(content)
			.setData(data)
			.render();
		var buf = doc.getZip().generate({type: "nodebuffer"});
		res.end(buf);
	})
});


var server = app.listen(3000, function () {
	var host = server.address().address;
	var port = server.address().port;

	console.log('Listening at port %s', port);
});
