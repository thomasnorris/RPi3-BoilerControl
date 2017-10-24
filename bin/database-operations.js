
var _fs = require('fs'),
	_csvWriter = require('csv-write-stream');

const DATA_PATH = __dirname + '/data/';
const DB_FILE_NAME = 'Data.json';
const DB_FILE_PATH = DATA_PATH + DB_FILE_NAME;
const CSV_FILE_NAME = 'Data.csv';
const CSV_FILE_PATH = DATA_PATH + CSV_FILE_NAME;

var _data;
var _headers;

module.exports = {
	LoadDatabase: function(mapping, callback) {
		_fs.exists(DB_FILE_PATH, (exists) => {
			if (!exists) {
				console.log('Database does not exist, creating ' + DB_FILE_NAME + ' and ' + CSV_FILE_NAME + '.');
				_fs.openSync(DB_FILE_PATH, 'w');
				_fs.openSync(CSV_FILE_PATH, 'w');

				_data = {};
				Object.keys(mapping).forEach((key) => {
					_data[mapping[key]] = [];
				});

				CreateNewCsv();
				module.exports.WriteToDatabase();
				module.exports.WriteToCsv();
				console.log('Files created successfully.');
			}
			_data = module.exports.ReadDatabase();
			_headers = Object.keys(_data);

			var recentData = module.exports.GetRecentlyLoggedData();

			Object.keys(recentData).forEach((key) => {
				if (recentData[key] == undefined)
					recentData[key] = 0;
			})

			console.log(DB_FILE_NAME + ' loaded successfully.');
			callback(recentData);
		});

		function CreateNewCsv() {
			var tempHeaders = [];
			var csvData = [];
			Object.keys(_data).forEach((key) => {
				tempHeaders.push(key);
				csvData.push([]);
			});
			module.exports.CsvWriter(csvData, CSV_FILE_PATH, { headers: tempHeaders });
		}
	},
	
	GetRecentlyLoggedData: function() {
		var recentData = {};
		Object.keys(_data).forEach((key) => {
			recentData[key] = _data[key][_data[key].length - 1];
		});
		return recentData;
	},

	WriteToCsv: function() {
		var csvData = module.exports.GetRecentlyLoggedData();
		module.exports.CsvWriter(csvData, CSV_FILE_PATH, { sendHeaders: false }, { flags: 'a' });
	},

	WriteToDatabase: function() {
		_fs.writeFileSync(DB_FILE_PATH, JSON.stringify(_data, null, '\t'));
	},

	AddToDatabase: function(newData) {
		_data[_headers[0]].push(GetCurrentDate());
		var keys = Object.keys(newData);
		for (var i = 1; i < keys.length; i++) {
			_data[_headers[i]].push(newData[keys[i]]);
		}
		module.exports.WriteToDatabase();
		_data = module.exports.ReadDatabase();

		function GetCurrentDate() {
			var today = new Date();
			var dd = today.getDate();
			var mm = today.getMonth() + 1;
			if (dd < 10)
				dd = '0' + dd;
			if (mm < 10)
				mm = '0' + mm;

			return mm + '/' + dd + '/' + today.getFullYear();
		}
	},

	ReadDatabase: function() {
		return JSON.parse(_fs.readFileSync(DB_FILE_PATH))
	},
	
	CsvWriter: function(csvData, filePath, csvWriterArgs, writeStreamArgs) {
		var writer = _csvWriter(csvWriterArgs);
		writer.pipe(_fs.createWriteStream(filePath, writeStreamArgs));
		writer.write(csvData);
		writer.end();
	}
}
