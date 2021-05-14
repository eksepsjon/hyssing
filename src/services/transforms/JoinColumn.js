export default class JoinColumn {

    info() {
        return {
            "prefix": "joincol",
            "arguments": "<Join String> <optional Column #> .. <optional Column #>",
            "applicable": ["text"],
            "text": "Merge columns with <Join String>. Optionally select which columns to merge, otherwise all columns are merged."
        }
    }

    validate(dataBox, inputArr) {
        if (dataBox.type !== "text") {
            return { "text": "Command only works on text.", "ok": false };
        }

        var joinString = inputArr && inputArr.length > 1 ? inputArr[1] : "";

        if (joinString.length === 0) {
            return { "text": "Join string is empty.", "ok": false };
        }

        for (let n = 2; n < inputArr.length; n++) {
            try {
                var column = parseInt(inputArr[n]) - 1;

                if (dataBox.cols <= column) {
                    throw new Error("Index larger than number of columns");
                }
            } catch (err) {
                return { "text": "Error while parsing column index: '" + n + "': '" + err.message + "'", "ok": false };
            }
        }

        return { "text": "", "ok": true };
    }

    transform(dataBox, inputArr) {
        var joinString = inputArr && inputArr.length > 1 ? inputArr[1] : "";


        var columns = [];
        var columnMap = {};

        for (let n = 2; n < inputArr.length; n++) {
            columnMap[parseInt(inputArr[n]) - 1] = true;
            columns.push(parseInt(inputArr[n]) - 1);
        }

        joinString = joinString.replace("\\n", "\n").replace("\\r", "\r").replace("\\t", "\t");

        var newRows = [];
        var maxColumns = 0;
        for (var y = 0; y < dataBox.data.length; y++) {
            var row = [];
            var merge = [];
            var mergeIndex = -1;

            for (var x = 0; x < dataBox.data[y].length; x++) {
                if (columns.length === 0 || columnMap[x]) {
                    merge.push(dataBox.data[y][x]);
                    if (mergeIndex === -1) {
                        mergeIndex = x;
                    }
                } else {
                    row.push(dataBox.data[y][x]);
                }
            }
            if (mergeIndex >= 0) {
                row.splice(mergeIndex, 0, merge.join(joinString));
            }
            maxColumns = Math.max(row.length, maxColumns);
            newRows.push(row);
        }

        return { rows: newRows.length, cols: maxColumns, type: dataBox.type, data: newRows };
    }
}