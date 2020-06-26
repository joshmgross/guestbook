import * as core from "@actions/core";
import { context, getOctokit } from "@actions/github";

import * as utils from "./utils";

interface Comment {
    id: number;
    text: string;
    user: string;
    url: string;
    apiUrl: string;
}

const approveReaction = "+1";
const approvers = ["joshmgross"];

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

        utils.logInfo(`Retrieving issue commments from Issue #${issue}`);

        const issueRequestData = {
            // 🐫
            // eslint-disable-next-line @typescript-eslint/camelcase
            issue_number: issue,
            owner: context.repo.owner,
            repo: context.repo.repo
        };

        const issueComments: Comment[] = [];
        for await (const issueCommentResponse of octokit.paginate.iterator(
            octokit.issues.listComments,
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
                        user: comment.user.login,
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

            // 🐫
            // eslint-disable-next-line @typescript-eslint/camelcase
            const commentRequestData = { comment_id: comment.id, ...issueRequestData };
            for await (const reactionsResponse of octokit.paginate.iterator(
                octokit.reactions.listForIssueComment,
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
                    if (reaction.content == approveReaction && approvers.includes(reaction.user.login)) {
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
        utils.logInfo("🎉🎈🎊 Action complete 🎉🎈🎊");
    } catch (error) {
        core.setFailed(`❌ Action failed with error: ${error}`);
    }
}

run();
