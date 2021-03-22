const templates = require("./templateList");
class EmailTemplate {
	constructor(templateName) {
		this.htmlData = templates[templateName];
		if (!this.htmlData) {
			console.error(`Template's html not found with the key ${templateName} provided.`);
			return;
		}
	}
	get(data) {
		let htmlToSend = this.htmlData;
		for (let variable in data) {
			let strToReplace = "{{".concat(variable).concat("}}");
			htmlToSend = htmlToSend.replace(strToReplace, data[variable]);
		}
		return htmlToSend;
	}
}
module.exports = EmailTemplate;
