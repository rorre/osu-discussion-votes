import axios, { AxiosRequestConfig, AxiosResponse } from "axios";
import adapter from "axios-userscript-adapter";
import { API_URL } from "./constants";
import { state } from "./state";
import { Discussion } from "./types";
const PATH_RE =
  /beatmapsets\/(?<setid>\d+)\/discussion(?:\/(?:[-\d]+)\/(?<tab>.+))?/;

axios.interceptors.response.use(
  function (response) {
    return response;
  },
  function (error) {
    if (error.response.status === 401) {
      alert("Authorization failed, you will need to relogin.");
      GM.openInTab(API_URL + "/auth", false);
      return;
    }
    return Promise.reject(error);
  }
);

export function get<T = any, R = AxiosResponse<T>>(
  url: string,
  config?: Exclude<Partial<AxiosRequestConfig>, "adapter">
): Promise<R> {
  return axios.get(url, {
    adapter,
    ...config,
  });
}

export function post<T = any, R = AxiosResponse<T>>(
  url: string,
  data?: any,
  config?: Exclude<Partial<AxiosRequestConfig>, "adapter">
): Promise<R> {
  return axios.post(url, data, {
    adapter,
    ...config,
  });
}

export function htmlToElement(html: string) {
  var template = document.createElement("template");
  html = html.trim(); // Never return a text node of whitespace as the result
  template.innerHTML = html;
  return template.content.firstElementChild;
}

export async function getDiscussionData(): Promise<[number, Discussion[]]> {
  const result = PATH_RE.exec(window.location.href);
  if (!result) return undefined;

  const cookie = await GM.getValue("cookie");
  const beatmapsetId = Number(result.groups.setid);
  const res = await get(API_URL + "/vote/mapset/" + beatmapsetId, {
    withCredentials: true,
    headers: {
      Cookie: `authsession=${cookie}`,
    },
  });
  return [beatmapsetId, res.data.discussions];
}

export function getBeatmapSetId() {
  const result = PATH_RE.exec(window.location.href);
  if (!result) return undefined;

  return Number(result.groups.setid);
}

export function isDiscussionPage() {
  const result = PATH_RE.exec(window.location.href);
  if (!result) return false;

  const tab = result.groups.tab ?? "generalAll";
  if (tab.startsWith("events") || tab.startsWith("reviews")) return false;
  return true;
}

export function getAllDiscussions() {
  return document.querySelectorAll<HTMLElement>(".beatmap-discussion");
}

export function getAllReplies() {
  return document.querySelectorAll<HTMLElement>(
    ".beatmap-discussion-post--reply:not(.beatmap-discussion-post--new-reply)"
  );
}

export function findById(arr: Discussion[], id: number): Discussion {
  for (const discussion of arr) {
    if (discussion.id == id) return discussion;
  }
  return {
    id: 0,
    upvotes: 0,
    downvotes: 0,
    vote: 0,
  };
}

export function generateCallback(
  discussionId: number,
  beatmapsetId: number,
  shouldRevert: boolean
) {
  async function onVoteClick(score: number) {
    const cookie = await GM.getValue("cookie");
    if (!cookie) {
      if (confirm("Authorization required. Would you like to log in?")) {
        GM.openInTab(API_URL + "/auth", false);
      }
      return;
    }

    await post(
      API_URL + "/vote/" + discussionId,
      {
        discussion_id: discussionId,
        beatmapset_id: beatmapsetId,
        vote: shouldRevert ? 0 : score,
      },
      {
        headers: {
          Cookie: `authsession=${cookie}`,
        },
      }
    );
    state.shouldFetch = true;
  }

  return onVoteClick;
}
