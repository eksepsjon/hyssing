export default class SplitColumn {

    info() {
        return {
            "prefix": "split",
            "arguments": "<Regex> <optional Column #>",
            "applicable": ["text"],
            "text": "Split each column into columns where the regex matches. If <Column #> is set only that column is split."
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
        var maxColumns = 0;
        for (var y = 0; y < dataBox.data.length; y++) {
            var row = [];
            for (var x = 0; x < dataBox.data[y].length; x++) {
                if (x === (column - 1)) {
                    var spltc = dataBox.data[y][x].split(regex);
                    for (var n = 0; n < spltc.length; n++) {
                        if ((x === 0 || x === dataBox.data[y].length - 1) && spltc[n].trim() === "") {
                            continue;
                        }
                        row.push(spltc[n]);
                    }
                } else {
                    row.push(dataBox.data[y][x]);
                }
            }
            maxColumns = Math.max(row.length, maxColumns);
            newRows.push(row);
        }

        return { rows: newRows.length, cols: maxColumns, type: dataBox.type, data: newRows };
    }
}