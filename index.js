'use strict';

var fs = require('fs');
var Docxtemplater = require('docxtemplater');
var ChartModule = require('docxtemplater-chart-module');
var ImageModule = require('docxtemplater-image-module');

var express = require('express');
var bodyParser = require('body-parser');
var formidable = require('formidable');
var app = express();
var isJSON = require('is-json');
var validUrl = require('valid-url');
var httpreq = require('httpreq');
app.use(bodyParser.urlencoded({extended: true}));

var chartModule = new ChartModule();
var imageModule = new ImageModule();


var render = function (content, data) {
	var doc = new Docxtemplater()
		.attachModule(chartModule)
		.attachModule(imageModule)
		.load(content)
		.setData(data)
		.render();
	return doc.getZip().generate({type: "nodebuffer"});
}


var parseForm = function (req, res) {
	var form = new formidable.IncomingForm();

	form.parse(req, function(err, fields, files) {
		var error;
		if (files.docx === undefined) {
			error = 'docx file not attached';
		} else if (files.json === undefined) {
			error = 'json file not attached';
		}
		if (error !== undefined) {
			console.error(error);
			res.status('400').end(error);
			return;
		}
		var content = fs.readFileSync(files.docx.path, "binary");
		var data = JSON.parse(fs.readFileSync(files.json.path, "utf8"));
		var buf = render(content, data);
		res.end(buf);
	});
};

var download = function (url, cb, binary) {
	var data = [], dataLen = 0;
	var request = httpreq.get(url, {binary: binary}, function (err, response) {
		if (err) {
			res.status(500).end(err);
			cb(err);
			return;
		}
		cb(undefined, response.body);
	});
};

app.post('/', function (req, res) {
	var contentType = req.headers['content-type'];
	if (contentType.split('/')[0] === 'multipart') {
		parseForm(req, res);
	} else {
		var json, docx, jsonLoaded = false, docxLoaded = false;
		var isLoaded = function () {
			return (jsonLoaded && docxLoaded);
		}
		var handleForm = function () {
			if (isLoaded()) {
				var buf = render(docx, json);
				res.end(buf);
			}
		}
		if (isJSON(req.body.json)) {
			json = JSON.parse(req.body.json);
			jsonLoaded = true;
			handleForm();
		} else if (validUrl.isUri(req.body.json)) {
			download(req.body.json, function (error, data) {
				if (error) {
					res.status(400).end('could not download json with link: ' + req.body.json);
					return;
				}
				json = data;
				jsonLoaded = true;
				handleForm();
			}, false);
		} else {
			res.status(400).end('json is not json or url');
			console.error('json is not json or url');
			return;
		}
		if (validUrl.isUri(req.body.docx)) {
			download(req.body.docx, function (error, data) {
				if (error) {
					res.status(400).end('could not download docx with link: ' + req.body.docx);
					return;
				}
				docx = data;
				docxLoaded = true;
				handleForm();
			}, true);
		} else {
			res.status(400).end('docx is not url');
			console.error('docx is not url');
			return;
		}
	}
});


var server = app.listen(3000, function () {
	var host = server.address().address;
	var port = server.address().port;

	console.log('Listening at port %s', port);
});
