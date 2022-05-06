import { Discussion } from "./types";
import { generateCallback, htmlToElement } from "./utils";

export const DownvoteButton = (
  count: number,
  enabled: boolean,
  onClick: (score: number) => void
) => {
  const element = htmlToElement(`
    <div class="beatmap-discussion__action">
      <button class="beatmap-discussion-vote beatmap-discussion-vote--down ${
        !enabled && "beatmap-discussion-vote--inactive"
      }" data-score="-1">
        <i class="fas fa-arrow-down"></i>
        <span class="beatmap-discussion-vote__count">${count}</span>
      </button>
    </div>
  `);
  element.addEventListener("click", () => onClick(-1));

  return element;
};

export const UpvoteButton = (
  count: number,
  enabled: boolean,
  onClick: (score: number) => void
) => {
  const element = htmlToElement(`
    <div class="beatmap-discussion__action">
      <button class="beatmap-discussion-vote beatmap-discussion-vote--up ${
        !enabled && "beatmap-discussion-vote--inactive"
      }" data-score="1">
        <i class="fas fa-arrow-up"></i>
        <span class="beatmap-discussion-vote__count">${count}</span>
      </button>
    </div>
  `);
  element.addEventListener("click", () => onClick(1));

  return element;
};

export const ReplyVoteArea = (
  discussion: Discussion,
  discussionId: number,
  beatmapsetId: number
) => {
  const childrens = [
    UpvoteButton(
      discussion.upvotes,
      discussion.vote == 1,
      generateCallback(discussionId, beatmapsetId, discussion.vote == 1)
    ),
    DownvoteButton(
      discussion.downvotes,
      discussion.vote == -1,
      generateCallback(discussionId, beatmapsetId, discussion.vote == -1)
    ),
  ];
  const element = htmlToElement(`
    <div class="beatmap-discussion__top-actions">
      <div class="beatmap-discussion__actions">
      </div>
    </div>
  `);

  element.firstElementChild.appendChild(childrens[0]);
  element.firstElementChild.appendChild(childrens[1]);
  return element;
};
