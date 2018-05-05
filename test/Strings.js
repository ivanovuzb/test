function main(data) {
	return {
		setString: function(name, value) {
			try {
				data.strings[name] = value;
				return true;
			} catch (e) {
				console.log(e.toString());
				return false;
			}
		},
		getString: function(name) {
			return (data.strings[name] || "null {\"<code>" + name + "</code>\"}").replaceAll("\\n","\n").replaceAll("$version", data.version);
		}
	}
}

String.prototype.replaceAll = function (s,t) {
	return this.split(s).join(t);
}


module.exports = main;