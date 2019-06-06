export default class Insert {
    
    info() {
        return {
            "prefix": "insert",
            "arguments": "<String to surround existing text, text inserted by replacing {}>",
            "applicable": ["text"],
            "text": "Insert existing text into a string."
        }
    }
    
    validate(dataBox, transformOp) {
        if (dataBox.beforeData.type !== "text") {
            return {"text": "Command only works on text.", "ok": false};
        }
        
        var arg = transformOp.substring("index".length, transformOp.length).trim();

        if (arg.indexOf("{}") < 0) {
            return {"text": "Error while parsing argument: Must have {} to insert text into.", "ok": false};
        }

        return {"text": "", "ok": true};
    }
    
    transform(dataBox, transformOp) {
        var arg = transformOp.substring("insert".length, transformOp.length).trim();

        var regex = new RegExp("\\{\\}", "g");

        var newRows = [];
        for (var y = 0; y < dataBox.beforeData.rows.length; y++) {
            var row = [];
            for (var x = 0; x < dataBox.beforeData.rows[y].length; x++) {
                row.push(arg.replace(regex, dataBox.beforeData.rows[y][x]));
            }
            newRows.push(row);
        }

        dataBox.afterData.rows.splice(0, dataBox.afterData.rows.length);
        for (var nk = 0; nk < newRows.length; nk++) {
            dataBox.afterData.rows.push(newRows[nk]);
        }
    }
}