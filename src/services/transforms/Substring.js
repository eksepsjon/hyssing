export default class Substring {

    info() {
        return {
            "prefix": "substring",
            "arguments": "<Num chars left> <optional Num chars right>",
            "applicable": ["text"],
            "text": "Remove N characters starting from the left, and M number of characters from the right."
        }
    }

    validate(dataBox, inputArr) {
        if (dataBox.type !== "text") {
            return { "text": "Command only works on text.", "ok": false };
        }

        try {
            var remStart = inputArr && inputArr.length > 1 ? parseInt(inputArr[1]) : 0;
            var remEnd = inputArr && inputArr.length > 2 ? parseInt(inputArr[2]) : 0;

            if (remStart < 0 || remEnd < 0) {
                return { "text": "Argument cannot be less than 0.", "ok": false };
            }
        } catch (err) {
            return { "text": "Error while parsing arguments: '" + err.message + "'", "ok": false };
        }

        return { "text": "", "ok": true };
    }

    transform(dataBox, inputArr) {
        var remStart = inputArr && inputArr.length > 1 ? parseInt(inputArr[1]) : 0;
        var remEnd = inputArr && inputArr.length > 2 ? parseInt(inputArr[2]) : 0;

        var newRows = [];
        for (var y = 0; y < dataBox.data.length; y++) {
            var row = [];
            for (var x = 0; x < dataBox.data[y].length; x++) {
                var s = dataBox.data[y][x];
                if (remStart > 0) {
                    s = s.substring(remStart, s.length);
                }
                if (remEnd > 0) {
                    s = s.substring(0, s.length - remEnd);
                }
                row.push(s);
            }
            newRows.push(row);
        }

        return { rows: newRows.length, cols: dataBox.cols, type: dataBox.type, data: newRows };
    }
}