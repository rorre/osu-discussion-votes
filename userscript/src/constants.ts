let API_URL: string;
if (process.env.NODE_ENV === "development") {
  API_URL = "http://127.0.0.1:8080";
} else {
  API_URL = "https://votes.rorre.xyz";
}

export { API_URL };
