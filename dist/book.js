"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    Object.defineProperty(o, k2, { enumerable: true, get: function() { return m[k]; } });
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.generateGuestbook = void 0;
const fs = __importStar(require("fs"));
const startComment = "<!--START:guestbook-->";
const endComment = "<!--END:guestbook-->";
const commentSectionRegex = new RegExp(`${startComment}[\\s\\S]+${endComment}`);
function getReadme(path) {
    return fs.readFileSync(path).toString();
}
function writeReadme(path, content) {
    fs.writeFileSync(path, content);
}
function commentToMarkdown(comment) {
    return `[@${comment.user}](https://github.com/${comment.user}) said:
> ${comment.text}
<sup>[src](${comment.url})</sup>`;
}
function createGuestbookList(comments) {
    return comments.map(commentToMarkdown).join("\n\n---\n\n");
}
function generateGuestbook(path, comments) {
    const guestbook = getReadme(path);
    const guestbookList = createGuestbookList(comments);
    const updatedGuestbook = guestbook.replace(commentSectionRegex, guestbookList);
    writeReadme(path, updatedGuestbook);
}
exports.generateGuestbook = generateGuestbook;
