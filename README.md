<p align="center">
    <img src="https://raw.githubusercontent.com/rorre/osu-discussion-votes/main/img/icon-128.png">
    <br />
    Arrows icon taken from Freepik.
</p>

<h2 align="center">osu! discussion votes</h2>
<p align="center">An userscript to inject up/downvotes feature to osu! discussion page</p>

## Motivation

1. **Downvotes can only be done by BNs.** As a community run game, I firmly believe that everyone's voice matters, and would
   aid in various discussions in which are more controversial such as
   [Slyze-'s Looking for Edge of Ground quality concern post](https://osu.ppy.sh/beatmapsets/1723568/discussion/-/generalAll#/3253973)
   and [Andrea's disapproval of Spelunker](https://osu.ppy.sh/beatmapsets/1145452/discussion/-/generalAll#/3028837) by making vote available for everyone
   so that there are clearer view of people's opinions on the matter.
2. **Votes is not available in replies.** While this makes sense, I personally believe Reddit style up/downvote system for replies
   is good enough to show support/disapproval of an opinion in replies.

## Getting Started

- Install latest build [here](https://gist.github.com/rorre/3e2c94442d31a12e857fb02b2942529f/raw/modvotes.user.js)
- Authorize by logging in [here](https://votes.rorre.xyz/auth)
- You may now open any discussion page and up/downvote posts

## Development

- [userscript](./userscript/): Code for the userscript.
- [server-go](./server-go/): Server implementation written in Go.
- [server](./server/): Original server written in Python. (No longer used)
