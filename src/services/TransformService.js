/* eslint-disable */
export default class TransformService {
    createInitialData(initialValue) {
        return {sourceData: this.sourceData,
            beforeData: {type: "text", columns: 1, rows: [[initialValue]]},
            afterData: {type: "text", columns: 1, rows: [[initialValue]]},
            transforms: [""]};
    }
// eslint-disable-next-line
    validateTransformOp(dataBox, transformOp) {
        if (transformOp.trim() === "") {
            return {"text": "", "ok": true};
        } else if (transformOp.startsWith("keep lines ")) {
            return {"text": "", "ok": true};
        } else {
            return {"text": "hmmm", "ok": false};
        }
    }
    // eslint-disable-next-line
    transform(dataBox, transformOp) {
        if (transformOp.trim() === "") {
            dataBox.afterData.rows.splice(0, dataBox.afterData.rows.length);
            for (var nkk = 0; nkk < dataBox.beforeData.length; nkk++) {
                dataBox.afterData.rows.push(dataBox.beforeData[nkk]);
            }
        } else if (transformOp.startsWith("keep lines")) {
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
                        if (inputTextArr[n].match(regex)) {
                            outputTextArr.push(inputTextArr[n].replace("\r", ""))
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
    
    preview(dataBox, transformOp) {
        this.transform(dataBox, transformOp)
    }
    append(dataBox, transformOp) {
        console.log("Before", transformOp, JSON.stringify(dataBox.beforeData))
        this.transform(dataBox, transformOp);

        console.log("AFterAftexr", transformOp, JSON.stringify(dataBox.afterData))
        
        dataBox.beforeData.rows.splice(0, dataBox.beforeData.rows.length);
        for (var nkk = 0; nkk < dataBox.afterData.rows.length; nkk++) {
            dataBox.beforeData.rows.push(dataBox.afterData.rows[nkk]);
        }

        dataBox.transforms.push(transformOp);
        
        this.transform(dataBox, "");
        console.log("AFtxer", JSON.stringify(dataBox.beforeData))
        console.log("AFterAfter",JSON.stringify(dataBox.afterData))
    }
}