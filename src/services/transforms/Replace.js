export default class Replace {

    info() {
        return {
            "prefix": "replace",
            "arguments": "<Regex> <optional Replacement>",
            "applicable": ["text"],
            "text": "Replace all characters matching regex with replacement."
        }
    }

    validate(dataBox, inputArr) {
        if (dataBox.type !== "text") {
            return { "text": "Command only works on text.", "ok": false };
        }

        try {
            var regex = inputArr && inputArr.length > 1 ? inputArr[1] : "";

            if (regex.length === 0) {
                return { "text": "Regex is empty.", "ok": false };
            }

            regex = new RegExp(regex, "i");
        } catch (err) {
            return { "text": "Error while parsing regex: '" + err.message + "'", "ok": false };
        }

        return { "text": "", "ok": true };
    }

    transform(dataBox, inputArr) {
        var regex = inputArr && inputArr.length > 1 ? inputArr[1] : "";
        var replacement = inputArr && inputArr.length > 2 ? inputArr[2] : "";

        regex = new RegExp(regex, "g");

        var newRows = [];
        for (var y = 0; y < dataBox.data.length; y++) {
            var row = [];
            for (var x = 0; x < dataBox.data[y].length; x++) {
                row.push(dataBox.data[y][x].replace(regex, replacement));
            }
            newRows.push(row);
        }

        return { rows: newRows.length, cols: dataBox.cols, type: dataBox.type, data: newRows };
    }
}