export default class JoinColumn {
    
    info() {
        return {
            "prefix": "join column", 
            "command": "join column <Join String> <optional Column #> .. <optional Column #>",
            "applicable": ["text"],
            "text": "Merge columns with <Join String>. Optionally select which columns to merge, otherwise all columns are merged."
        }
    }
    
    validate(dataBox, transformOp) {
        if (dataBox.beforeData.type !== "text") {
            return {"text": "Command only works on text.", "ok": false};
        }
        
        
        var columns = [];
        
        try {
            var joinString = transformOp.substring("join column".length, transformOp.length).trim();

            if (joinString.indexOf(" ") > 0) {
                var splt = joinString.split(" ")
                joinString = splt[0].trim();
                for (var n = 1; n < splt.length; n++) {
                    columns.push(splt[n]);
                }
            }
    
            if (joinString.length === 0) {
                return {"text": "Joint string is empty.", "ok": false};
            }
        } catch (err) {
            return {"text": "Error while parsing joinString: '" + err.message + "'", "ok": false};
        }
        
        try {
            for (var cn = 0; cn < columns.length; cn++) {
                var column = parseInt(columns[cn]) - 1;

                if (dataBox.beforeData.columns <= column) {
                    throw new Error("Index larger than number of columns");
                }
            }
        } catch (err) {
            return {"text": "Error while parsing column index: '" + err.message + "'", "ok": false};
        }

        return {"text": "", "ok": true};
    }
    
    transform(dataBox, transformOp) {
        var joinString = transformOp.substring("join column".length, transformOp.length).trim();
        
        
        var columns = [];
        var columnMap = {};

        if (joinString.indexOf(" ") > 0) {
            var splt = joinString.split(" ")
            joinString = splt[0].trim();
            for (var nx = 1; nx < splt.length; nx++) {
                columnMap[parseInt(splt[nx]) - 1] = true;
                columns.push(parseInt(splt[nx]) - 1);
            }
        }

        joinString = joinString.replace("\\n", "\n").replace("\\r", "\r").replace("\\t", "\t");

        var newRows = [];
        var maxColumns = 0;
        for (var y = 0; y < dataBox.beforeData.rows.length; y++) {
            var row = [];
            var merge = [];
            var mergeIndex = -1;

            for (var x = 0; x < dataBox.beforeData.rows[y].length; x++) {
                if (columns.length === 0 || columnMap[x]) {
                    merge.push(dataBox.beforeData.rows[y][x]);
                    if (mergeIndex === -1) {
                        mergeIndex = x;
                    }
                } else {
                    row.push(dataBox.beforeData.rows[y][x]);
                }
            }
            if (mergeIndex >= 0) {
                row.splice(mergeIndex, 0, merge.join(joinString));
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