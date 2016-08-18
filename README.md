# estonian-companies
> JSON API for getting various data about Estonian companies.

This API can be used in business/e-commerce/other software for auto-filling company related fields. The program updates [the data](https://opendata.riik.ee/dataset/http-avaandmed-rik-ee-andmed-ariregister) once a week.

## Installation

Fastest way to get the app up and running is using docker-compose:

```
git clone https://github.com/karlerss/estonian-companies.git
cd estonian-companies
docker-compose build
docker-compose up -d
# Starts app on port 3002
```

## Usage 

`GET /company?q=companyname`

## Examples

###Using angular and [ui.bootstrap.typeahead](https://angular-ui.github.io/bootstrap/#/typeahead)

*controller.js:*
```
$scope.getCompany = function (filter) {
        return $http({
            method: 'GET',
            url: 'http://company.lehter.com/company',
            params: {q: filter}
        }).then(function (res) {
            return res.data;
        });
    };
```

*view.html:*
```
<input type="text" class="form-control" id="name" data-ng-model="asyncselected"
    placeholder="Companies loaded via $http"
    uib-typeahead="company as company.name for company in getCompany($viewValue)"
    class="form-control" typeahead-wait-ms="100" autocomplete="off" typeahead-min-length="4">
```

## Hosted version

This software is hosted at company.lehter.com. [Check it out](http://company.lehter.com/company?q=123).
