'use strict';
function ensureLeadingSlash(url) {
	if (url.charAt(0) !== '/') {
		return '/' + url;
	}
	return url;
}

function mapUriParams(url, data) {
	var obj = data;
	var urlReg = /{\w+}/g;
	var matches;
	while ((matches = urlReg.exec(url)) !== null) {
		var prop = matches[0];
		prop = prop.slice(prop.indexOf('{') + 1, prop.lastIndexOf('}'));
		var propReg = new RegExp('{' + prop + '}');
		if (obj.hasOwnProperty(prop)) {
			url = url.replace(propReg, prop + '/' + obj[prop]);
		} else {
			url = url.replace(propReg, '');
		}
	}
	url = encodeURI(url);
	return url;
}
module.exports = {
	mapUriParams: mapUriParams,
	ensureLeadingSlash : ensureLeadingSlash
};
