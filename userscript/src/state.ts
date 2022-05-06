import { Discussion } from "./types";

interface State {
  beatmapsetId: number;
  discussionsData: Discussion[];
  lastMapsetId: number;
  shouldFetch: boolean;
}

export var state: State = {
  beatmapsetId: null,
  discussionsData: [],
  lastMapsetId: null,
  shouldFetch: false,
};
