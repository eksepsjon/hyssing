export default class Replace {

    info() {
        return [{
            "prefix": "base64",
            "arguments": "",
            "applicable": ["text"],
            "text": "Replace all characters with a Base64 encoding."
        }, {
            "prefix": "unbase64",
            "arguments": "",
            "applicable": ["text"],
            "text": "Decode a Base64 string."
        }]
    }

    validate(dataBox, inputArr) {
        if (dataBox.type !== "text") {
            return { "text": "Command only works on text.", "ok": false };
        }

        return { "text": "", "ok": true };
    }

    transform(dataBox, inputArr) {

        var newRows = [];
        for (var y = 0; y < dataBox.data.length; y++) {
            var row = [];
            for (var x = 0; x < dataBox.data[y].length; x++) {
                if (inputArr[0] === "base64") {
                    row.push(btoa(dataBox.data[y][x]));
                } else {
                    row.push(atob(dataBox.data[y][x]));
                }
            }
            newRows.push(row);
        }

        return { rows: newRows.length, cols: dataBox.cols, type: dataBox.type, data: newRows };
    }
}