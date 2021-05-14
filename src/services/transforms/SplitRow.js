export default class SplitRow {

    info() {
        return {
            "prefix": "splitrow",
            "arguments": "<Regex> <optional Column #>",
            "applicable": ["text"],
            "text": "Split each row into new rows where the regex matches. If <Column #> is not set the first column is used to split the row."
        }
    }

    validate(dataBox, inputArr) {
        if (dataBox.type !== "text") {
            return { "text": "Command only works on text.", "ok": false };
        }


        var column = inputArr && inputArr.length > 2 ? inputArr[2] : "1";

        try {
            var regex = inputArr && inputArr.length > 1 ? inputArr[1] : "";

            if (regex.length === 0) {
                return { "text": "Regex is empty.", "ok": false };
            }

            regex = new RegExp(regex, "i");
        } catch (err) {
            return { "text": "Error while parsing regex: '" + err.message + "'", "ok": false };
        }

        try {
            column = parseInt(column);

            if (dataBox.cols < column) {
                throw new Error("Index larger than number of columns");
            }
        } catch (err) {
            return { "text": "Error while parsing column index: '" + err.message + "'", "ok": false };
        }

        return { "text": "", "ok": true };
    }

    transform(dataBox, inputArr) {
        var regex = inputArr && inputArr.length > 1 ? inputArr[1] : "";
        var column = inputArr && inputArr.length > 2 ? parseInt(inputArr[2]) : 1;

        regex = new RegExp(regex, "g");

        var newRows = [];
        let maxCols = 0;

        for (var y = 0; y < dataBox.data.length; y++) {
            for (var x = 0; x < dataBox.data[y].length; x++) {
                if (x === (column - 1)) {
                    var spltc = dataBox.data[y][x].split(regex);
                    for (var n = 0; n < spltc.length; n++) {
                        if (spltc[n].trim() === "") {
                            continue;
                        }
                        var newRow = JSON.parse(JSON.stringify(dataBox.data[y]))
                        newRow[x] = spltc[n];
                        newRows.push(newRow);
                        maxCols = Math.max(newRow.length, maxCols);
                    }
                }
            }
        }

        return { rows: newRows.length, cols: maxCols, type: dataBox.type, data: newRows };
    }
}