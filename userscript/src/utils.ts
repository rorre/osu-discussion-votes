import axios, { AxiosRequestConfig, AxiosResponse } from "axios";
import adapter from "axios-userscript-adapter";
import { API_URL, JWT_KEY } from "./constants";
import { state } from "./state";
import { Discussion } from "./types";
const PATH_RE =
  /beatmapsets\/(?<setid>\d+)\/discussion\/(?:[-\d]+)\/(?<tab>.+)/;

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

  const beatmapsetId = Number(result.groups.setid);
  const res = await get(API_URL + "/vote/mapset/" + beatmapsetId, {
    headers: {
      Authorization: "Bearer " + JWT_KEY,
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

  const tab = result.groups.tab;
  if (tab.startsWith("events") || tab.startsWith("reviews")) return false;
  return true;
}

export function getAllDiscussions() {
  return document.querySelectorAll<HTMLElement>(".beatmap-discussion");
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

export function generateCallback(discussionId: number, beatmapsetId: number) {
  async function onVoteClick(score: number) {
    await post(
      API_URL + "/vote/" + discussionId,
      {
        discussion_id: discussionId,
        beatmapset_id: beatmapsetId,
        vote: score,
      },
      {
        headers: {
          Authorization: "Bearer " + JWT_KEY,
        },
      }
    );
    state.shouldFetch = true;
  }

  return onVoteClick;
}
