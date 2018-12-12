export default class TextToJson {
    
    matches(transformOp) {
        return transformOp.startsWith("parse json");
    }
    
    validate(dataBox) {
        if (dataBox.beforeData.type !== "text") {
            return {"text": "Command only works on text.", "ok": false};
        }

        var y = 0;
        var x = 0;
        
        try {
            for (y = 0; y < dataBox.beforeData.rows.length; y++) {
                for (x = 0; x < dataBox.beforeData.rows[y].length; x++) {
                    if (dataBox.beforeData.rows[y][x] && dataBox.beforeData.rows[y][x].length > 0) {
                        JSON.stringify(JSON.parse(dataBox.beforeData.rows[y][x]));
                    }
                }
            }
        } catch (err) {
            return {"text": "Error on row " + (y + 1) + " and column " + (x + 1) + ": " + err.message, "ok": false};
        }

        return {"text": "", "ok": true};
    }
    
    transform(dataBox) {

        var newRows = [];
        for (var y = 0; y < dataBox.beforeData.rows.length; y++) {
            var row = [];
            for (var x = 0; x < dataBox.beforeData.rows[y].length; x++) {
                if (dataBox.beforeData.rows[y][x] && dataBox.beforeData.rows[y][x].length > 0) {
                    row.push(JSON.stringify(JSON.parse(dataBox.beforeData.rows[y][x]), null, 2));
                } else {
                    row.push("\"\"");
                }
            }
            newRows.push(row);
        }

        dataBox.afterData.type = "json";
        dataBox.afterData.rows.splice(0, dataBox.afterData.rows.length);
        for (var nk = 0; nk < newRows.length; nk++) {
            dataBox.afterData.rows.push(newRows[nk]);
        }
    }
}