var fs = require('fs');
var request = require('request');
var expect = require('chai').expect;

describe('http', function () {
    this.timeout(10000)
    it ('should generate docx in response', function (done) {
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
            done();
        })
        .pipe(fs.createWriteStream(__dirname + '/../chart.docx'));
    })
})