export default class TransformService {
    createInitialData(initialValue) {
        return {sourceData: this.sourceData,
            beforeData: {type: "text", columns: 1, rows: [[initialValue]]},
            afterData: {type: "text", columns: 1, rows: [[initialValue]]},
            transforms: [""]};
    }
// eslint-disable-next-line
    validateTransformOp(dataBox, transformOp) {
        if (transformOp.trim() === "") {
            return {"text": "", "ok": true};
        } else if (transformOp.trim() === "test") {
            return {"text": "", "ok": true};
        } else {
            return {"text": "hmmm", "ok": false};
        }
    }
    // eslint-disable-next-line
    transform(dataBox, transformOp) {
        dataBox.beforeData.rows.splice(0, dataBox.beforeData.rows.length);
        dataBox.afterData.rows.splice(0, dataBox.afterData.rows.length, ["hmm"]);
    }
}