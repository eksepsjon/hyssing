export default class Substring {
    
    matches(transformOp) {
        return transformOp.startsWith("substring");
    }
    
    validate(dataBox, transformOp) {
        if (dataBox.beforeData.type !== "text") {
            return {"text": "Command only works on text.", "ok": false};
        }
        
        try {
            var args = transformOp.substring("substring".length, transformOp.length).trim();
            var remStart = 0;
            var remEnd = 0;

            if (args.indexOf(" ") > 0) {
                var splt = args.split(" ")
                remStart = parseInt(splt[0]);

                if (splt.length > 1) {
                    remEnd = parseInt(splt[1]);
                }
            }
    
            if (args.length === 0) {
                return {"text": "No arguments.", "ok": false};
            }
        } catch (err) {
            return {"text": "Error while parsing arguments: '" + err.message + "'", "ok": false};
        }

        return {"text": "", "ok": true};
    }
    
    transform(dataBox, transformOp) {
        var args = transformOp.substring("substring".length, transformOp.length).trim();
        var remStart = 0;
        var remEnd = 0;

        if (args.indexOf(" ") > 0) {
            var splt = args.split(" ")
            remStart = parseInt(splt[0]);

            if (splt.length > 1) {
                remEnd = parseInt(splt[1]);
            }
        }

        var newRows = [];
        for (var y = 0; y < dataBox.beforeData.rows.length; y++) {
            var row = [];
            for (var x = 0; x < dataBox.beforeData.rows[y].length; x++) {
                var s = dataBox.beforeData.rows[y][x];
                try {
                    if(remStart > 0) {
                        s = s.substring(remStart, s.length);
                    }
                    if(remEnd > 0) {
                        s = s.substring(0, s.length - remEnd);
                    }
                } catch (err) {

                }
                row.push(s);
            }
            newRows.push(row);
        }

        dataBox.afterData.rows.splice(0, dataBox.afterData.rows.length);
        for (var nk = 0; nk < newRows.length; nk++) {
            dataBox.afterData.rows.push(newRows[nk]);
        }
    }
}