import {
  getAllDiscussions,
  isDiscussionPage,
  htmlToElement,
  findById,
} from "./utils";
import { UpvoteButton, DownvoteButton, ReplyVoteArea } from "./elements";
import { Discussion } from "./types";

const mock: Discussion[] = [
  {
    id: 2183462,
    upvotes: 0,
    downvotes: 99,
    vote: 0,
  },
  {
    id: 6264481,
    upvotes: 0,
    downvotes: 39,
    vote: -1,
  },
];

async function main() {
  setInterval(() => {
    if (!isDiscussionPage()) return;
    const discussions = getAllDiscussions();

    discussions.forEach((element) => {
      if (element.dataset.voteInited) return;
      element.dataset.voteInited = "true";

      const discussionId = Number(element.dataset.id);
      const discussion = findById(mock, discussionId);

      const actionsArea = element.querySelector(".beatmap-discussion__actions");
      actionsArea.children[1].insertAdjacentElement(
        "afterend",
        DownvoteButton(discussion.downvotes, discussion.vote == -1)
      );

      const replies = element.querySelectorAll<HTMLElement>(
        ".beatmap-discussion-post--reply:not(.beatmap-discussion-post--new-reply)"
      );
      replies.forEach((reply) => {
        const replyId = Number(reply.dataset.postId);
        const replyDiscussion = findById(mock, replyId);

        reply.firstElementChild.appendChild(ReplyVoteArea(replyDiscussion));
      });
    });
  }, 1000);
}

main().catch((e) => {
  console.log(e);
});
