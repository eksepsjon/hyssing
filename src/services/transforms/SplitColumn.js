export default class SplitColumn {
    
    info() {
        return {
            "prefix": "split column",
            "command": "split column <Regex> <optional Column #>",
            "applicable": ["text"],
            "text": "Split each column into columns where the regex matches. If <Column #> is set only that column is split."
        }
    }
    
    validate(dataBox, transformOp) {
        if (dataBox.beforeData.type !== "text") {
            return {"text": "Command only works on text.", "ok": false};
        }
        
        
        var column = "1";
        
        try {
            var regex = transformOp.substring("split column".length, transformOp.length).trim();

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
        var regex = transformOp.substring("split column".length, transformOp.length).trim();
        var column = "1";

        if (regex.indexOf(" ") > 0) {
            var splt = regex.split(" ", 2)
            regex = splt[0];
            column = splt[1].trim();
        }

        column = parseInt(column);

        regex = new RegExp(regex, "g");

        var newRows = [];
        var maxColumns = 0;
        for (var y = 0; y < dataBox.beforeData.rows.length; y++) {
            var row = [];
            for (var x = 0; x < dataBox.beforeData.rows[y].length; x++) {
                if (x === (column - 1)) {
                    var spltc = dataBox.beforeData.rows[y][x].split(regex);
                    for (var n = 0; n < spltc.length; n++) {
                        if ((x === 0 || x === dataBox.beforeData.rows[y].length - 1) && spltc[n].trim() === "") {
                            continue;
                        }
                        row.push(spltc[n]);
                    }
                } else {
                    row.push(dataBox.beforeData.rows[y][x]);
                }
            }
            maxColumns = Math.max(row.length, maxColumns);
            newRows.push(row);
        }

        dataBox.afterData.rows.splice(0, dataBox.afterData.rows.length);
        for (var nk = 0; nk < newRows.length; nk++) {
            if (newRows[nk].length < maxColumns) {
                for (var cx = newRows[nk].length; cx < maxColumns; cx++) {
                    newRows[nk].push("");
                }
            }
            dataBox.afterData.rows.push(newRows[nk]);
        }
        dataBox.afterData.columns = maxColumns;
    }
}