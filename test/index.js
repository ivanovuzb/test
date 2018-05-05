var token = "551431146:AAHeRkNpNg3wFEMql9ue0b-5ez_Lg6TEkS4";

var TelegramBot   = require("node-telegram-bot-api");
var ProfileParser = require("./parser.js");
var jsonFormat    = require("json-format");
var fs            = require("fs"); 
var calcBanTime   = require("./calcBanTime.js");
var getChatMessagesTop = require("./getChatMessagesTop.js");
var getDuelsTop   = require("./getDuelsTop.js");
var getChatForbseTop = require("./getChatForbseTop.js");
var randomInteger = require("./randomInteger.js");
var getPassport   = require("./getPassport.js");
const allah       = 149136604; 
const support_cid = -1001192791246;
const guardians_cid = -1001248155115;
const passport_cid = -1001156685603;
const log_cid     = -1001323185011;
const manda_cid   = -1001323325082;
const duels_cid   = -1001161537477;
const trade_cid   = -1001180645402;
const paytax = 1;
const banker = 314955372;
var data          = {}; 
 
try {
    data = JSON.parse(fs.readFileSync('data.json', 'utf8').toString());
	
    		
    if(data.users == undefined)
    	data.users = {};
    
    if(data.admins == undefined)
    	data.admins = [];
    
    if(data.sadmins == undefined)
    	data.sadmins = [allah];
    
    if(data.strings == undefined)
    	data.strings = {};
    
    if(data.welcomes != undefined)
    	delete data.welcomes;
    
    if(data.uwelcomes != undefined)
    	delete data.uwelcomes;
    
    if(data.version == undefined) 
    	data.version = "1.0";
    
    if(data.messagesCount == undefined)
        data.messagesCount = 0;
        
    if(data.links == undefined)
    	data.links = {};
        
    if(data.texts == undefined)
    	data.texts = {}
    
    if(data.passCost == undefined)
    	data.passCost = 50;
    
    // new
    if(data.election == undefined)
    	data.election = {started:false, candidates:[], voters:[]};
 
    fs.writeFileSync('data.json', jsonFormat(data), 'utf8');
} catch(error) {
	process.exit();
}

/************************************************************/

var { getString, setString } = require("./Strings.js")(data);
var { addText, addTextGroup, delText, delTextGroup, editText, getText, getTextGroups, getTexts, isText, isTextGroup } = require("./Texts.js")(data);

/************************************************************/

var bot = new TelegramBot(token, {polling:true});
bot.sendMessage(log_cid, "Bot Started At " + new Date().toString()); 

/************************************************************/

function log(data) {
	if(typeof data == "object")
		return bot.sendMessage(log_cid,"[" + Date().match(/\d+:\d+:\d+/)[0] + "] data = " + JSON.stringify(data), {parse_mode:"html"});
	if(data == null)
		return bot.sendMessage(log_cid,"[" + Date().match(/\d+:\d+:\d+/)[0] + "] data = null");
	bot.sendMessage(log_cid,"[" + Date().match(/\d+:\d+:\d+/)[0] + "] data = " + data.toString(), {parse_mode:"html"});
}

function saveData() {
	fs.writeFile('data.json', jsonFormat(data), 'utf8',  (err) => {
		if (err) log(err.toString());
		console.log("saved at" + new Date().toString());
	});
}

function infoBanTime(minutes, hours, days) {
	let ibantime = (minutes ? minutes : 0 + "m ") + " " + (hours ? hours : 0 + "h ")  + " " + (days ? days : 0 + "d ") + " ";

	return ibantime;
}

function payBanker(m) {
	data.users[banker].money += m;
	return;
}


/************************************************************/
// new

function startElection() {
	data.election.started = true;
}

function stopElection() {
	data.election.started = false;
}

function addCandidate(id, link) {
	data.election.candidates.push({id:id,link:link,voters:[]});
}

function delCandidate(id) {
	data.election.candidates = data.election.candidates.filter(c => c.id != id);
}

function clearElection() {
	data.election = {started:false, candidates:[], voters:[]};
}


/************************************************************/

function getLink(name) {
	return data.links[name] || "null {" + name + "}";
}

function setLink(name, value) {
	try {
		data.links[name] = value;
		return true;
	} catch (e) {
		console.log(e.toString());
		return false;
	}
	
}

/************************************************************/


function sleep(ms) {
	return new Promise(resolve => setTimeout(resolve, ms));
}


/************************************************************/

//new
function isCitizen(id) {
	if(data.users[id] == null)
		return false;
	return data.users[id].passport != null && data.users[id].passport.file != null;
}

function isSuperAdmin(id) {
	return data.sadmins.indexOf(id) != -1;
}

function isAdmin(id) {
	return isSuperAdmin(id) || data.admins.indexOf(id) != -1;
}

async function isChatAdmin(cid,uid) {
	try {
		let m = await bot.getChatMember(cid,uid);
		return m == null ? false : m.status == "administrator" || m.status == "creator";
	} catch(e) {return false;}
}

function setAdmin(id) {
	if(isAdmin(id)) 
		return;
	data.admins.push(id);
	data.sadmins = data.sadmins.filter(v => v != id);
}

function setUser(id) {
	if(!isAdmin(id)) 
		return;
	data.admins = data.admins.filter(v => v != id);
	data.sadmins = data.sadmins.filter(v => v != id);
}

function setSuperAdmin(id) {
	if(isSuperAdmin(id)) 
		return;
	data.admins = data.admins.filter(v => v != id);
	data.sadmins.push(id);
}

/************************************************************/

function userToString(user) {
	return "<a href=\"tg://user?id=" + user.id.toString() + "\">" + user.first_name + (user.last_name == null ? "" : " " + user.last_name) + "</a>"
}

function userToString2(user) {
	let userm = user.id.toString()
	return "Name: <code>" + user.first_name + (user.last_name == null ? "" : " " + user.last_name) + "</code>\n" +
		   "ID: <code>" + user.id + "</code>" + 
		   (user.username == null ? "" : "\nUsername: <code>@" + user.username + "</code>") +
			 "\nLink: " + userToString(user) + "\nBalance: " + data.users[user.id].money;
}

/************************************************************/

function getKeyboard(name) {
	if(name == "main") {
		return {
			resize_keyboard:true,
			keyboard: [
				[{text:getString("profile_button")}, {text:getString("castle_button")}],
				[{text:getString("feedback_button")}]
			]
		};
	}
	
	if(name == "feedback") {
		return {
			resize_keyboard:true,
			keyboard: [
				[{text:getString("back_button")}, {text:getString("guardians_button")}],
				[{text:getString("support_button")}, {text:getString("court_button")}]
			]
		};
	}
	
	if(name == "castle") {
		return {
			resize_keyboard:true,
			keyboard: [
				[{text:getString("citizenship_button")}, {text:getString("laws_button")}],
				[{text:getString("mass_media_button")}, {text:getString("registar_button")}, {text:getString("back2_button")}]
			]
		};
	}
	
	if(name == "support") {
		return {
			resize_keyboard:true,
			keyboard: [
				[{text:getString("send_button")}],
				[{text:getString("back2_button")}]
			]
		};
	}

	if(name == "guardians") {
		return {
			resize_keyboard:true,
			keyboard: [
				[{text:getString("send_button")}],
				[{text:getString("back2_button")}]
			]
		};
	}
	
	if(name == "citizenship") {
		return {
			resize_keyboard:true,
			keyboard: [
				[{text:getString("register_button")},{text:getString("login_button")}],
				[{text:getString("back3_button")}]
			]
		};
	}
	
	if(name == "registration") {
		return {
			resize_keyboard:true,
			keyboard: [
				[{text:getString("cancel_registration_button")}]
			]
		};
	}
}

/************************************************************/

function InlineButton(name, url) {
	this.text = getString(name);
	this.callback_data = name;
	this.url = url
}

/************************************************************/

function getInlineKeyboard(name) {
	if(name == "quest") {
		return {
			inline_keyboard: [
				[new InlineButton("search_button"), new InlineButton("get_out_button")]
			]
		};
	}
	
	if(name == "quest2") {
		return {
			inline_keyboard: [
				[new InlineButton("sing_button"), new InlineButton("attack_button")],
				[new InlineButton("show_richness_button")]
			]
		};
	}
	
	if(name == "quest3") {
		return {
			inline_keyboard: [
				[new InlineButton("saddle_button")]
			]
		};
	}
	
	if(name == "try_again") {
		return {
			inline_keyboard: [
				[new InlineButton("try_again_button")]
			]
		};
	}
	
	if(name == "mass_media") {
		return {
			inline_keyboard: [
				[new InlineButton("allowed_media_button")]
			]
		};
	}
	
	if(name == "compact") {
		return {
			inline_keyboard: [
				[new InlineButton("compact_profile_button")]
			]
		};
	}
	
	if(name == "full_profile") {
		return {
			inline_keyboard: [
				[new InlineButton("full_profile_button")]
			]
		};
	}
	
	if(name == "show_smi") {
		return {
			inline_keyboard: [
				[new InlineButton("show_smi_button")]
			]
		};
	}
	
	if(name == "new_member") {
		return {
			inline_keyboard: [
				[new InlineButton("enter_button", "https://t.me/MandarineCastleBot?start=enter")],
				[new InlineButton("rules_button", "http://telegra.ph/Sekrety-pravilnogo-obshcheniya-04-11")]

			]
		};
	}
	
	if(name == "old_member_enter") {
		return {
			inline_keyboard: [
				[new InlineButton("saddle2_button", "https://t.me/MandarineCastleBot?start=enter")],
				[new InlineButton("rules_button", "http://telegra.ph/Sekrety-pravilnogo-obshcheniya-04-11")]
			]
		};
	}
	
	
}

