"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.logInfo = void 0;
const ColorReset = "\x1b[0m";
var TextEffect;
(function (TextEffect) {
    TextEffect["Bright"] = "\u001B[1m";
    TextEffect["Dim"] = "\u001B[2m";
    TextEffect["Underscore"] = "\u001B[4m";
    TextEffect["Blink"] = "\u001B[5m";
    TextEffect["Reverse"] = "\u001B[7m";
    TextEffect["Hidden"] = "\u001B[8m";
})(TextEffect || (TextEffect = {}));
var ForegroundColor;
(function (ForegroundColor) {
    ForegroundColor["Black"] = "\u001B[30m";
    ForegroundColor["Red"] = "\u001B[31m";
    ForegroundColor["Green"] = "\u001B[32m";
    ForegroundColor["Yellow"] = "\u001B[33m";
    ForegroundColor["Blue"] = "\u001B[34m";
    ForegroundColor["Magenta"] = "\u001B[35m";
    ForegroundColor["Cyan"] = "\u001B[36m";
    ForegroundColor["White"] = "\u001B[37m";
})(ForegroundColor || (ForegroundColor = {}));
function logInfo(message) {
    const textFormat = `${TextEffect.Underscore}${ForegroundColor.Cyan}`;
    console.log(`${textFormat}${message}${ColorReset}`);
}
exports.logInfo = logInfo;
