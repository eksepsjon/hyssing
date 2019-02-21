export default class SplitRow {
    
    info() {
        return {
            "prefix": "split row",
            "arguments": "<Regex> <optional Column #>",
            "applicable": ["text"],
            "text": "Split each row into new rows where the regex matches. If <Column #> is not set the first column is used to split the row."
        }
    }
    
    validate(dataBox, transformOp) {
        if (dataBox.beforeData.type !== "text") {
            return {"text": "Command only works on text.", "ok": false};
        }
        
        
        var column = "1";
        
        try {
            var regex = transformOp.substring("split row".length, transformOp.length).trim();

            if (regex.indexOf(" ") > 0) {
                var splt = regex.split(" ", 2)
                regex = splt[0];
                column = splt[1].trim();
            }
    
            if (regex.length === 0) {
                return {"text": "Regex is empty.", "ok": false};
            }
    
            regex = new RegExp(regex, "i");
        } catch (err) {
            return {"text": "Error while parsing regex: '" + err.message + "'", "ok": false};
        }
        
        try {
            column = parseInt(column);

            if (dataBox.beforeData.columns < column) {
                throw new Error("Index larger than number of columns");
            }
        } catch (err) {
            return {"text": "Error while parsing column index: '" + err.message + "'", "ok": false};
        }

        return {"text": "", "ok": true};
    }
    
    transform(dataBox, transformOp) {
        var regex = transformOp.substring("split row".length, transformOp.length).trim();
        var column = "1";

        if (regex.indexOf(" ") > 0) {
            var splt = regex.split(" ", 2)
            regex = splt[0];
            column = splt[1].trim();
        }

        column = parseInt(column);

        regex = new RegExp(regex, "g");

        var newRows = [];
        for (var y = 0; y < dataBox.beforeData.rows.length; y++) {
            for (var x = 0; x < dataBox.beforeData.rows[y].length; x++) {
                if (x === (column - 1)) {
                    var spltc = dataBox.beforeData.rows[y][x].split(regex);
                    for (var n = 0; n < spltc.length; n++) {
                        if (spltc[n].trim() === "") {
                            continue;
                        }
                        var newRow = JSON.parse(JSON.stringify(dataBox.beforeData.rows[y]))
                        newRow[x] = spltc[n];
                        newRows.push(newRow);
                    }
                }
            }
        }

        dataBox.afterData.rows.splice(0, dataBox.afterData.rows.length);
        for (var nk = 0; nk < newRows.length; nk++) {
            dataBox.afterData.rows.push(newRows[nk]);
        }
    }
}