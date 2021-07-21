export default class JoinColumn {

    info() {
        return {
            "prefix": "transpose",
            "arguments": "<Number of rows>",
            "applicable": ["text"],
            "text": "Move row 1 2 .. # to separate columns, repeating until row max is reached."
        }
    }

    validate(dataBox, inputArr) {
        if (dataBox.type !== "text") {
            return { "text": "Command only works on text.", "ok": false };
        }

        if (dataBox.cols > 1) {
            return { "text": "Number of columns must be 1", "ok": false };
        }

        var rowCount = inputArr && inputArr.length > 1 ? parseInt(inputArr[1]) : 1;

        if (rowCount < 2) {
            return { "text": "Number of rows should be more than 1", "ok": false };
        }

        return { "text": "", "ok": true };
    }

    transform(dataBox, inputArr) {
        var rowCount = inputArr && inputArr.length > 1 ? parseInt(inputArr[1]) : 1;


        var newRows = [];
        var maxColumns = 0;
        var currentRow = [];
        var currentIncr = 0;
        for (var y = 0; y < dataBox.data.length; y++) {
            currentIncr++;
            currentRow.push(dataBox.data[y][0]);
            maxColumns = Math.max(currentRow.length, maxColumns);
            if (currentIncr >= rowCount) {
                newRows.push(currentRow);
                currentRow = [];
                currentIncr = 0;
            }
        }

        maxColumns = Math.max(currentRow.length, maxColumns);
        newRows.push(currentRow);

        return { rows: newRows.length, cols: maxColumns, type: dataBox.type, data: newRows };
    }
}