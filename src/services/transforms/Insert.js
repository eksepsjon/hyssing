export default class Insert {

    info() {
        return {
            "prefix": "insert",
            "arguments": "<String to surround existing text, text inserted by replacing {}>",
            "applicable": ["text"],
            "text": "Insert existing text into a string."
        }
    }

    validate(dataBox, inputArr) {
        if (dataBox.type !== "text") {
            return { "text": "Command only works on text.", "ok": false };
        }

        var arg = inputArr && inputArr.length > 1 ? inputArr[1] : "";;

        if (arg.indexOf("{}") < 0) {
            return { "text": "Error while parsing argument: Must have {} to insert text into.", "ok": false };
        }

        return { "text": "", "ok": true };
    }

    transform(dataBox, inputArr) {
        var arg = inputArr && inputArr.length > 1 ? inputArr[1] : "";;

        var regex = new RegExp("\\{\\}", "g");

        var newRows = [];
        for (var y = 0; y < dataBox.data.length; y++) {
            var row = [];
            for (var x = 0; x < dataBox.data[y].length; x++) {
                row.push(arg.replace(regex, dataBox.data[y][x]));
            }
            newRows.push(row);
        }

        return { rows: newRows.length, cols: dataBox.cols, type: dataBox.type, data: newRows };
    }
}