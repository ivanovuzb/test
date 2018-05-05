var fs = require('fs');
var gm = require('gm');

function getAvatarName(mc,username) {
	return "/root/mc-bot/mctest/avatars/avatar_" + mc + "_" + username + ".png";
}

function getPassportName(mc,username) {
	return "/root/mc-bot/mctest/passports/pass_" + mc + "_" + username + ".png";
}

async function getPassport(name, username, mc, photo) {
	return new Promise((resolve, reject) => {
	let avatarName = getAvatarName(mc, username);
	let avatar = gm(photo)
		.resize(124,125)
		.quality(100);
		avatar.write(avatarName, err => { 
			if(err) return reject("ava"); 
			gm('pass.png')
			.draw("image Over 72,203 0,0 " + avatarName)
			.stroke("#fff")
			.fontSize("14px")
			.setDraw("opacity",0.5)
			.drawText(380,183,"MC " + mc)
			.drawText(270,273,"@" + username)
			.drawText(270,251, name)
			.quality(100)
			.write(getPassportName(mc,username), err => { if(err) return reject("pizda"); 
				resolve(getPassportName(mc,username))
			});
		});
	})
}

module.exports = getPassport;
