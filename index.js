var google = require('googleapis'),
	md5 = require('md5'),
	pad = require('pad'),
	analytics = google.analyticsreporting('v4'),
	fs = require('fs');

module.exports = {
	baseObject: {
		"headers": {
			"Content-Type": "application/json"
		},
		"resource": {
			"reportRequests": []
		}
	},
	reportsToRun: [],
	setAuth: function (pem) {
		console.log("Creating authorization");
		var key = JSON.parse(pem),
			jwtClient = new google.auth.JWT(key.client_email, null, key.private_key, ['https://www.googleapis.com/auth/analytics.readonly'], null);
		this.baseObject.auth = jwtClient;
	},
	createNewReport: function (view, startDate, endDate, metrics, dimensions, dimensionFilters) {
		console.log("Adding report #" + this.reportsToRun.length + 1);
		var endDateObj = new Date(endDate),
			startDateObj = new Date(startDate),
			startDateStr = startDateObj.getFullYear() + "-" + pad(2, startDateObj.getMonth() + 1, '0') + "-" + pad(2, startDateObj.getDate(), '0'),
			endDateStr = endDateObj.getFullYear() + "-" + pad(2, endDateObj.getMonth() + 1, '0') + "-" + pad(2, endDateObj.getDate(), '0');
		this.reportsToRun.push({
			"viewId": view,
			dateRanges: [{
				"startDate": startDateStr,
				"endDate": endDateStr
			}],
			metrics: metrics,
			dimensions: dimensions,
			dimensionFilterClauses: dimensionFilters
		});
	},
	runReports: function (callback) {
		var reportObject = this.baseObject;
		var reportsThisRequest = Math.min(5, this.reportsToRun.length);
		reportObject.resource.reportRequests = [];
		console.log("Running " + reportsThisRequest + " reports (" + (this.reportsToRun.length - 4) + " remain).");
		var self = this;
		for (var i = 0; i < reportsThisRequest; i++) {
			reportObject.resource.reportRequests.push(this.reportsToRun.pop());
		}
		this.baseObject.auth.authorize(function (err, tokens) {
			if (err) {
				console.log(err);
				return;
			}
			analytics.reports.batchGet(reportObject, function (err, res) {
				if (err) {
					console.log(err);
					return;
				}
				if (callback) {
					res.reports.forEach(function (value) {
						callback(value);
					});
				}
				if (self.reportsToRun.length > 0) {
					self.runReports(callback || null);
				}
			});
		})
	},
};
