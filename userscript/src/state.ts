import { Discussion } from "./types";

interface State {
  beatmapsetId: number;
  discussionsData: Discussion[];
  lastUrl: string;
  lastMapsetId: number;
  shouldFetch: boolean;
}

export var state: State = {
  beatmapsetId: null,
  discussionsData: [],
  lastUrl: "",
  lastMapsetId: null,
  shouldFetch: false,
};
