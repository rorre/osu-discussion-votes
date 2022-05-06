import {
  getAllDiscussions,
  isDiscussionPage,
  htmlToElement,
  findById,
  getDiscussionData,
  post,
  generateCallback,
} from "./utils";
import { DownvoteButton, ReplyVoteArea } from "./elements";
import { Discussion } from "./types";

var beatmapsetId: number;
var discussionsData: Discussion[] = [];

function main() {
  setInterval(async () => {
    console.log("hi?");
    if (!isDiscussionPage()) return;
    console.log("hi!");
    let tab;
    [tab, beatmapsetId, discussionsData] = await getDiscussionData();
    const discussions = getAllDiscussions();

    discussions.forEach((element) => {
      if (element.dataset.voteInited) return;
      element.dataset.voteInited = "true";

      const discussionId = Number(element.dataset.id);
      const discussion = findById(discussionsData, discussionId);

      const actionsArea = element.querySelector(".beatmap-discussion__actions");
      actionsArea.children[1].insertAdjacentElement(
        "afterend",
        DownvoteButton(
          discussion.downvotes,
          discussion.vote == -1,
          generateCallback(discussionId, beatmapsetId)
        )
      );

      const replies = element.querySelectorAll<HTMLElement>(
        ".beatmap-discussion-post--reply:not(.beatmap-discussion-post--new-reply)"
      );
      replies.forEach((reply) => {
        const replyId = Number(reply.dataset.postId);
        const replyDiscussion = findById(discussionsData, replyId);

        reply.firstElementChild.appendChild(
          ReplyVoteArea(replyDiscussion, replyId, beatmapsetId)
        );
      });
    });
  }, 1000);
}

main();
