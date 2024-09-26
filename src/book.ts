import * as fs from "fs";

import { Comment } from "./index";

const startComment = "<!--START:guestbook-->";
const endComment = "<!--END:guestbook-->";
const commentSectionRegex = new RegExp(`${startComment}[\\s\\S]+${endComment}`);

function getReadme(path: string): string {
    return fs.readFileSync(path).toString();
}

function writeReadme(path: string, content: string): void {
    fs.writeFileSync(path, content);
}

function commentToMarkdown(comment: Comment): string {
    const quotedComment = comment.text
        .split("\n")
        .map(line => `> ${line}`)
        .join("\n");

    const handleLink = `[@${comment.user}](https://github.com/${comment.user})`;

    return `${quotedComment}\n-${handleLink}`;
}

function createGuestbookList(comments: Comment[]): string {
    return comments.map(commentToMarkdown).join("\n\n");
}

export function generateGuestbook(path: string, comments: Comment[]): void {
    const guestbook = getReadme(path);
    const guestbookList = createGuestbookList(comments);
    const guestbookContent = `${startComment}\n${guestbookList}\n${endComment}`;
    const updatedGuestbook = guestbook.replace(commentSectionRegex, guestbookContent);
    writeReadme(path, updatedGuestbook);
}