/************************************************************/

function getUdataByUsername(uname) {
	uname = uname.toLowerCase();
	let res = null;
	Object.keys(data.users).forEach(id => (data.users[id].userinfo.username ? data.users[id].userinfo.username.toLowerCase() == uname : false) ? res = data.users[id] :null);
	return res;
}
function forEachUsers(f) {
	Object.keys(data.users).forEach(id => f(data.users[id]));
}
/************************************************************/

function loadUpdate() {
	try {
		data.version = "1.2";
		Object.keys(data.users).forEach(id => data.users[id].reg ? data.users[id].reg = null:null);
		setString("passport_accepted","Поздравляю! Теперь вы полноправный гражданин <b> 🍊Мандаринового Замка!</b>");
		setString("passport_declined","Старику не удалось оформить тебе паспорт. - <b> Что то пошло не так. Ты точно сделл все как надо?</b>");
		setString("you_have_passport", " Подойдя к Старику ты назвал свое имя, и бородатый дядька начал листать какие-то бумажки. \\n Спустя некоторое время он с удивлением посмотрел на тебя и сказал: <b>Но... У тебя уже есть паспорт?! Зачем тебе еще один?! Хочешь сменить? жди апдейты!</b>");
		setString("already_citizhen_text", "Скоро тут появиться <b>🌳Мандариновый Сад</b> и <b>Логово Дракона.</b> А пока иди, погуляй");
		setString("wait_reg", "Ты зарегистрировал заявку на мандариновое гражданство. Вскоре с тобой свяжется @ivanovuz по вопросам оплаты, после чего ты получишь свой паспорт 👤Гражданина 🇧🇹Мандаринового Замка!");
		setString("no_reg_money", "<b>—  Хорошо-хорошо, регистрация будет стоить 50🏵 Апельсинок</b> — почесывая бородку продолжал страж 🌳Мандаринового сада с хитрой ухмылкой <b>Не хватает деньжат? Я знаю пару ребят в  </b>@mandatrade.<b> Спроси там, они подскажут как разбогатеть.</b>");
		setString("reg_accepted", " — <b>Теперь распишись здесь. И здесь. А еще здесь галочку... </b>— седой страж, довольно улыбаясь, быстро пробежался взглядом по своим бумагам — <b>Браво! Все документы готовы, осталось лишь оплатить и поставить печать!</b> \\nПоздравляем! Ты зарегистрировал заявку на <b>мандариновое гражданство</b>. Вскоре с тобой свяжется @ivanovuz по вопросам оплаты, после чего ты получишь свой паспорт 👤<b>Гражданина 🇧🇹Мандаринового Замка!</b>");
		setString("registration_text","—  <b>Хорошо-хорошо, регистрация будет стоить 🏵$cost </b>— почесывая бородку продолжал страж 🌳<b>Мандаринового сада </b>с хитрой ухмылкой — <b>Мне нужно всего немного информации о тебе, чтобы записать в бланк. Для начала, как тебя зовут?</b>\\n\\nНапиши свое имя <b>кирилицей</b> или <b>латиницей</b> не длинее 20 символов с учетом пробелов.");
		setString("update_text","История обновлений 🇧🇹Мандаринового дракона http://telegra.ph/Istoriya-obnovlenij-Mandarinovogo-drakona-04-12");
		saveData();
		bot.sendMessage(allah, "Update loaded");
	} catch(e) {
		log(e.toString());
	}
}

/************************************************************/

function getProfile(udata) {
	var res = "";
	res += "👤<a href='tg://user?id=" + udata.userinfo.id + "'>" +  udata.userinfo.first_name + (udata.userinfo.last_name ? " " + udata.userinfo.last_name : "")+"</a>\n";
	res += udata.passport ? "<b>💳MC " + udata.passport.mc + "</b>\n" : "";
	res += "🏵<b>" + (udata.money ? udata.money : (udata.money = 0)) + "</b>\n\n";
	if(udata.profiles != null) {
		res += udata.profiles.cw ? "<b>CW</b>: " + udata.profiles.cw.flag + udata.profiles.cw.level + "\n" : "";
		res += udata.profiles.sw ? "<b>SW</b>: " + ProfileParser.companies[udata.profiles.sw.corp] + udata.profiles.sw.level + "\n" : ""
		res += udata.profiles.ww ? "<b>WW</b>: " + udata.profiles.ww.fraction.replace(/[а-я\s]+/ig,"") + "\n" : ""
		res += "\n";
	}
	res += "<b>🏅" + (udata.duels ? udata.duels : 0) +  " 🎗" + (udata.contests ? udata.contests : 0) + " 🏆" + ((udata.contestWins ? udata.contestWins : 0) + (udata.duelWins ? udata.duelWins : 0))+ "\n\n";
	
	res += "📱 " + (udata.msgCount ? udata.msgCount : (udata.msgCount = 0)).toString() + "\n";
	res += "📺 " + (udata.tv ? udata.tv : 0) + " ⚖️ " + (udata.courts ? udata.courts : 0) + "\n</b>";
	res += "💍 " + (udata.wedlock ? userToString(data.users[udata.wedlock].userinfo) : "<b>Не в браке</b>") + "\n\n"

	res += "<b>Настройки </b>/settings\n<b>Активность </b>/activity";
	res += udata.passport != null ? (udata.passport.file != null ? "\n<b>Паспорт</b> /passport": "") : "";
	return res;
}

function getFullProfile(udata) {
	var res = "";
	res += "👤<a href='tg://user?id=" + udata.userinfo.id + "'>" +  udata.userinfo.first_name + (udata.userinfo.last_name ? " " + udata.userinfo.last_name : "")+"</a>\n";
	res += udata.passport ? "<b>💳MC " + udata.passport.mc + "</b> <code>" + udata.userinfo.id + "</code>\n" : "";
	res += "🏵Апельсинок: <b>" + (udata.money ? udata.money : (udata.money = 0)) + "</b>\n\n";
	if(udata.profiles != null) {
		res += udata.profiles.cw ? "<b>ChatWars</b>:<i> " + udata.profiles.cw.castle + " замок</i>, <b>"+ udata.profiles.cw.level + "</b>\n<b>" + udata.profiles.cw.nickname + "\n⚔️" + udata.profiles.cw.attack + " 🛡" + udata.profiles.cw.def + "</b>\n\n": "";
		res += udata.profiles.sw ? "<b>StartupWars</b>: <i>" + udata.profiles.sw.corp + "</i>,<b> " + udata.profiles.sw.level + "\n" + udata.profiles.sw.nickname + "\n🔨" + udata.profiles.sw.practice + "    🎓" + udata.profiles.sw.theory + "\n🐿" + udata.profiles.sw.cunning + "    🐢" + udata.profiles.sw.wisdom + "</b>\n\n" : ""
		res += udata.profiles.ww ? "<b>WastelandsWars</b>: <i>" + udata.profiles.ww.fraction + "</i>\n<b>" + udata.profiles.ww.nickname + "\n⚔" + udata.profiles.ww.attack + " 🛡" + udata.profiles.ww.armor + "\n💪" + udata.profiles.ww.power + " 🔫" + udata.profiles.ww.accuracy + "\n🗣" + udata.profiles.ww.charisma + " 🤸🏽‍♂️" + udata.profiles.ww.skill +  "</b>\n\n" : ""
		res += "\n";
	}
	res += "🏅Дуэлей: <b>" + (udata.duels ? udata.duels : 0) + "</b>\n";
	res += "🎗Конкурсов: <b>" + (udata.contests ? udata.contests : 0) + "</b>\n";
	res += "🏆Побед: <b>" + ((udata.contestsWin ? udata.contestsWin : 0) + (udata.duelWins ? udata.duelWins : 0))+ "</b>\n\n";
	
	res += "📱Сообщений: <b>" + (udata.msgCount ? udata.msgCount : (udata.msgCount = 0)).toString() + "</b>\n";
	res += "📺Упоминаний: <b>" + (udata.tv ? udata.tv : 0) + "</b>\n";
	res += "⚖️Судимостей: <b>" + (udata.courts ? udata.courts : 0) + "\n</b>";
	res += "💍" + (udata.wedlock ? "Брак с " + userToString(data.users[udata.wedlock].userinfo) : "<b>Не в браке</b>") + "\n\n"

	res += "<b>Настройки </b>/settings\n<b>Активность </b>/activity";
	res += udata.passport != null ? (udata.passport.file != null ? "\n<b>Паспорт</b> /passport": "") : "";
	return res;
}

/************************************************************/

