export default class Replace {
    
    info() {
        return {
            "prefix": "replace",
            "command": "replace <Regex> <optional Replacement>",
            "applicable": ["text"],
            "text": "Replace all characters matching regex with replacement."
        }
    }
    
    validate(dataBox, transformOp) {
        if (dataBox.beforeData.type !== "text") {
            return {"text": "Command only works on text.", "ok": false};
        }
        
        try {
            var regex = transformOp.substring("replace".length, transformOp.length).trim();

            if (regex.indexOf(" ") > 0) {
                var splt = regex.split(" ", 2)
                regex = splt[0];
            }
    
            if (regex.length === 0) {
                return {"text": "Regex is empty.", "ok": false};
            }
    
            regex = new RegExp(regex, "i");
        } catch (err) {
            return {"text": "Error while parsing regex: '" + err.message + "'", "ok": false};
        }

        return {"text": "", "ok": true};
    }
    
    transform(dataBox, transformOp) {
        var regex = transformOp.substring("replace".length, transformOp.length).trim();
        var replacement = "";

        if (regex.indexOf(" ") > 0) {
            var splt = regex.split(" ", 2)
            regex = splt[0];
            replacement = splt[1];
        }

        regex = new RegExp(regex, "g");

        var newRows = [];
        for (var y = 0; y < dataBox.beforeData.rows.length; y++) {
            var row = [];
            for (var x = 0; x < dataBox.beforeData.rows[y].length; x++) {
                row.push(dataBox.beforeData.rows[y][x].replace(regex, replacement));
            }
            newRows.push(row);
        }

        dataBox.afterData.rows.splice(0, dataBox.afterData.rows.length);
        for (var nk = 0; nk < newRows.length; nk++) {
            dataBox.afterData.rows.push(newRows[nk]);
        }
    }
}