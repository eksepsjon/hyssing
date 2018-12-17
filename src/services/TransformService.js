import KeepLines from './transforms/KeepLines'
import Trim from './transforms/Trim'
import Replace from './transforms/Replace'
import TextToJson from './transforms/TextToJson'
import SplitColumn from './transforms/SplitColumn';
import JoinColumn from './transforms/JoinColumn';

export default class TransformService {
    get transforms() {
        return [new KeepLines(), new Trim(), new Replace(), new Substring(), new TextToJson(), new SplitColumn(), new JoinColumn()];
    }
    createInitialData(initialValue) {
        return {sourceData: this.sourceData,
            beforeData: {type: "text", columns: 1, rows: [[initialValue]]},
            afterData: {type: "text", columns: 1, rows: [[initialValue]]},
            transforms: [""]};
    }
    
    validateTransformOp(dataBox, transformOp) {
        let ts = this.transforms;
        
        for (var n = 0; n < ts.length; n++) {
            if (ts[n].matches(transformOp)) {
                return ts[n].validate(dataBox, transformOp);
            }
        }
        
        return {"text": "'" + transformOp + "' does not match any known command.", "ok": false};
    }
    
    transform(dataBox, transformOp) {
        let ts = this.transforms;
        
        for (var n = 0; n < ts.length; n++) {
            if (ts[n].matches(transformOp)) {
                if (ts[n].validate(dataBox, transformOp).ok) {
                    ts[n].transform(dataBox, transformOp);
                }
            }
        }
    }
    
    preview(dataBox, transformOp) {
        this.transform(dataBox, transformOp)
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