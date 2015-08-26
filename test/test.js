var fs = require('fs');
var request = require('request');
var expect = require('chai').expect;

describe('http', function () {
    this.timeout(10000)
    it ('should generate docx in response', function (done) {
        var resultPath = __dirname + '/../chart.docx';
        var writeStream = fs.createWriteStream(resultPath);
        writeStream.on('close', function () {
            var file = fs.readFileSync(resultPath);
            expect(file.length).to.equal(40213);
            done();
        })
        request.post({ 
            url: 'http://localhost:3000/',
            formData: {
                json: fs.createReadStream(__dirname + '/../example/chartExample.json'),
                docx: fs.createReadStream(__dirname + '/../example/chartExample.docx')
            }
        })
        .on('error', function (error) {
            throw error;
        })
        .on('response', function (response) {
            expect(response.statusCode).to.equal(200);
        })
        .pipe(writeStream);
    })
    it ('should get json as text and docx as link', function (done) {
        var resultPath = __dirname + '/../chartLinked.docx';
        var writeStream = fs.createWriteStream(resultPath);
        writeStream.on('close', function () {
            var file = fs.readFileSync(resultPath);
            expect(file.length).to.equal(40213);
            done();
        })
        request.post({ 
            url: 'http://localhost:3000/',
            form: {
                docx: 'http://front-end.fmake.ru/docxtemplater-server/example/chartExample.docx',
                json: fs.readFileSync(__dirname + '/../example/chartExample.json')
            }
            
        })
        .on('error', function (error) {
            throw error;
        })
        .on('response', function (response) {
            expect(response.statusCode).to.equal(200);
        })
        .pipe(writeStream);
    })
    it ('should get both json and docx as links', function (done) {
        var resultPath = __dirname + '/../chartBothLinked.docx';
        var writeStream = fs.createWriteStream(resultPath);
        writeStream.on('close', function () {
            var file = fs.readFileSync(resultPath);
            expect(file.length).to.equal(40213);
            done();
        })
        request.post({ 
            url: 'http://localhost:3000/',
            form: {
                docx: 'http://front-end.fmake.ru/docxtemplater-server/example/chartExample.docx',
                json: 'http://front-end.fmake.ru/docxtemplater-server/example/chartExample.json'
            }
            
        })
        .on('error', function (error) {
            throw error;
        })
        .on('response', function (response) {
            expect(response.statusCode).to.equal(200);
        })
        .pipe(writeStream);
    })
})