export default class KeepRows {

    info() {
        return [{
            "prefix": "keep", 
            "arguments": "<Regex>",
            "applicable": ["text"],
            "text": "Keep rows that match the regex."
        }, {
            "prefix": "drop", 
            "arguments": "<Regex>",
            "applicable": ["text"],
            "text": "Drop rows that match the regex."
        }]
    }
    
    validate(dataBox, transformOp) {
        if (dataBox.beforeData.type !== "text") {
            return {"text": "Command only works on text.", "ok": false};
        }
        
        try {
            var regex = transformOp.substring("keep".length, transformOp.length).trim();
    
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
        var regex = transformOp.substring("keep".length, transformOp.length).trim();

        if (regex.length === 0) {
            return;
        }

        regex = new RegExp(regex, "i");

        var newRows = [];
        for (var y = 0; y < dataBox.beforeData.rows.length; y++) {
            var inputText = dataBox.beforeData.rows[y].join("");
            
            if (transformOp.startsWith("keep")) {
                if (inputText.match(regex)) {
                    newRows.push(dataBox.beforeData.rows[y]);
                }
            } else if (transformOp.startsWith("drop")) {
                if (!inputText.match(regex)) {
                    newRows.push(dataBox.beforeData.rows[y]);
                }
            }
            
        }
        
        dataBox.afterData.rows.splice(0, dataBox.afterData.rows.length);
        for (var nk = 0; nk < newRows.length; nk++) {
            dataBox.afterData.rows.push(newRows[nk]);
        }
    }
}