async function newBroadcast(text) {
	var ids = [];
	Object.keys(data.users).forEach(id => data.users[id].started ? ids.push(parseInt(id)):null);
	for(let i = 0; i < ids.length; i++) {
		try {
			await bot.sendMessage(ids[i], text, {parse_mode:"html"});
		} catch(e) {
			log(ids[i]);
			log(e.toString());
		}
		if((i % 25) == 0)
			await sleep(2500);
	}
}

/************************************************************/

bot.on("message", async (msg) => {
	data.messagesCount++;
	var text = msg.text;
	var uid = msg.from ? msg.from.id : -1;
	var uname = msg.from ? msg.from.username : null;
	var cid = msg.chat.id;
	var mid = msg.message_id;
	if(msg.from != null && data.users[uid] == undefined) {
		bot.sendMessage(log_cid, userToString(msg.from) + " added to db at " + new Date().toString(), {parse_mode:"html"});
		data.users[uid] = {
			userinfo: msg.from,
			status: 0,
			started: false
		};
		saveData();
	} else {
		data.users[uid].userinfo = msg.from;
	}
	
	try {
	
		if(text != undefined && msg.chat.type == "private")
			await privateParseText(msg);
		
		if(text != undefined && (msg.chat.type == "supergroup" || msg.chat.type == "group"))
			await publicParseText(msg);
		
		if(msg.chat.type == "private")
			await parseStatus(msg);
			
		if(msg.chat.id == duels_cid && text != null)
			await parseDuel(msg);
	
	} catch(e) {
		log(e.toString());
	}
	
});

/************************************************************/

bot.on("new_chat_members",async (ncms) => {
	if(ncms.new_chat_member == null)
		return;
	
	var fname = ncms.new_chat_member.first_name;
	var cid = ncms.chat.id;
	var id = ncms.new_chat_member.id;
	
	if(data.users[id] == null) {
		bot.sendMessage(cid, getText("welcome").replace("$name", "<a href='tg://user?id=" + id + "'>" + fname + "</a>"), {parse_mode:"html",disable_web_page_preview:true, reply_markup: getInlineKeyboard("new_member")}); 
	} else if(!data.users[id].started) {
		bot.sendMessage(cid, getText("welcome").replace("$name", "<a href='tg://user?id=" + id + "'>" + fname + "</a>"), {parse_mode:"html",disable_web_page_preview:true, reply_markup: getInlineKeyboard("new_member")}); 
	} else {
		bot.sendMessage(cid, getText("user_welcome").replace("$name", "<a href='tg://user?id=" + id + "'>" + fname + "</a>"), {parse_mode:"html",disable_web_page_preview:true, reply_markup: getInlineKeyboard("old_member_enter")}); 
	}
});

/************************************************************/

bot.on("callback_query", async (cb) => {
	var cid = cb.message.chat.id;
	var mid = cb.message.message_id;
	var udata = data.users[cb.from.id];
	switch(cb.data) {
		case "get_out_button":
			if(udata.started) {
				return;
			}
			try {
				await bot.editMessageText(getString("get_out_text"),{message_id:mid,chat_id:cid, parse_mode:"html", reply_markup:getInlineKeyboard("try_again")});
				await bot.editMessageReplyMarkup(getInlineKeyboard("try_again"), {message_id:mid,chat_id:cid});
			} catch(e) {
				log(e.toString());
			}
			break;
		case "try_again_button":
			if(udata.started) {
				return;
			}
			try {
				await bot.editMessageText(getString("start"),{message_id:mid,chat_id:cid, parse_mode:"html",disable_web_page_preview:true});
				await bot.editMessageReplyMarkup(getInlineKeyboard("quest"), {message_id:mid,chat_id:cid});
			} catch(e) {
				log(e.toString());
			}
			break;
		case "search_button":
			if(udata.started) {
				return;
			}
			try {
				await bot.editMessageReplyMarkup({}, {message_id:mid,chat_id:cid});
				await bot.sendMessage(cid, getString("search_text"), {parse_mode:"html",reply_markup:getInlineKeyboard("quest2")});
			} catch(e) {
				log(e.toString());
			}
			break;
		case "sing_button":
			if(udata.started) {
				return;
			}
			try {
				udata.money = 20
				await bot.editMessageReplyMarkup({}, {message_id:mid,chat_id:cid});
				await bot.sendMessage(cid, getString("sing_text"), {parse_mode:"html",reply_markup:getInlineKeyboard("quest3")});
				saveData();
			} catch(e) {
				log(e.toString());
			}
			break;
		case "attack_button":
			if(udata.started) {
				return;
			}
			try {
				udata.money = 30
				await bot.editMessageReplyMarkup({}, {message_id:mid,chat_id:cid});
				await bot.sendMessage(cid, getString("attack_text"), {parse_mode:"html",reply_markup:getInlineKeyboard("quest3")});
				saveData();
			} catch(e) {
				log(e.toString());
			}
			break;
		case "show_richness_button":
			if(udata.started) {
				return;
			}
			try {
				udata.money = 10
				await bot.editMessageReplyMarkup({}, {message_id:mid,chat_id:cid});
				await bot.sendMessage(cid, getString("show_richness_text"), {parse_mode:"html",reply_markup:getInlineKeyboard("quest3")});
				saveData();
			} catch(e) {
				log(e.toString());
			}
			break;
		case "saddle_button":
			if(udata.started) {
				return;
			}
			try {
				udata.started = true;
				await bot.editMessageReplyMarkup({}, {message_id:mid,chat_id:cid});
				await bot.sendMessage(cid, getString("saddle_text").replace("NNNN",udata.money), {parse_mode:"html",reply_markup:getKeyboard("main"),disable_web_page_preview:true});
				udata.menu = "main";
				saveData();
			} catch(e) {
				log(e.toString());
			}
			break;
		case "allowed_media_button":
			try {
				await bot.editMessageText(getString("allowed_media_text"),{message_id:mid,chat_id:cid, parse_mode:"html",disable_web_page_preview:true});
				await bot.editMessageReplyMarkup(getInlineKeyboard("show_smi"), {message_id:mid,chat_id:cid});
			} catch(e) {
				log(e.toString());
			}
			break;
		case "full_profile_button":
			try {
				await bot.editMessageText(getFullProfile(udata),{message_id:mid,chat_id:cid, parse_mode:"html",disable_web_page_preview:true});
				await bot.editMessageReplyMarkup(getInlineKeyboard("compact"), {message_id:mid,chat_id:cid});
			} catch(e) {
				log(e.toString());
			}
			break;
		case "compact_profile_button":
			try {
				await bot.editMessageText(getProfile(udata),{message_id:mid,chat_id:cid, parse_mode:"html",disable_web_page_preview:true});
				await bot.editMessageReplyMarkup(getInlineKeyboard("full_profile"), {message_id:mid,chat_id:cid});
			} catch(e) {
				log(e.toString());
			}
			break;
		case "show_smi_button":
			try {
				await bot.editMessageText(getString("mass_media_text"),{message_id:mid,chat_id:cid, parse_mode:"html",disable_web_page_preview:true});
				await bot.editMessageReplyMarkup(getInlineKeyboard("mass_media"), {message_id:mid,chat_id:cid});
			} catch(e) {
				log(e.toString());
			}
			break;
	}
	
});

/************************************************************/

// new
async function privateParseText(msg) {
	var text = msg.text;
	var match = text.match(/^\/([a-zа-я_0-9]+) ?(.*)$/i);
	if(match != null) 
		await privateParseCommand(msg, text, match);
	else
		await parseButton(msg, text);
}

//new
async function publicParseText(msg) {
	var text = msg.text;
	var uid = msg.from.id;
	var match = text.match(/^\/([a-zа-я_0-9]+) ?(.*)$/i);
	if(match != null) 
		await publicParseCommand(msg, text, match);
	
	if(text.length >= 20 && msg.forward_from == null && msg.forward_from_chat == null) {
		data.users[uid].msgCount = data.users[uid].msgCount == null ? 1 : data.users[uid].msgCount + 1;
		if(data.users[uid].msgCount == 10 && data.version == "V1.2") {
			data.users[uid].money += 50;
		}
		saveData();
	}
}

/************************************************************/

