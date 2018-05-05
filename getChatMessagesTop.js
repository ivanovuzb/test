
function userToString(user) {
	return "<code>" + user.first_name + (user.last_name == null ? "" : " " + user.last_name) + "</code>"
}

function userToString2(user) {
	return "<b>" + user.first_name + (user.last_name == null ? "" : " " + user.last_name) + "</b>"
}

function getChatMessagesTop(data, getString, uid) {
	var res = getString("cm_top_title");
	var users_ids = Object.keys(data.users).filter(id => data.users[id].msgCount != null);
	users_ids = users_ids.sort(( a,b )=> (data.users[b].msgCount ? data.users[b].msgCount : 0) - (data.users[a].msgCount ? data.users[a].msgCount : 0));
	let top = users_ids.slice(0,15)
	for(let i = 0; i < top.length; i++) {
		if(data.users[top[i]].userinfo.id != uid)
			res += "\n# " + (i+1) + " " + userToString(data.users[top[i]].userinfo) + ":<b> " + data.users[top[i]].msgCount + "</b>";
		else {
			res += "\n# " + (i+1) + " " + userToString2(data.users[top[i]].userinfo) + ":<b> " + data.users[top[i]].msgCount + "</b>";
		}
	}
	let user_pos = users_ids.indexOf(uid.toString());
	if(user_pos > 15)
		res += "\n...\n# " + (user_pos+1) + " " + userToString2(data.users[users_ids[user_pos]].userinfo) + ":<b> " + data.users[users_ids[user_pos]].msgCount + "</b>";
	if(user_pos == 15)
		res += "\n# " + (user_pos+1) + " " + userToString2(data.users[users_ids[user_pos]].userinfo)+ ":<b> " + data.users[users_ids[user_pos]].msgCount + "</b>";
	if(user_pos == -1)
		res += "\n<i>Тебя нет ещё в этом топе.</i>";
	return res;
}

module.exports = getChatMessagesTop;
