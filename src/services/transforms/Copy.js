export default class Copy {

    info() {
        return {
            "prefix": "copy",
            "arguments": "",
            "applicable": ["text", "json"],
            "text": "Copy to clipboard."
        }
    }
    
    validate() {
        if (!navigator.clipboard) {
            return {"text": "Browser does not support Clipboard API", "ok": false};
        }
        return {"text": "", "ok": true};
    }
    
    transform(dataBox, transformOp, preview) {
        if (!preview) {
            var text = []
            
            for (var y = 0; y < dataBox.beforeData.rows.length; y++) {
                text.push(dataBox.beforeData.rows[y].join("\t"))
            }

            navigator.clipboard.writeText(text.join("\n")).then(function() {
                // eslint-disable-next-line
                console.log('Async: Copying to clipboard was successful!');
            }, function(err) {
                // eslint-disable-next-line
                console.error('Async: Could not copy text: ', err);
            });
        }
    }
}