var ProfileParser = {}

ProfileParser.castles = {
	"🇪🇺":"Синий",
	"🇻🇦":"Желтый",
	"🇮🇲":"Красный",
	"🇬🇵":"Черный",
	"🇨🇾":"Белый",
	"🇲🇴":"Мятный", 
	"🇰🇮":"Сумрачный"
}

ProfileParser.stats_regexes = [/⚔️Урон:\s(\d+)/,
/🛡Броня:\s(\d+)/,
/💪Сила:\s(\d+)/,
/🔫Меткость:\s(\d+)/,
/🗣Харизма:\s(\d+)/,
/🤸🏽‍♂️Ловкость:\s(\d+)/];

ProfileParser.parseWW = function(profile) {
	var match = profile.match(/📟Пип-бой 3000 v.+\n.*\n(.+)\n👥Фракция: (.+)/);
	if(!match)
		return;
	var stats_match = [];
	ProfileParser.stats_regexes.forEach(r=> stats_match.push(parseInt(profile.match(r)[1])))
	
	return match == null ? null : {fraction: match[2],nickname: match[1],attack:stats_match[0],armor:stats_match[1],power:stats_match[2],accuracy:stats_match[3],charisma:stats_match[4], skill:stats_match[5]};
}

ProfileParser.parseSW = function (profile) {
	var match = profile.match(/Битва через .+\!\n\n(.+)\((.+)\).*\n🎚(\d+)/);
	var stats_match = profile.match(/🔨\s(\d+)\s+🎓\s(\d+)\n🐿\s(\d+)\s+🐢\s(\d+)/);
	
	return match == null || stats_match == null? null : {level:parseInt(match[3]),corp:match[2],nickname:match[1], practice:parseInt(stats_match[1]), theory:parseInt(stats_match[2]), cunning: parseInt(stats_match[3]), wisdom: parseInt(stats_match[4])};
}

ProfileParser.companies = {
	"🎩Wayne Ent.":"🎩",
	"☂️Umbrella":"☂️",
	"📯Pied Piper":"📯",
	"🤖Hooli":"🤖",
	"⚡️Stark Ind.":"⚡️"
}

ProfileParser.parseCW = function(profile) {
	var match = profile.match(/Битва семи замков через .+!\n\n(🇪🇺|🇻🇦|🇬🇵|🇨🇾|🇲🇴|🇰🇮|🇮🇲)(.+)\,.+\n🏅Уровень: (\d+)/)
	var stats_match = profile.match(/⚔Атака:\s(\d+)\s🛡Защита:\s(\d+)/);
	return match == null || match == null ? null : {castle: match[1] + ProfileParser.castles[match[1]],level:parseInt(match[3]), flag:match[1], nickname:match[2], attack:parseInt(stats_match[1]), def: parseInt(stats_match[2])}
}

module.exports = ProfileParser;