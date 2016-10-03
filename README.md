# Metrique

Metrique is an easy way to build and save information from Google Analytic data sets.

## Usage

### PEM File

In order to use this library, you'll need to get a PEM file from Google.

### Set Authorization

```javascript
var metrique = require('metrique'),
    fs = require('fs');
var pemText = fs.readFileSync('mypem.pem');
metrique.setAuth(pemText);
metrique.createNewReport(view, startDate, endDate, metrics, dimensions, dimensionFilters);
metrique.runReports(callback)
```