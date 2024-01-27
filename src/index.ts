import * as core from "@actions/core";
import { context, getOctokit } from "@actions/github";

import { generateGuestbook } from "./book";
import * as utils from "./utils";

export interface Comment {
    id: number;
    text: string;
    user: string;
    url: string;
    apiUrl: string;
}

const approveReaction = "+1";
const defaultGuestbookPath = "README.md";

async function run(): Promise<void> {
    try {
        // Inputs and validation
        const token = core.getInput("token", { required: true });
        const octokit = getOctokit(token);

        const issue = Number(core.getInput("issue", { required: true }));
        if (isNaN(issue) || issue <= 0) {
            core.setFailed("❌ Invalid input: issue must be a valid number.");
            return;
        }

        const approvers = core
            .getInput("approvers", { required: true })
            .split("\n")
            .map(s => s.trim())
            .filter(x => x !== "");

        const guestbookPath = core.getInput("guestbook-path") || defaultGuestbookPath;

        utils.logInfo(`Retrieving issue commments from Issue #${issue}`);

        const issueRequestData = {
            issue_number: issue,
            owner: context.repo.owner,
            repo: context.repo.repo
        };

        const issueComments: Comment[] = [];
        for await (const issueCommentResponse of octokit.paginate.iterator(
            octokit.rest.issues.listComments,
            issueRequestData
        )) {
            if (issueCommentResponse.status < 200 || issueCommentResponse.status > 299) {
                core.error(
                    `❌ Received error response when retrieving guestbook issue comments: ${
                        issueCommentResponse.status
                    } - ${JSON.stringify(issueCommentResponse.data)}.`
                );
                break;
            }

            issueComments.push(
                ...issueCommentResponse.data.map(comment => {
                    return {
                        id: comment.id,
                        text: comment.body,
                        user: comment.user?.login || "ghost",
                        url: comment.html_url,
                        apiUrl: comment.url
                    } as Comment;
                })
            );
        }

        if (issueComments.length == 0) {
            core.error("❌ No issues retrieved.");
            return;
        }

        utils.logInfo(`Retrieved ${issueComments.length} issue comments.`);

        const approvedComments: Comment[] = [];
        for (const comment of issueComments) {
            console.log(`@${comment.user} said "${comment.text}"`);

            const commentRequestData = { comment_id: comment.id, ...issueRequestData };
            for await (const reactionsResponse of octokit.paginate.iterator(
                octokit.rest.reactions.listForIssueComment,
                commentRequestData
            )) {
                if (reactionsResponse.status < 200 || reactionsResponse.status > 299) {
                    core.error(
                        `❌ Received error response when retrieving comment reactions: ${
                            reactionsResponse.status
                        } - ${JSON.stringify(reactionsResponse.data)}.`
                    );
                    break;
                }

                let commentApproved = false;
                for (const reaction of reactionsResponse.data) {
                    if (
                        reaction.user &&
                        reaction.content == approveReaction &&
                        approvers.includes(reaction.user.login)
                    ) {
                        approvedComments.push(comment);
                        utils.logInfo(`Comment approved by ${reaction.user.login}. ${comment.url}`);
                        commentApproved = true;
                        break;
                    }
                }

                if (commentApproved) {
                    break;
                }
            }
        }

        utils.logInfo("✅ Approved comments 📝:");
        utils.logInfo(JSON.stringify(approvedComments));

        generateGuestbook(guestbookPath, approvedComments);

        utils.logInfo("🎉🎈🎊 Action complete 🎉🎈🎊");
    } catch (error) {
        core.setFailed(`❌ Action failed with error: ${error}`);
    }
}

run();
