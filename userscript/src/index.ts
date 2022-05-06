import {
  getAllDiscussions,
  isDiscussionPage,
  findById,
  getDiscussionData,
  generateCallback,
  getBeatmapSetId,
} from "./utils";
import { DownvoteButton, ReplyVoteArea } from "./elements";
import { Discussion } from "./types";

var beatmapsetId: number;
var discussionsData: Discussion[] = [];
var lastMapsetId: number;
var shouldFetch = true;

function drawParentVotes(
  element: HTMLElement,
  discussion: Discussion,
  discussionId: number
) {
  const actionsArea = element.querySelector(".beatmap-discussion__actions");
  const downvoteElem = DownvoteButton(
    discussion.downvotes,
    discussion.vote == -1,
    generateCallback(discussionId, beatmapsetId)
  );
  if (!element.dataset.voteInited) {
    actionsArea.children[1].insertAdjacentElement("afterend", downvoteElem);
  } else {
    actionsArea.children[2].replaceWith(downvoteElem);
  }
}

function drawRepliesVotes(element: HTMLElement) {
  const replies = element.querySelectorAll<HTMLElement>(
    ".beatmap-discussion-post--reply:not(.beatmap-discussion-post--new-reply)"
  );
  replies.forEach((reply) => {
    const replyId = Number(reply.dataset.postId);
    const replyDiscussion = findById(discussionsData, replyId);

    const replyElem = ReplyVoteArea(replyDiscussion, replyId, beatmapsetId);
    if (!element.dataset.voteInited) {
      reply.firstElementChild.appendChild(replyElem);
    } else {
      reply.firstElementChild.lastElementChild.replaceWith(replyElem);
    }
  });
}

function drawVotes() {
  const discussions = getAllDiscussions();
  discussions.forEach((element) => {
    const discussionId = Number(element.dataset.id);
    const discussion = findById(discussionsData, discussionId);

    drawParentVotes(element, discussion, discussionId);
    drawRepliesVotes(element);

    element.dataset.voteInited = "true";
  });
}

function main() {
  setInterval(async () => {
    if (!isDiscussionPage()) return;

    let currentSetId = getBeatmapSetId();
    if (currentSetId != lastMapsetId) shouldFetch = true;

    if (shouldFetch) {
      [beatmapsetId, discussionsData] = await getDiscussionData();
      shouldFetch = false;
    }

    drawVotes();
  }, 1000);
}

main();
