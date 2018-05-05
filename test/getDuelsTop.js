
function userToString(user) {
	return "<code>" + user.first_name + (user.last_name == null ? "" : " " + user.last_name) + "</code>"
}

function userToString2(user) {
	return "<b>" + user.first_name + (user.last_name == null ? "" : " " + user.last_name) + "</b>"
}

function getDuelsTop(data, getString, uid) {
	var res = getString("duels_top_title");
	var users_ids = Object.keys(data.users).filter(id => data.users[id].duels != null);
	users_ids = users_ids.sort(( a,b )=> (data.users[b].duels ? data.users[b].duels : 0) - (data.users[a].duels ? data.users[a].duels : 0));
	let top = users_ids.slice(0,15)
	for(let i = 0; i < top.length; i++) {
		if(data.users[top[i]].userinfo.id != uid)
			res += "\n# " + (i+1) + " " + userToString(data.users[top[i]].userinfo) + ":<b> " + data.users[top[i]].duels + "</b>";
		else {
			res += "\n# " + (i+1) + " " + userToString2(data.users[top[i]].userinfo) + ":<b> " + data.users[top[i]].duels + "</b>";
		}
	}
	let user_pos = users_ids.indexOf(uid.toString());
	if(user_pos > 15)
		res += "\n...\n# " + (user_pos+1) + " " + userToString2(data.users[users_ids[user_pos]].userinfo) + ":<b> " + data.users[users_ids[user_pos]].duels + "</b>";
	if(user_pos == 15)
		res += "\n# " + (user_pos+1) + " " + userToString2(data.users[users_ids[user_pos]].userinfo)+ ":<b> " + data.users[users_ids[user_pos]].duels + "</b>";
	if(user_pos == -1)
		res += "\n<i>Тебя нет ещё в этом топе.</i>";
	return res;
}

module.exports = getDuelsTop;
