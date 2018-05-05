
function calcBanTime(minutes, hours, days) {
	minutes = parseInt(minutes);
	hours   = parseInt(hours);
	days    = parseInt(days);
	return parseInt((new Date().getTime()/1000)+(minutes?minutes*60:0)+(hours?hours*60*60:0)+(days?days*24*60*60:0))+1;
}

module.exports = calcBanTime;
