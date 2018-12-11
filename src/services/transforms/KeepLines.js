export default class KeepLines {
    
    matches(transformOp) {
        return transformOp.startsWith("keep lines ") || transformOp.startsWith("drop lines ");
    }
    
    validate(dataBox, transformOp) {
        if (dataBox.beforeData.type !== "text") {
            return {"text": "Command only works on text.", "ok": false};
        }
        
        try {
            var regex = transformOp.substring("keep lines".length, transformOp.length).trim();
    
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
        var regex = transformOp.substring("keep lines".length, transformOp.length).trim();

        if (regex.length === 0) {
            return;
        }

        regex = new RegExp(regex, "i");

        var newRows = [];
        for (var y = 0; y < dataBox.beforeData.rows.length; y++) {
            var row = [];
            for (var x = 0; x < dataBox.beforeData.rows[y].length; x++) {
                var inputTextArr = dataBox.beforeData.rows[y][x].split("\n");
                var outputTextArr = [];

                for (var n = 0; n < inputTextArr.length; n++) {
                    if (transformOp.startsWith("keep")) {
                        if (inputTextArr[n].match(regex)) {
                            outputTextArr.push(inputTextArr[n].replace("\r", ""))
                        }
                    } else if (transformOp.startsWith("drop")) {
                        if (!inputTextArr[n].match(regex)) {
                            outputTextArr.push(inputTextArr[n].replace("\r", ""))
                        }
                    }
                }
                row.push(outputTextArr.join("\n"));
            }
            newRows.push(row);
        }
        
        dataBox.afterData.rows.splice(0, dataBox.afterData.rows.length);
        for (var nk = 0; nk < newRows.length; nk++) {
            dataBox.afterData.rows.push(newRows[nk]);
        }
    }
}