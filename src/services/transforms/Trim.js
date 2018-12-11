export default class KeepLines {
    
    matches(transformOp) {
        return transformOp.startsWith("trim");
    }
    
    validate(dataBox, transformOp) {
        if (dataBox.beforeData.type !== "text") {
            return {"text": "Command only works on text.", "ok": false};
        }
        
        var whatToTrim = transformOp.substring("trim".length, transformOp.length).trim();
        if (whatToTrim.length > 0) {
            if (whatToTrim !== "left" && whatToTrim !== "right" && whatToTrim !== "both") {
                return {"text": "Argument must be 'left', 'right' or 'both'.", "ok": false};
            }
        }

        return {"text": "", "ok": true};
    }
    
    transform(dataBox, transformOp) {
        var whatToTrim = transformOp.substring("trim".length, transformOp.length).trim();

        var newRows = [];
        for (var y = 0; y < dataBox.beforeData.rows.length; y++) {
            var row = [];
            for (var x = 0; x < dataBox.beforeData.rows[y].length; x++) {
                var inputTextArr = dataBox.beforeData.rows[y][x].split("\n");
                var outputTextArr = [];

                for (var n = 0; n < inputTextArr.length; n++) {
                    if (whatToTrim === "both" || whatToTrim.length === 0) {
                        outputTextArr.push(inputTextArr[n].trim())
                    } else if (whatToTrim === "left") {
                        outputTextArr.push(inputTextArr[n].trimStart())
                    } else if (whatToTrim === "right") {
                        outputTextArr.push(inputTextArr[n].trimEnd())
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