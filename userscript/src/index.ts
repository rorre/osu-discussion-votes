import {
  getAllDiscussions,
  isDiscussionPage,
  findById,
  getDiscussionData,
  generateCallback,
  getBeatmapSetId,
  getAllReplies,
} from "./utils";
import { DownvoteButton, ReplyVoteArea } from "./elements";
import { Discussion } from "./types";
import { state } from "./state";

function drawParentVotes(
  element: HTMLElement,
  discussion: Discussion,
  discussionId: number
) {
  const actionsArea = element.querySelector(".beatmap-discussion__actions");
  const downvoteElem = DownvoteButton(
    discussion.downvotes,
    discussion.vote == -1,
    generateCallback(discussionId, state.beatmapsetId, discussion.vote == -1)
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
    const replyDiscussion = findById(state.discussionsData, replyId);

    const replyElem = ReplyVoteArea(
      replyDiscussion,
      replyId,
      state.beatmapsetId
    );
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
    const discussion = findById(state.discussionsData, discussionId);

    drawParentVotes(element, discussion, discussionId);
    drawRepliesVotes(element);

    element.dataset.voteInited = "true";
  });
}

function main() {
  let lastDiscussionCount = 0;
  let lastRepliesCount = 0;

  setInterval(async () => {
    if (!isDiscussionPage()) return;

    let currentUrl = window.location.href;
    let currentSetId = getBeatmapSetId();
    let currentDiscussionCount = getAllDiscussions().length;
    let currentRepliesCount = getAllReplies().length;

    if (
      currentSetId != state.lastMapsetId ||
      currentUrl != state.lastUrl ||
      lastDiscussionCount !== currentDiscussionCount ||
      lastRepliesCount !== currentRepliesCount
    )
      state.shouldFetch = true;

    if (state.shouldFetch) {
      [state.beatmapsetId, state.discussionsData] = await getDiscussionData();
      state.shouldFetch = false;
      state.lastMapsetId = currentSetId;
      state.lastUrl = currentUrl;
      drawVotes();
    }
    lastDiscussionCount = currentDiscussionCount;
  }, 100);
}

// @ts-ignore
unsafeWindow.setCookie = (cookie: string) => {
  GM.setValue("cookie", cookie);
  alert("Authorized!");
  document.close();
};
main();