async function privateParseCommand(msg, text, match) {
	var uid = msg.from.id;
	var uname = msg.from.username;
	var cid = msg.chat.id;
	var mid = msg.message_id;
	var udata = data.users[uid];
	
	var command = match[1].toLowerCase();
	var args    = match[2];
	
	/**  ---USER COMMANDS--- **/
	
	if(command == "start" && !udata.started) {
		if(udata.questStarted == null)
			bot.sendMessage(log_cid, userToString(msg.from) + " started bot at " + new Date().toString(), {parse_mode:"html"});
		udata.questStarted = true;
		bot.sendMessage(cid, getString("start"), {parse_mode:"html",reply_markup:getInlineKeyboard("quest")});
		udata.menu = "none";
		saveData();
	}
	
	if(udata.status != 0)
		return;
	
	if(!udata.started) 
		return;
		
	if(command == "main" || command == "start") {
		bot.sendMessage(cid, getString("start2"),{parse_mode:"html",reply_markup:getKeyboard("main"), disable_web_page_preview:true});
		udata.menu = "main";
		udata.status = 0;
		saveData();
	}
	
	if(command == "history") {
		bot.sendMessage(cid, getString("history_text"),{parse_mode:"html",reply_markup:getKeyboard("main")});
		udata.menu = "main";
		udata.status = 0;
		saveData();
	}
	
	if(command == "update") {
		bot.sendMessage(cid, getString("update_text"),{parse_mode:"html"});
		saveData();
	}
	
	if(command == "about") {
		bot.sendMessage(cid, getString("about_text"),{parse_mode:"html",reply_markup:getKeyboard("main")});
		udata.menu = "main";
		udata.status = 0;
		saveData();
	}
	
	if(command == "activity") {
		bot.sendMessage(cid, getString("activity_text"),{parse_mode:"html",reply_markup:getKeyboard("main")});
		udata.menu = "main";
		udata.status = 0;
		saveData();
	}
	
	if(command == "settings") {
		bot.sendMessage(cid, getString("settings_text"),{parse_mode:"html",reply_markup:getKeyboard("main")});
		udata.menu = "main";
		udata.status = 0;
		saveData();
	}
	
	if(command == "support") {
		bot.sendMessage(cid, getString("support_text"), {parse_mode:"html",reply_markup:getKeyboard("support")});
		udata.status = 1;
		udata.messages = [];
		udata.menu = "support";
	}
	
	if(command == "topcm") {
		bot.sendMessage(cid,getChatMessagesTop(data, getString, uid), {parse_mode:"html"});
	}
	
	if(command == "topm") {
		bot.sendMessage(cid,getChatForbseTop(data, getString, uid), {parse_mode:"html"});
	}

	if(command == "topduels" || command == "topd") {
		bot.sendMessage(cid,getDuelsTop(data, getString, uid), {parse_mode:"html"});
	}
	
	if(command == "passport") {
		if(udata.passport != null && udata.passport.file != null) {
			bot.sendSticker(cid, udata.passport.file);
		} else {
			if(udata.profiles == null) {
				bot.sendMessage(cid, getString("send_profile_text"),{parse_mode:"html",disable_web_page_preview:true});
				return;
			}
			bot.sendMessage(cid, getString("enough_citizenship_text"),{parse_mode:"html",reply_markup:getKeyboard("citizenship")});
			udata.menu = "citizenship";
			saveData();
		}
	}
	// new
	if(command == "vote") {
		
		if(!data.election.started)
			return bot.sendMessage(cid, getString("election_didnt_start"), {parse_mode:"html"});
		
		if(!isCitizen(uid))
			return bot.sendMessage(cid, getString("no_passport"), {parse_mode:"html"});
		
		let res = getString("election_title");
		let candidates = data.election.candidates;
		if(data.election.voters.indexOf(uid) != -1) {
			res += "\n\n";
			for(let i = 0; i < candidates.length; i++) {
				res += "Кандидат <i>#" + (i+1) + "</i>: @" + data.users[candidates[i].id].userinfo.username;
				res += "\n";
				res += "[<a href='" + candidates[i].link + "'>Прочитать программу</a>]"
				res += "\n";
				res += "<b>" + ((candidates[i].voters.length*100)/data.election.voters.length).toFixed(1) + "%</b>";
				res += "\n\n";
			}
			res += getString("all_voted") + data.election.voters.length;
		} else {
			res += "\n\n";
			for(let i = 0; i < candidates.length; i++) {
				res += "Кандидат <i>#" + (i+1) + "</i>: @" + data.users[candidates[i].id].userinfo.username;
				res += "\n";
				res += "[<a href='" + candidates[i].link + "'>Прочитать программу</a>]"
				res += "\n";
				res += "/vote" + (i+1).toString();
				if((i+1) != candidates.length)
					res += "\n\n";
			}
		}
		bot.sendMessage(cid, res, {parse_mode:"html", disable_web_page_preview:true});
	}
	
	if(command.startWith("vote") && command != "vote" && !command.startWith("voters")) {
		if(data.election.voters.indexOf(uid) != -1)
			return bot.sendMessage(cid, getString("you_already_voted"), {parse_mode:"html"});
			
		let m = command.match(/vote(\d+)/);
		if(m == null)
			return bot.sendMessage(cid, getString("candidate_not_found"), {parse_mode:"html"});
			
		let pos = parseInt(m[1]) - 1;
		if(data.election.candidates[pos] == null)
			return bot.sendMessage(cid, getString("candidate_not_found"), {parse_mode:"html"});
		
		data.election.voters.push(uid);
		data.election.candidates[pos].voters.push(uid);
		saveData();
		bot.sendMessage(cid, getString("thx_for_vote"), {parse_mode:"html"});
	}
	
	/**  ---ADMIN COMMANDS---     **/
	if(!isAdmin(uid))
		return;
		
	if(command == "ping") {
		bot.sendMessage(cid, "Pong!", {reply_to_message_id:mid});
		log("Pong!");
	}
	
	if(command == "addtext") {
		if(args == "" || args == undefined)
			return bot.sendMessage(cid, "Invalid command syntax");
		
		let m = args.match(/([a-z_0-9]+)\s(.+)/);
		if(m == null)
			return bot.sendMessage(cid, "Invalid command syntax");
			
		bot.sendMessage(cid, "id = " + addText(m[1], m[2]));
		saveData();
	}
	
	if(command == "addtextgroup") {
		if(args == "" || args == undefined)
			return bot.sendMessage(cid, "Invalid command syntax");
		
		let m = args.match(/^([a-z_0-9]+)$/);
		if(m == null)
			return bot.sendMessage(cid, "Invalid command syntax");
			
		bot.sendMessage(cid, "group = " + addTextGroup(args));
		saveData();
	}
	
	if(command == "deltextgroup") {
		if(args == "" || args == undefined)
			return bot.sendMessage(cid, "Invalid command syntax");
		
		let m = args.match(/^([a-z_0-9]+)$/);
		if(m == null)
			return bot.sendMessage(cid, "Invalid command syntax");
			
		bot.sendMessage(cid, "" + delTextGroup(args));
		saveData();
	}
	
	if(command == "gettextgroups") {
		bot.sendMessage(cid, getTextGroups(), {parse_mode:"html"});
	}
	
	if(command == "gettexts") {
		if(args == "" || args == undefined)
			return bot.sendMessage(cid, "Invalid command syntax");
		
		let m = args.match(/^([a-z_0-9]+)$/);
		if(m == null)
			return bot.sendMessage(cid, "Invalid command syntax");
			
		bot.sendMessage(cid, getTexts(args), {parse_mode:"html"});
	}
	
	if(command == "edittext") {
		if(args == "" || args == undefined)
			return bot.sendMessage(cid, "Invalid command syntax");
		
		let m = args.match(/^([a-z_0-9]+)\s(\d+)\s(.+)$/);
		if(m == null)
			return bot.sendMessage(cid, "Invalid command syntax");
			
		bot.sendMessage(cid, editText(m[1],m[2],m[3]));
		saveData();
	}
	
	if(command == "deltext") {
		if(args == "" || args == undefined)
			return bot.sendMessage(cid, "Invalid command syntax");
		
		let m = args.match(/^([a-z_0-9]+)\s(\d+)$/);
		if(m == null)
			return bot.sendMessage(cid, "Invalid command syntax");
			
		bot.sendMessage(cid, delText(m[1],m[2]));
		saveData();
	}
	
	if(command == "userscount") {
		bot.sendMessage(cid, Object.keys(data.users).length.toString());
	}
	if(command == "messagescount") {
		bot.sendMessage(cid, data.messagesCount.toString());
	}
	if(command == "moneycount") {
		var res = 0;
		forEachUsers( u => u.money ? res += u.money : 0);
		bot.sendMessage(cid,res.toString());
	}
	if(command == "citizencount") {
		var res = 0;
		forEachUsers( u => u.passport != null && u.passport.file != null ? res++ : 0);
		bot.sendMessage(cid,res.toString());
	}
	/**  ---SUPERADMIN COMMANDS--- **/
	if(!isSuperAdmin(uid))
		return;
		
	if(command == "o") {
		let ud = data.users[args];
		if(ud == null)
			return
			
		try {
			await bot.sendMessage(uid,"User:\n" + userToString2(ud.userinfo) ,{parse_mode:"html"});
			
		} catch(e) {
			log(e.toString());
		}
	}
	
	if(command == "setstring") {
		if(args == "" || args == undefined)
			return bot.sendMessage(cid, "Invalid command syntax");
		
		let m = args.match(/^([a-z_0-8]+) \"(.+)\"$/i);
		if(m == null)
			return bot.sendMessage(cid, "Invalid command syntax");
		
		setString(m[1], m[2]);
		await bot.sendMessage(cid,"string "+ m[1]+ " = \""+ m[2] + "\"");
		saveData();
	}
	
	if(command == "getstring") {
		if(args == "" || args == undefined)
			return bot.sendMessage(cid, "Invalid command syntax");
			
		let m = args.match(/^[a-z_0-8]+$/i);
		if(m == null)
			return bot.sendMessage(cid, "Invalid command syntax");
			
		await bot.sendMessage(cid,"string "+ args + " = \""+ getString(args) + "\"");
	}
	
	if(command == "getstrings") {
		try {
			await bot.sendMessage(cid,JSON.stringify(Object.keys(data.strings)).replace(/"([a-zа-я0-9_]+)"/gi,"\"<code>$1</code>\""), {parse_mode:"html"});
		} catch(e) {
			log(e.toString());
		}
	}
	
	if(command == "setlink") {
		if(args == "" || args == undefined)
			return bot.sendMessage(cid, "Invalid command syntax");
		
		let m = args.match(/^([a-z_0-8]+) (.+)$/i);
		if(m == null)
			return bot.sendMessage(cid, "Invalid command syntax");
		
		setLink(m[1], m[2]);
		await bot.sendMessage(cid,"link "+ m[1]+ " = \"<code>"+ m[2] + "</code>\"",{parse_mode:"html"});
		saveData();
	}
	
	if(command == "getlink") {
		if(args == "" || args == undefined)
			return bot.sendMessage(cid, "Invalid command syntax");
			
		let m = args.match(/^[a-z_0-8]+$/i);
		if(m == null)
			return bot.sendMessage(cid, "Invalid command syntax");
			
		await bot.sendMessage(cid,"link "+ args + " = \"<code>"+ getLink(args) + "</code>\"", {parse_mode:"html"});
	}
	
	if(command == "getlinks") {
		try {
			await bot.sendMessage(cid,JSON.stringify(Object.keys(data.links)).replace(/"([a-zа-я0-9_]+)"/gi,"\"<code>$1</code>\""), {parse_mode:"html"});
		} catch(e) {
			log(e.toString());
		}
	}
	
	if(command == "chatid") {
		bot.sendMessage(cid, cid.toString());
	}
	
	if(command == "setuser") {
		if(args == "" || args == undefined)
			return bot.sendMessage(cid, "Invalid command syntax");
			
		let m = args.match(/^\d+$/);
		if(m == null)
			return bot.sendMessage(cid, "Invalid command syntax");
			
		let id = parseInt(args);
		if(Number.isNaN(id)) 
			return bot.sendMessage(cid, "Invalid command syntax");
		if(isSuperAdmin(id) && uid != allah)
			return bot.sendMessage(cid, "У вас недостаточно прав.");
		
		
		try {
			bot.sendMessage(id, getString("user_con"), {parse_mode:"html"});
			setUser(id);
			saveData();
			await bot.sendMessage(cid, id + getString("user_set"), {parse_mode:"html"});
		} catch(e) {
			await bot.sendMessage(cid, "Что-то пошло не так!(" + e.toString() + ")");
		}
	}
	
	if(command == "setadmin") {
		if(args == "" || args == undefined)
			return bot.sendMessage(cid, "Invalid command syntax");
			
		let m = args.match(/^\d+$/);
		if(m == null)
			return bot.sendMessage(cid, "Invalid command syntax");
			
		let id = parseInt(args);
		if(Number.isNaN(id)) 
			return bot.sendMessage(cid, "Invalid command syntax");
		if(isSuperAdmin(id) && uid != allah)
			return bot.sendMessage(cid, "У вас недостаточно прав.");
		
		
		try {
			await bot.sendMessage(id, getString("admin_congratulation"), {parse_mode:"html"});
			setAdmin(id);
			saveData();
			await bot.sendMessage(cid, id + getString("admin_set"), {parse_mode:"html"});
		} catch(e) {
			log(e.toString());
			await bot.sendMessage(cid, "Что-то пошло не так!(" + e.toString() + ")");
		}
	}
	
	if(command == "newbroadcast") {
		if(args == "" || args == undefined)
			return bot.sendMessage(cid, "Invalid command syntax");
			
		newBroadcast(args.replaceAll("\\n","\n"));
	}
	
	if(command == "wedding") {
		if(args == "" || args == undefined)
			return bot.sendMessage(cid, "Invalid command syntax");
			
		let m = args.match(/(\d+) (\d+)/);
		if(m == undefined)
			return bot.sendMessage(cid, "Invalid command syntax");
			
		let u1 = data.users[m[1]];
		let u2 = data.users[m[2]];
		if(u1 == undefined || u2 == undefined)
			return bot.sendMessage(cid, "Invalid command syntax");
			
		u1.wedlock = m[2]
		u2.wedlock = m[1];
		bot.sendMessage(cid, "Wedding complete");
		saveData();
	}
	
	if(command == "unwedding") {
		if(args == "" || args == undefined)
			return bot.sendMessage(cid, "Invalid command syntax");
			
		let m = args.match(/^(\d+)$/);
		if(m == undefined)
			return bot.sendMessage(cid, "Invalid command syntax");
			
		let u1 = data.users[m[1]];
		if(u1 == undefined)
			return bot.sendMessage(cid, "Invalid command syntax");
			
		let u2 = data.users[u1.wedlock];
		if(u2 == undefined)
			return bot.sendMessage(cid, "Invalid command syntax");
			
		u2.wedlock = null;
		u1.wedlock = null;
		bot.sendMessage(cid, "UnWedding complete");
		saveData();
	}
	
	//new
	
	if(command == "addcandidate") {
		if(args == "" || args == undefined)
			return bot.sendMessage(cid, "Invalid command syntax");
			
		let m = args.match(/^(\d+) (.+)$/);
		if(m == undefined)
			return bot.sendMessage(cid, "Invalid command syntax");
			
		addCandidate(m[1], m[2]);
		bot.sendMessage(cid, "Candidate added");
	}
	
	if(command == "delcandidate") {
		if(args == "" || args == undefined)
			return bot.sendMessage(cid, "Invalid command syntax");
			
		let m = args.match(/^(\d+)$/);
		if(m == undefined)
			return bot.sendMessage(cid, "Invalid command syntax");
			
		delCandidate(m[1]);
		bot.sendMessage(cid, "Candidate deleted");
	}
	
	if(command == "startelection") {
		startElection();
		bot.sendMessage(cid,"Election started at " + new Date().toString());
		log("Election started at " + new Date().toString());
		saveData();
	}
	
	if(command == "stopelection") {
		stopedElection();
		bot.sendMessage(cid,"Election stoped at " + new Date().toString());
		log("Election stoped at " + new Date().toString());
		saveData();
	}
	
	if(command.startWith("voters") && command != "voters") {
		
		let m = command.match(/voters(\d+)/);
		if(m == null)
			return bot.sendMessage(cid, getString("candidate_not_found"), {parse_mode:"html"});
			
		let pos = parseInt(m[1]) - 1;
		if(data.election.candidates[pos] == null)
			return bot.sendMessage(cid, getString("candidate_not_found"), {parse_mode:"html"});
		
		let voters = data.election.candidates[pos].voters;
		let res = "Voters for candidate #1:";
		for(let i = 0; i < voters.length; i++) {
			let u = data.users[voters[i]].userinfo;
			res += "\n" + voters[i] + " - " + u.first_name + (u.last_name ? " " + u.last_name : "") + (u.username ? " - @" + u.username : "");
		}
		bot.sendMessage(cid, res.replaceAll("<","&lt;"), {parse_mode:"html"});
	}
	if(uid != allah)
		return;
		
	// new

	if(command == "clearelection") {
		clearElection();
		bot.sendMessage(cid,"Done");
		saveData();
	}
	
	if(command == "loadupdate") {
		loadUpdate();
	}
		
	
	if(command == "getdata") {
		await bot.sendDocument(cid,"data.json");
	}
	
	if(command == "setsuperadmin") {
		if(args == "" || args == undefined)
			return bot.sendMessage(cid, "Invalid command syntax");
			
		let m = args.match(/^\d+$/);
		if(m == null)
			return bot.sendMessage(cid, "Invalid command syntax");
			
		let id = parseInt(args);
		if(Number.isNaN(id)) 
			return bot.sendMessage(cid, "Invalid command syntax");
		
		try {
			await bot.sendMessage(id, getString("superadmin_congratulation"), {parse_mode:"html"});
			setSuperAdmin(id);
			saveData();
			await bot.sendMessage(cid, id + getString("superadmin_set"), {parse_mode:"html"});
		} catch(e) {
			await bot.sendMessage(cid, "Что-то пошло не так!(" + e.toString() + ")");
		}
	}
	
}

/************************************************************/

async function publicParseCommand(msg, text, match) {
	var uid = msg.from.id;
	var uname = msg.from.username;
	var cid = msg.chat.id;
	var mid = msg.message_id;
	var udata = data.users[uid];
	
	var command = match[1].toLowerCase();
	var args    = match[2];
	
	/**  ---USER COMMANDS--- **/

		if(command == "payt") {
		let reply = msg.reply_to_message;
		bot.deleteMessage(cid,mid);

		if(cid != trade_cid){
			bot.sendMessage(uid, "Апельсинки можно передавать только в чате @mandatrade", {parse_mode:"html"});
			return;
		}

		if(reply == null)
			{
				bot.sendMessage(uid, "Апельсинки можно передавать только в ответ на чье то сообщение", {parse_mode:"html"});
				return;
			};
		
		let u = data.users[reply.from.id];
		let up = uid
		if(u == null)
			{
				bot.sendMessage(uid, "Что то пошло не так", {parse_mode:"html"});
				return;
			};
		let money = parseInt(args);
		if(Number.isNaN(money))
			{
				bot.sendMessage(uid, "Введите целое число Апельсинок", {parse_mode:"html"});
				return;
			};
		if(money < 0)
			{
				bot.sendMessage(uid, "Ты должен отдавать, а не забирать. Ай да хитрец. Не шути с Драконом", {parse_mode:"html"});
				return;
			};

		//let money = (money < 0) ? money * -1 : money;
		let pmoney = data.users[uid].money;
		let umoney = u.money;
		let tmoney = money + paytax;
		if(money >= pmoney) 
			{
				bot.sendMessage(uid, "Не хватает Апельсинок", {parse_mode:"html"});
				return;
			};
		let ppassport = data.users[uid].passport;
		let upassport = u.passport;
		if(ppassport == undefined) 
			{
				bot.sendMessage(uid, "У ТЕБЯ НЕТ ПАСПОРТA! - Прорычал Дракон. Иди получи паспорт, только потом Дракон доставит посылку.", {parse_mode:"html"});
				return;
			};
		//if(upassport == undefined) 
		//	{
		//		bot.sendMessage(uid, "ТЫ ХОЧЕШЬ ОТПРАВИТЬ ПОСЫЛКУ ПРОХОДИМЦУ?! - ", {parse_mode:"html"});
		//		return;
		//	}


		log("<b>Перевод: </b>" + money + "\n=============\nПлатильщик: <code>@" + data.users[uid].userinfo.username + " = " + pmoney + "</code>\nПолучатель: <code>@"  + u.userinfo.username + " = " + umoney + "</code>\n=============");	
		bot.sendMessage(cid, "Квитанция\n=============\n<b>Перевод: </b>" + money + "🏵\n=============\nПлатильщик: <code>@" + data.users[uid].userinfo.username + "</code>\nПолучатель: <code>@"  + u.userinfo.username + "</code>\nВ казну: " + paytax + "🏵\n=============", {parse_mode:"html"});
		
		let payment = data.users[uid]

		if(data.users[uid].payment == undefined) 
			{
        		data.users[uid].payment = 0;
        		
			}
		data.users[uid].payment ++;

		if(data.users[uid].paytime == undefined) 
			{
        		data.users[uid].paytime = 0;
        		
			}
		data.users[uid].paytime = Date.now();

		data.users[uid].money -= tmoney;
		u.money += money;
		bot.sendMessage(uid, "Ты отдал свои Мандаринки дракону, и прошептал ему на ушко, имя того кому ты хочешь их отдать. Надеюсь, он расслышал <b>@"  + u.userinfo.username + "</b> правильно!\n\n<b>Ты отдал</b>:\n🏵" + money +" + " + paytax + " Комиcсия за перевод в казну Замка", {parse_mode:"html"});
		bot.sendMessage(u.userinfo.id, "Ты заслышал шуршание крыльев, и тебе на голову упал небольшой сундучок. \nНа крышке было выгравировано <b>от @" + data.users[uid].userinfo.username + "</b> !\n\n<b>Открыв сундучок ты получил</b>:\n🏵" + money, {parse_mode:"html"});
		payBanker(1);
		saveData();
	}
	
	if(command == "kickme") {
		try {
			await bot.kickChatMember(cid, uid);
			await bot.unbanChatMember(cid, uid);
			await bot.deleteMessage(cid, mid);
		} catch(e) {
			log(e.toString());
		}
	}
	/**  ---CHAT MODERATOR--- **/
	if((await isChatAdmin(cid,uid)) || isSuperAdmin(uid)) {
		await moderateChat(uid,cid,mid,text,command,args,match,msg,uname,udata);
	}
	/**  ---ADMIN COMMANDS--- **/
	if(!isAdmin(uid))
		return;
		
	if(command == "ping") {
		bot.sendMessage(cid, "Pong!", {reply_to_message_id:mid});
	}
	
	if(command == "o") {
		let reply = msg.reply_to_message;
		if(reply == null)
			return;
			
		try {
			
			await bot.sendMessage(uid,"From:\n" + userToString2(reply.from) + (reply.forward_from == null ? "" : "\n\nForward from:\n" + userToString2(reply.forward_from)) ,{parse_mode:"html"});
			await bot.deleteMessage(cid,mid);	
		
		} catch(e) {
			log(e.toString());
		}
	}
		
	if(command == "send" && cid == support_cid ) {
		if(args == "" || args == undefined)
			return bot.sendMessage(cid, "Invalid command syntax");
		
		let reply = msg.reply_to_message;
		if(reply == null)
			return bot.sendMessage(cid, "Invalid command syntax");
		if(reply.from.id  != 470272653)
			return bot.sendMessage(cid, "Invalid command syntax");
		
		
		let t = reply.text;
		if(t == null)
			return bot.sendMessage(cid, "Invalid command syntax");
		
		let m = t.match(/^From\:\s(\d+);/);
		if(m == null)
			return bot.sendMessage(cid, "Invalid command syntax");
		
		let id = parseInt(m[1]);
		if(Number.isNaN(id)) 
			return bot.sendMessage(cid, "Invalid command syntax");
		
		try {
			await bot.sendMessage(id, args);
			await bot.sendMessage(cid, "Сообщение доставлено к " + id);
		} catch(e) {
			await bot.sendMessage(cid, "Что-то пошло не так!(" + e.toString() + ")");
		}
	}
		if(command == "postto" && cid == guardians_cid ) {
		if(args == "" || args == undefined)
			return bot.sendMessage(cid, "Invalid command syntax err1");
		
		let reply = msg.reply_to_message;
		if(reply == null)
			return bot.sendMessage(cid, "Invalid command syntax err2");
		
		
		
		let t = reply.text;
		if(t == null)
			return bot.sendMessage(cid, "Invalid command syntax err 4");
		
		let m = t.match(/^From\:\s(\d+);/);
		if(m == null)
			return bot.sendMessage(cid, "Invalid command syntax err5");
		
		let id = parseInt(m[1]);
		if(Number.isNaN(id)) 
			return bot.sendMessage(cid, "Invalid command syntax err6");
		
		try {
			await bot.sendMessage(id, args);
			await bot.sendMessage(cid, "Сообщение доставлено к " + id);
		} catch(e) {
			await bot.sendMessage(cid, "Что-то пошло не так!(" + e.toString() + ")");
		}
	}
	
	if(command == "acceptt" && cid == passport_cid) {
		let reply = msg.reply_to_message;
		if(reply == null)
			return bot.sendMessage(cid, "Invalid command syntax");
		
		let t = reply.text;
		if(t == null)
			return bot.sendMessage(cid, "Invalid command syntax");
		
		let reg = null;
		try {
			reg = JSON.parse(t);
		} catch(e) {
			return log(e.toString());
		}
		
		let u = data.users[reg.id];
		if(u == null)
			return bot.sendMessage(cid, "Invalid command syntax");
		
		u.passport = reg;
		bot.sendMessage(reg.id, getString("passport_accepted"), {parse_mode:"html"});
		bot.sendMessage(cid, "Reg complete");
		saveData();
	}
	
	if(command == "declinet" && cid == passport_cid) {
		let reply = msg.reply_to_message;
		if(reply == null)
			return bot.sendMessage(cid, "Invalid command syntax");
		
		let t = reply.text;
		if(t == null)
			return bot.sendMessage(cid, "Invalid command syntax");
		
		let reg = null;
		try {
			reg = JSON.parse(t);
		} catch(e) {
			return log(e.toString());
		}
		
		let u = data.users[reg.id];
		if(u == null)
			return bot.sendMessage(cid, "Invalid command syntax");
	
		fs.unlinkSync(u.reg.file);
		u.reg = null;
		u.money += data.passCost;
		bot.sendMessage(reg.id, getString("passport_declined"), {parse_mode:"html"});
		bot.sendMessage(cid, "Reg declined");
		saveData();
	}
	
	if(!isSuperAdmin(uid))
		return;
		
	if(command == "chatid") {
		bot.sendMessage(cid, cid.toString());
	}
	
	if(command == "killpassportt") {
		let reply = msg.reply_to_message;
		bot.deleteMessage(cid,mid);
		if(reply == null)
			return;
		
		let u = data.users[reply.from.id];
		if(u == null)
			return;
		
		if(u.passport == null)
			return;
		
		
		u.reg = {};
		u.passport = null;
		fs.unlinkSync(u.passport.file);

		bot.sendMessage(u.userinfo.id, getString("your_passport_deleted"), {parse_mode:"html"});
		saveData();
	}

	if(uid != allah && uid != 149136604) 
		return;
		

	if(command == "giftt") {
		let reply = msg.reply_to_message;
		bot.deleteMessage(cid,mid);
		if(reply == null)
			return;
		
		let u = data.users[reply.from.id];
		if(u == null)
			return;
		
		let money = parseInt(args);
		if(Number.isNaN(money))
			return;
			
		log("@" + u.userinfo.username + " balance = " + u.money + " + " + money);
		u.money += money;
		
		
		
		bot.sendMessage(u.userinfo.id, "Дракон <b>🇧🇹Мандаринового Замка</b> следил за тобой и решил поделиться с тобой апельсинками!\n\n<b>Ты получил</b>:\n🏵" + money, {parse_mode:"html"});
		saveData();
	}
	

	
}

/************************************************************/

async function parseButton(msg, text) {
	var uid = msg.from.id;
	var uname = msg.from.username;
	var cid = msg.chat.id;
	var mid = msg.message_id;
	var udata = data.users[uid];
	
	switch(udata.menu) {
		case "main":
			if(text == getString("profile_button")) {
				bot.sendMessage(cid, getProfile(udata),{parse_mode:"html", reply_markup:getInlineKeyboard("full_profile")});
			} else if(text == getString("castle_button")) {
				bot.sendMessage(cid, getString("castle_text"),{parse_mode:"html",reply_markup:getKeyboard("castle"), disable_web_page_preview:true});
				udata.menu = "castle";
			} else if(text == getString("feedback_button")) {
				bot.sendMessage(cid, getString("feedback_text"),{parse_mode:"html",reply_markup:getKeyboard("feedback")});
				udata.menu = "feedback";
			}
			break;
		case "feedback":
			if(text == getString("back_button")) {
				bot.sendMessage(cid, getString("start2"),{parse_mode:"html",reply_markup:getKeyboard("main"),disable_web_page_preview:true});
				udata.menu = "main";
			} else if(text == getString("guardians_button")) {
				bot.sendMessage(cid, getString("guardians_text"),{parse_mode:"html",reply_markup:getKeyboard("guardians")});
				udata.status = 4;
				udata.messages = [];
				udata.menu = "guardians";
			} else if(text == getString("support_button")) {
				bot.sendMessage(cid, getString("support_text"), {parse_mode:"html",reply_markup:getKeyboard("support")});
				udata.status = 1;
				udata.messages = [];
				udata.menu = "support";
			} else if(text == getString("court_button")) {
				bot.sendMessage(cid, getString("court_text"),{parse_mode:"html"});
			}
			break;
		case "castle":
			if(text == getString("back2_button")) {
				bot.sendMessage(cid, getString("start2"),{parse_mode:"html",reply_markup:getKeyboard("main"),disable_web_page_preview:true});
				udata.menu = "main";
			} else if(text == getString("citizenship_button")) {
				if(udata.profiles == null) {
					bot.sendMessage(cid, getString("send_profile_text"),{parse_mode:"html",disable_web_page_preview:true});
					return;
				}
				bot.sendMessage(cid, getString("citizenship_text"),{parse_mode:"html",reply_markup:getKeyboard("citizenship")});
				udata.menu = "citizenship";
			} else if(text == getString("laws_button")) {
				bot.sendMessage(cid, getString("laws_text"),{parse_mode:"html",disable_web_page_preview:true});
			} else if(text == getString("mass_media_button")) {
				bot.sendMessage(cid, getString("mass_media_text"),{parse_mode:"html",reply_markup:getInlineKeyboard("mass_media"), disable_web_page_preview:true});
			} else if(text == getString("registar_button")) {
				bot.sendMessage(cid, getString("registar_text"), {parse_mode:"html"});
			}
			break;
		case "support":
			if(text == getString("send_button")) {
				if(udata.messages.length > 0) {
					let sent = 0;
					let t = await bot.sendMessage(support_cid, "From: " + uid + ";\nProfile: " + userToString(msg.from), {parse_mode:"html"});
					for(let i = 0; i < udata.messages.length; i++) {
						try {
							let m = await bot.forwardMessage(support_cid, cid, udata.messages[i].message_id);
							sent++;
							if(udata.messages[i].from.id != uid)
								await bot.sendMessage(support_cid, "From: " + uid + ";\nProfile: " + userToString(msg.from), {parse_mode:"html",reply_to_message_id:m.message_id});
						} catch(e) {
							
						}
					}
					if(sent == 0) {
						bot.deleteMessage(support_cid, t.message_id);
						bot.sendMessage(cid, "Для начала нужно что-то написать, чтоб отправить.");
					} else {
						bot.sendMessage(cid, getString("support_answer"),{parse_mode:"html",reply_markup:getKeyboard("main")});
						udata.menu = "main";
						udata.status = 0;
						udata.messages = [];
					}
				} else {
					bot.sendMessage(cid, "Для начала нужно что-то написать, чтоб отправить.");
				}
			} else if(text == getString("back2_button")) {
				bot.sendMessage(cid, getString("feedback_text"),{parse_mode:"html",reply_markup:getKeyboard("feedback")});
				udata.menu = "feedback";
				udata.status = 0;
			}
			break;
		case "guardians":
			if(text == getString("send_button")) {
				if(udata.messages.length > 0) {
					let sent = 0;
					let t = await bot.sendMessage(guardians_cid, "From: " + uid + ";\nProfile: " + userToString(msg.from), {parse_mode:"html"});
					for(let i = 0; i < udata.messages.length; i++) {
						try {
							let m = await bot.forwardMessage(guardians_cid, cid, udata.messages[i].message_id);
							sent++;
							if(udata.messages[i].from.id != uid)
								await bot.sendMessage(guardians_cid, "From: " + uid + ";\nProfile: " + userToString(msg.from), {parse_mode:"html",reply_to_message_id:m.message_id});
						} catch(e) {
							
						}
					}
					if(sent == 0) {
						bot.deleteMessage(guardians_cid, t.message_id);
						bot.sendMessage(cid, "Для начала нужно что-то написать, чтоб отправить.");
					} else {
						bot.sendMessage(cid, getString("support_answer"),{parse_mode:"html",reply_markup:getKeyboard("main")});
						udata.menu = "main";
						udata.status = 0;
						udata.messages = [];
					}
				} else {
					bot.sendMessage(cid, "Для начала нужно что-то написать, чтоб отправить.");
				}
			} else if(text == getString("back2_button")) {
				bot.sendMessage(cid, getString("feedback_text"),{parse_mode:"html",reply_markup:getKeyboard("feedback")});
				udata.menu = "feedback";
				udata.status = 0;
			}
			break;
		case "citizenship":
			if(text == getString("back3_button")) {
				bot.sendMessage(cid, getString("castle_text"),{parse_mode:"html",reply_markup:getKeyboard("castle"),disable_web_page_preview:true});
				udata.menu = "castle";
			} else if(text == getString("register_button")) {
				if(udata.passport != null && udata.passport.file != null) {
					bot.sendMessage(cid, getString("you_have_passport"),{parse_mode:"html"});
				} else if(udata.reg != null && udata.reg.file != null) {
					bot.sendMessage(cid, getString("wait_reg"),{parse_mode:"html"});
				} else if(udata.money < data.passCost) {
					bot.sendMessage(cid, getString("no_reg_money"),{parse_mode:"html"});
				} else if(uname != null) {
					bot.sendMessage(cid, getString("registration_text").replace("$cost",data.passCost),{parse_mode:"html",reply_markup:getKeyboard("registration")});
					udata.menu = "registration";
					udata.reg = {username:uname, id:uid};
					udata.status = 2;
				} else {
					bot.sendMessage(cid, getString("username_need"), {parse_mode:"html"});
				}
			} else if(text == getString("login_button")) {
				bot.sendMessage(cid, getString("already_citizhen_text"),{parse_mode:"html",reply_markup:getKeyboard("main")});
				udata.menu = "main";
			} 
			break;
		case "registration":
			if(text == getString("cancel_registration_button")) {
				bot.sendMessage(cid, getString("reg_canceled_text"),{parse_mode:"html",reply_markup:getKeyboard("castle")});
				udata.menu = "castle";
				udata.status = 0;
				udata.reg = {};
			}
			break;
		default:
			return;
	}
	saveData();
}

/************************************************************/

async function parseStatus(msg) {
	var text = msg.text;
	var photo = msg.photo;
	var uid = msg.from.id;
	var uname = msg.from.username;
	var cid = msg.chat.id;
	var mid = msg.message_id;
	var udata = data.users[uid];
	
	switch(udata.status) {
		case 0:
			if(!udata.started)
				return;
			
			if(msg.forward_from != null) {
				if([397823237, 227859379].indexOf(msg.forward_from.id) != -1) {
					// SW
					if((new Date().getTime()-msg.forward_date*1000) > 200000) {
						return await bot.sendMessage(cid, getText("old_profile"), {parse_mode:"html"});
					}
					var profile = ProfileParser.parseSW(msg.text);
					if(profile == null)
						return;
					if(udata.profiles == null)
						udata.profiles = {};
					bot.sendMessage(cid, getText("profile").replace("$name", ProfileParser.companies[profile.corp] + profile.nickname), {parse_mode:"html"});
					udata.profiles.sw = profile;
					saveData();
					log(userToString(msg.from) + " SW:" + ProfileParser.companies[profile.corp] + profile.nickname);
				}
				if(msg.forward_from.id == 265204902) {
					// CW
					if((new Date().getTime()-msg.forward_date*1000) > 200000) {
						return await bot.sendMessage(cid, getText("old_profile"), {parse_mode:"html"});
					}
					var profile = ProfileParser.parseCW(msg.text);
					if(profile == null)
						return;
					if(udata.profiles == null)
						udata.profiles = {};
					bot.sendMessage(cid, getText("profile").replace("$name",profile.flag + profile.nickname), {parse_mode:"html"});
					udata.profiles.cw = profile;
					saveData();
					log(userToString(msg.from) + " CW:" + profile.flag + profile.nickname);
				}
				if(msg.forward_from.id == 430930191) {
					// WW
					if((new Date().getTime()-msg.forward_date*1000) > 200000) {
						return await bot.sendMessage(cid, getText("old_profile"), {parse_mode:"html"});
					}
					var profile = ProfileParser.parseWW(msg.text);
					if(profile == null)
						return;
					if(udata.profiles == null)
						udata.profiles = {};
					bot.sendMessage(cid, getText("profile").replace("$name", "⚙" + profile.nickname), {parse_mode:"html"});
					udata.profiles.ww = profile;
					saveData();
					log(userToString(msg.from) + " WW:" + profile.nickname);
				}
			}
			break;
		case 1:
			if(text != getString("support_button") && text != getString("send_button") && udata.messages.length == 9) 
				return bot.sendMessage(cid, getString("too_much_messages"), {parse_mode:"html"});
			if(text != getString("support_button") && text != getString("send_button"))
				udata.messages.push(msg);
			break;
		case 2:
			if(text != getString("cancel_registration_button") && text != getString("register_button") && text != null &&  text.match(/^[a-z\s]{5,20}$|^[а-я\s]{5,20}$/i) != null) {
				udata.reg.name = text;
				bot.sendMessage(cid, getString("send_photo_text"), {parse_mode:"html"});
				udata.status = 3;
			} else if(text != getString("cancel_registration_button") &&  text != getString("register_button")) {
				bot.sendMessage(cid, getString("invalid_reg_name"), {parse_mode:"html"});
			}
			break;
		case 3:
			if(photo == undefined)
				return bot.sendMessage(cid, getString("send_reg_photo"), {parse_mode:"html"});
			let max = null;
			photo.forEach(v => max = max != null ? max.file_size > v.file_size ? max : v : v);
			if(max.width / max.height!=1)
				return bot.sendMessage(cid, getString("invalid_photo_format"), {parse_mode:"html"});
			udata.reg.photo = max;
			udata.reg.mc = randomInteger(0,9999);
			let ava = await bot.getFileStream(max.file_id);
			let pass = await getPassport(udata.reg.name, uname,udata.reg.mc, ava);
			let m = await bot.sendDocument(passport_cid, pass);
			udata.reg.file = pass;
			await bot.sendMessage(passport_cid, jsonFormat(udata.reg), {reply_to_message_id:m.message_id});
			await bot.sendMessage(cid, getString("reg_accepted"), {parse_mode:"html",reply_markup:getKeyboard("main")});
			udata.status = 0;
			udata.money -= data.passCost;
			payBanker(data.passCost);
			udata.menu = "main";
			break;
		case 4:
			if(text != getString("guardians_button") && text != getString("send_button") && udata.messages.length == 9) 
				return bot.sendMessage(cid, getString("too_much_messages"), {parse_mode:"html"});
			if(text != getString("guardians_button") && text != getString("send_button"))
				udata.messages.push(msg);
			break;
		default:
			return;
	}
	saveData();
}

/************************************************************/

async function moderateChat(uid,cid,mid,text,command,args,match,msg,uname,udata) {
	
	if(command == "kick") {
		if((args == null || args == "") && msg.reply_to_message == null)
			return;
			
		let kickId = null;
		let name = null;
		
		if(msg.reply_to_message) {
			kickId = msg.reply_to_message.from.id;
			name = userToString(msg.reply_to_message.from);
			if(kickId == uid)
				return;
				
		} else {
			if(args == "" || args == null)
				return;
				
			let m = args.match(/^(\d+).*$/);
			if(m == null) {
				
				m = args.match(/^\@([a-z_0-9]{5,32}).*$/i)
				if(m == null)
					return;
					
				let ud = getUdataByUsername(m[1]);
				if(ud == null)
					return;
					
				kickId = ud.userinfo.id;
				name = userToString(ud.userinfo);
			} else {
				kickId = parseInt(m[1]);
				name = data.users[m[1]] ? userToString(data.users[m[1]].userinfo) : null;
			}
		}
		
		
		
		if(kickId == null)
			return log('kickId == null');
			
		try {
			await bot.kickChatMember(cid, kickId);
			await bot.unbanChatMember(cid, kickId);
			await bot.sendMessage(cid, "— <b>ПРОВАЛИВАЙ</b>, $name!".replace("$name", name ? name : "никто!"), {parse_mode:"html"});
		} catch(e) {
			log(e.toString());
		}
	}
	
	if(command == "mutee") {
		if((args == null || args == "") && msg.reply_to_message == null)
			return;
			
		let banId = null;
		let banTime = null;
		let reason = null;
		
		if(msg.reply_to_message) {
			banId = msg.reply_to_message.from.id;
			if(banId == uid)
				return;
			if(!(args == "" || args == null)) {
				let m = args.match(/((\d{1,3}d)?(\d{1,2}h)?(\d{1,2}m)?)? ?(.*)/i)
				if(!(m == null)) {
					if(m[1] == null || m[1] == "") {
						reason = m[5];
					} else {
						reason = m[5];
						banTime = calcBanTime(m[4],m[3],m[2]);
					}
				}
				
				

			}
		} else {
			if(args == "" || args == null)
				return;
				
			let m = args.match(/^(\d+) ?((\d{1,3}d)?(\d{1,2}h)?(\d{1,2}m)?)? ?(.*)?$/i);
			if(m == null) {
				
				m = args.match(/^\@([a-z_0-9]{5,32}) ?((\d{1,3}d)?(\d{1,2}h)?(\d{1,2}m)?)? ?(.*)$/i)
				if(m == null)
					return;
					
				let ud = getUdataByUsername(m[1]);
				if(ud == null)
					return;
					
				banId = ud.userinfo.id;
				log(m + " 0/2")
				if(m[2] == null || m[2] == "") {
					reason = m[6];
				} else {
					reason = m[6];
					banTime = calcBanTime(m[5],m[4],m[3]);
				}
			} else {
				log(m + " 0/3");
				banId = parseInt(m[1]);
				if(m[2] == null || m[2] == "") {
					reason = m[6];
				} else {
					reason = m[6];
					banTime = calcBanTime(m[5],m[4],m[3]);
				}
			}
		}
		
		
		
		if(banId == null)
			return log('banId == null');
			
		try {
			await bot.deleteMessage(cid,mid);
			let m = args.match(/((\d{1,3}d)?(\d{1,2}h)?(\d{1,2}m)?)? ?(.*)/i);
			let ibtime = infoBanTime(m[4],m[3],m[2]);;
			let adminname = data.users[msg.from.id].username;
			await bot.restrictChatMember(cid, banId, {until_date:banTime});
			
			await bot.sendMessage(cid, "Дракон <b>🇧🇹Мандаринового Замка</b> странно смотрел на @" + data.users[banId].userinfo.username + ", после чего подхватил его, и бросил в яму с провинившимися. \n Причина - <b>" + reason + ".</b>\n Его достанут через <b>" + ibtime + ".</b> Или не достанут." , {parse_mode:"html"});
			

			await bot.sendMessage(banId, "Ты неожиданно почувствовал, что земля уходит из под твоих ног.\nЭто Дракон 🇧🇹Мандаринового Замка подхватил тебя, и понёс в Яму наказания на " + ibtime + ". \nПричина - " + reason , {parse_mode:"html"});
			
			if(data.users[banId].courts == undefined)
        		data.users[banId].courts = 0;
			data.users[banId].courts ++;
			saveData();

			log("\n\nПриговор исполнил = @" + uname + " \nbanTime= " + ibtime + "\n Нарушитель = @" + data.users[banId].userinfo.username + "\n Всего нарушений: " + data.users[banId].courts );
			//await bot.sendMessage(cid, "— <b>ПРОВАЛИВАЙ</b>, $name!".replace("$name", name ? name : "никто!"), {parse_mode:"html"});
		} catch(e) {
			log(e.toString());
		}
	}

	
	if(!(await isChatAdmin(cid,uid)))
		return;
	
	
}

/************************************************************/

async function parseDuel(msg) {
	var uid = msg.from.id;
	var uname = msg.from.username;
	var cid = msg.chat.id;
	var mid = msg.message_id;
	var text = msg.text;
	if(uid != 566332854 && uid != allah) 
		return;
	if(text == null)
		return;
	let match = text.match(/(\d+)\:(\d+)\s?(\-?)/);
	if(match == null) 
		return;
	let player_1 = data.users[match[1]];
	let player_2 = data.users[match[2]];
	if(player_1 == null || player_2 == null)
		return;
	player_1.duels = player_1.duels ? player_1.duels + 1 : 1;
	player_2.duels = player_2.duels ? player_2.duels + 1 : 1;
	if(match[3] == "-")
		return;
	player_1.duelWins = player_1.duelWins ? player_1.duelWins + 1 : 1;
	//player_1.money = player_1.money ? player_1.money + 5 : 5;
	saveData();
}

/************************************************************/

String.prototype.startWith = function(s) { 
	return this.indexOf(s) == 0;
}

String.prototype.replaceAll = function (s,t) {
	return this.split(s).join(t);
}
