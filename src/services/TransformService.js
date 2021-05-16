import KeepLines from './transforms/KeepRows'
import Trim from './transforms/Trim'
import Replace from './transforms/Replace'
import TextToJson from './transforms/TextToJson'
import SplitColumn from './transforms/SplitColumn';
import SplitRow from './transforms/SplitRow';
import JoinColumn from './transforms/JoinColumn';
import JoinRow from './transforms/JoinRow';
import Substring from './transforms/Substring';
import Copy from './transforms/Copy';
import Insert from './transforms/Insert';

export default class TransformService {
    get transforms() {
        return [
            new Copy(),
            new KeepLines(),
            new Trim(),
            new Replace(),
            new Substring(),
            new SplitRow(),
            new SplitColumn(),
            new JoinColumn(),
            new JoinRow(),
            new Insert()
        ];
    }

    arrify(text) {
        let args = [];

        if (!text) {
            return args;
        }

        let t = "";
        let insideQuote = false;
        let escapeNext = false;

        for (let n = 0; n < text.length; n++) {
            if (!escapeNext && !insideQuote && text[n] === " ") {
                args.push(t.trim());
                t = "";
            } else if (!escapeNext && text[n] === "\\") {
                escapeNext = true;
            } else if (!escapeNext && !insideQuote && text[n] === '"') {
                insideQuote = true;
            } else if (!escapeNext && insideQuote && text[n] === '"') {
                insideQuote = false;
            } else {
                t += text[n];
                escapeNext = false;
            }
        }
        if (t.length) {
            args.push(t);
        }

        return args;
    }

    get commands() {
        var cmds = [];

        let ts = this.transforms;

        for (var n = 0; n < ts.length; n++) {
            if (ts[n].info) {
                var tsc = Array.isArray(ts[n].info()) ? ts[n].info() : [ts[n].info()];

                for (var m = 0; m < tsc.length; m++) {
                    cmds.push({ command: tsc[m], transform: ts[n] })
                }
            }
        }

        return cmds;
    }

    findCommand(inputArr) {
        for (var n = 0; n < this.commands.length; n++) {
            if (inputArr[0] === this.commands[n].command.prefix) {
                return this.commands[n];
            }
        }

        return null;
    }

    validateTransformOp(dataBox, inputArr) {
        const cmd = this.findCommand(inputArr);

        if (cmd) {
            return cmd.transform.validate(dataBox, inputArr);
        }

        return { "text": "'" + inputArr[0] + "' does not match any known command.", "ok": false, "unknownCommand": true };
    }

    transform(dataBox, inputArr) {
        const cmd = this.findCommand(inputArr);

        if (cmd && cmd.transform.validate(dataBox, inputArr).ok) {
            return cmd.transform.transform(dataBox, inputArr);
        }

        return null;
    }
}