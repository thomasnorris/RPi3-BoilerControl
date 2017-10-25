
var _dbo = require('./database-operations'),
	_schedule = require('node-schedule'),
	_rl = require('readline').createInterface({ input: process.stdin, output: process.stdout }),
	_dto = require('./date-time-operations');

var _mapping = {
	DATE: 'Date',
	WELL_RECHARGE_COUNTER: 'Recharge Counter',
	COLUMBIA_TIMER: 'Columbia Timer',
	WELL_TIMER: 'Well Timer',
	CFH_COUNTER : 'Call For Heat Counter'
}

var _newData = [];

_dbo.LoadDatabase(_mapping, (recentData) => {
	_newData = recentData;
	
	Fill(() => {
		console.log('Files created with dummy data.\nEnter \"a\" to run a test archive.\nEnter \"e\" to exit.');
		_rl.on('line', (input) => {
			if (input == 'a') {
				_dbo.CreateArchives();
				console.log('Archive completed, exiting...');
			}
			else if (input == 'e') 
				console.log('Exiting.')
			_rl.close();
		});
	});
}, true);

function Fill(callback) {
	var i = 0;
	var max = 90;
	_newData[_mapping.WELL_TIMER] = max;
	var interval = setInterval(() => {
		if (i != max) {
			++_newData[_mapping.WELL_RECHARGE_COUNTER];
			++_newData[_mapping.COLUMBIA_TIMER];
			--_newData[_mapping.WELL_TIMER];
			_newData[_mapping.CFH_COUNTER] = Math.floor(Math.random() * (max - 1) + i);
			_dbo.AddToDatabase(_newData);
			_dbo.WriteToCsv();
			i++;
		} else {
			clearInterval(interval);
			callback();
		}
	}, 10);
}