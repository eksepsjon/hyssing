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

        if (regex.length === 0) {
            return;
        }

        regex = new RegExp(regex, "i");

        var newRows = [];
        let maxCols = 0;
        for (var y = 0; y < dataBox.data.length; y++) {
            var inputText = dataBox.data[y].join("");

            if (inputArr[0] === "keep") {
                if (inputText.match(regex)) {
                    newRows.push(dataBox.data[y]);
                    maxCols = Math.max(dataBox.data[y].length, maxCols);
                }
            } else if (inputArr[0] === "drop") {
                if (!inputText.match(regex)) {
                    newRows.push(dataBox.data[y]);
                    maxCols = Math.max(dataBox.data[y].length, maxCols);
                }
            }
        }

        return { rows: newRows.length, cols: maxCols, type: dataBox.type, data: newRows };
    }
}