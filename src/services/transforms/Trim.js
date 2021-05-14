export default class Trim {

    info() {
        return {
            "prefix": "trim",
            "arguments": "<optional left | right | both>",
            "applicable": ["text"],
            "text": "Removes whitespace from the left, right or both sides. Both is default."
        }
    }

    validate(dataBox, inputArr) {
        if (dataBox.type !== "text") {
            return { "text": "Command only works on text.", "ok": false };
        }

        var whatToTrim = inputArr && inputArr.length > 1 ? inputArr[1] : "both";
        if (whatToTrim.length > 0) {
            if (whatToTrim !== "left" && whatToTrim !== "right" && whatToTrim !== "both") {
                return { "text": "Argument must be 'left', 'right' or 'both'.", "ok": false };
            }
        }

        return { "text": "", "ok": true };
    }

    transform(dataBox, inputArr) {
        var whatToTrim = inputArr && inputArr.length > 1 ? inputArr[1] : "both";

        var newData = [];
        for (let y = 0; y < dataBox.data.length; y++) {
            var row = [];
            for (let x = 0; x < dataBox.data[y].length; x++) {
                var inputTextArr = dataBox.data[y][x].split("\n");
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
                row.push(outputTextArr.join("\n"))
            }
            newData.push(row);
        }

        return { rows: dataBox.rows, cols: dataBox.cols, type: dataBox.type, data: newData };
    }
}