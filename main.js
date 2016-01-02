// Load the http module to create an http server.
var request = require("request");

function formatCsv(data) {
    var content = "";

    if (Array.isArray(data)) {
        for (var i = 0; i < data.length; i++) {
            for (var j = 0; j < data[i].length; j++) {
                if (j > 0) { content += ","; }
                content += data[i][j];
            }
            content += "\n";
        }

        return content;
    }
}

function getSalinidad(fechaold, fechanew, cb) {
    var uri = "http://www2.meteogalicia.es/galego/observacion/plataformas/DatosHistoricosTaboas_dezminutalInv.asp?est=15004&param=20005&medidas=17680&data1=";
    uri = uri.concat(fechaold, "&data2=", fechanew);

    request({
        uri: uri,
    }, function(error, response, body) {
        if (error) {
            console.log("Error al obtener los datos desde " + fechaold + " hasta " + fechanew);
            cb(error, null);
        }

        var cheerio = require('cheerio'),
        $ = cheerio.load(body);

        var datatotal = new Array();

        $("table tr").each(function(data) {
            var lineadata = [];
            $(this).children("th").each(function(index) { lineadata.push($(this).text().trim().replace(",", ".")); });
            datatotal.push(lineadata);
        });

        // Se eliminan las dos lineas de cabecera
        datatotal.shift();
        datatotal.shift();
        console.log("Se han cargado los datos desde " + fechaold + " hasta " + fechanew);
        cb(false, datatotal);
    });
}

var fs = require('fs');
var now = new Date();
var logStream = fs.createWriteStream('datos.csv', {'flags': 'a'});

for (var anho = 2010; anho <= now.getFullYear(); anho++) {
    for (var mes = 1; mes < 12; mes++) {
        if (anho == now.getFullYear() && mes > now.getMonth()) { continue; }
        var start = "1/" + mes + "/" + anho;
        var end = "1/" + (mes + 1) + "/" + anho;
        console.log("Obteniendo datos desde " + start + " hasta " + end);
        getSalinidad(start, end, function(err, datos) {
            if (!err) {
                logStream.write(formatCsv(datos));
            }
        });
    }
}
