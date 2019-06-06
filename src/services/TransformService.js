import KeepLines from './transforms/KeepRows'
import Trim from './transforms/Trim'
import Replace from './transforms/Replace'
import TextToJson from './transforms/TextToJson'
import SplitColumn from './transforms/SplitColumn';
import SplitRow from './transforms/SplitRow';
import JoinColumn from './transforms/JoinColumn';
import Substring from './transforms/Substring';
import Copy from './transforms/Copy';
import Insert from './transforms/Insert';

export default class TransformService {
    get transforms() {
        return [new Copy(), new KeepLines(), new Trim(), new Replace(), new Substring(),
            new TextToJson(), new SplitRow(), new SplitColumn(), new JoinColumn(),
            new Insert()];
    }
    get commands() {
        var cmds = [];
        
        let ts = this.transforms;
        
        for (var n = 0; n < ts.length; n++) {
            if (ts[n].info) {
                var tsc = Array.isArray(ts[n].info()) ? ts[n].info() : [ts[n].info()];

                for (var m = 0; m < tsc.length; m++) {
                    cmds.push({command: tsc[m], transform: ts[n]})
                }
            }
        }

        return cmds;
    }
    createInitialData(initialValue) {
        return {sourceData: this.sourceData,
            beforeData: {type: "text", columns: 1, rows: [[initialValue]]},
            afterData: {type: "text", columns: 1, rows: [[initialValue]]},
            transforms: [""]};
    }
    
    validateTransformOp(dataBox, transformOp) {
        let ts = this.commands;
        
        for (var n = 0; n < ts.length; n++) {
            if (transformOp.startsWith(ts[n].command.prefix)) {
                return ts[n].transform.validate(dataBox, transformOp);
            }
        }
        
        return {"text": "'" + transformOp + "' does not match any known command.", "ok": false, "unknownCommand": true};
    }
    
    transform(dataBox, transformOp, preview) {
        let ts = this.commands;
        
        for (var n = 0; n < ts.length; n++) {
            if (transformOp.startsWith(ts[n].command.prefix)) {
                if (ts[n].transform.validate(dataBox, transformOp).ok) {
                    ts[n].transform.transform(dataBox, transformOp, preview);
                }
            }
        }
    }
    
    preview(dataBox, transformOp) {
        this.transform(dataBox, transformOp, true)
    }
    append(dataBox, transformOp) {
        this.transform(dataBox, transformOp);
        
        dataBox.beforeData.rows.splice(0, dataBox.beforeData.rows.length);
        for (var nkk = 0; nkk < dataBox.afterData.rows.length; nkk++) {
            dataBox.beforeData.rows.push(dataBox.afterData.rows[nkk]);
        }

        dataBox.transforms.push(transformOp);
        dataBox.beforeData.columns = dataBox.afterData.columns;
        dataBox.beforeData.type = dataBox.afterData.type;
        
        this.transform(dataBox, "");
    }
}