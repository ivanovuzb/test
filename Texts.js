var randomInteger = require("./randomInteger.js");

function main(data) {
	return {
		isTextGroup: function(g) {
			return data.texts[g] != null;
		},
		addTextGroup: function(g) {
			data.texts[g] = {length:0,keys:[]};
			return true;
		},
		getTextGroups: function() {
			let res = "";
			let groups = Object.keys(data.texts);
	
			if(groups.length == 0)
				return "Groups didn't create";
	
			for(let i = 0; i < groups.length; i++) {
				res += "<code>" + groups[i] + "</code>";
				if(groups.length != (i+1))
					res += ",\n";
			}
	
			return res;
		},
		delTextGroup: function(g) {
			return delete data.texts[g];
		},
		isText: function(g,k) {
			if(!(data.texts[g] != null))
				return false;
			return data.texts[g].keys.indexOf(parseInt(k)) != -1;
		},
		addText: function(g,t) {
			if(!(data.texts[g] != null))
				return false;
		
			let key = data.texts[g].length;
			data.texts[g][key] = t;
			data.texts[g].keys.push(key);
			data.texts[g].length++;
			return key;
		},
		editText: function(g,k,t) {
			if(!(data.texts[g] != null))
				return false;
			if(!(data.texts[g].keys.indexOf(parseInt(k)) != -1))
				return false;
			data.texts[g][k] = t;
			return k;
		},
		delText: function(g,k) {
			if(!(data.texts[g] != null))
				return false;
			if(!(data.texts[g].keys.indexOf(parseInt(k)) != -1))
				return false;
			delete data.texts[g][k];
			data.texts[g].keys = data.texts[g].keys.filter(key => key != k);
			return true;
		},
		getTexts: function(g) {
			if(!(data.texts[g] != null))
				return "Group didn't find";
			let res = "";
			if(data.texts[g].keys.length == 0)
				return "Texts didn't find";
			for(let i = 0; i < data.texts[g].keys.length; i++) {
				let k = data.texts[g].keys[i];
				let t = data.texts[g][k];
				res += "<code>" + k + "</code> = \"" + t + "\"";
				if(data.texts[g].keys.length != (i+1))
					res += ",\n";
			}
			return res;
		},
		getText: function(g) {
			if(!(data.texts[g] != null))
				return "null";
	
			if(data.texts[g].keys.length == 0)
				return "group is empty";
	
			return data.texts[g][data.texts[g].keys[randomInteger(0,data.texts[g].keys.length -1)]];
		}

	}
}

String.prototype.replaceAll = function (s,t) {
	return this.split(s).join(t);
}


module.exports = main;