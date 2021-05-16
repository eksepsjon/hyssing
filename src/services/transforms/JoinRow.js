export default class JoinRow {

    info() {
        return {
            "prefix": "joinrow",
            "arguments": "<Join String>",
            "applicable": ["text"],
            "text": "Merge columns with <Join String>."
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

        return { "text": "", "ok": true };
    }

    transform(dataBox, inputArr) {
        var joinString = inputArr && inputArr.length > 1 ? inputArr[1] : "";


        var columns = [];

        for (let c = 0; c < dataBox.cols; c++) {
            columns.push([])
        }
        for (var y = 0; y < dataBox.data.length; y++) {
            for (var x = 0; x < dataBox.data[y].length; x++) {
                columns[x].push(dataBox.data[y][x])
            }
        }

        joinString = joinString.replace("\\n", "\n").replace("\\r", "\r").replace("\\t", "\t");

        var newRow = [
            []
        ];

        for (let c = 0; c < dataBox.cols; c++) {
            newRow[0].push(columns[c].join(joinString));
        }

        return { rows: newRow.length, cols: columns.length, type: dataBox.type, data: newRow };
    }
}