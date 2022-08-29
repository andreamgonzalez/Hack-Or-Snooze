"use strict";

const BASE_URL = "https://hack-or-snooze-v3.herokuapp.com";

class Story {
  constructor({ storyId, title, author, url, username, createdAt }) {
    this.storyId = storyId;
    this.title = title;
    this.author = author;
    this.url = url;
    this.username = username;
    this.createdAt = createdAt;
  }

  getHostName() {
    const url = new URL(this.url);
    return url.hostname
  }
}

class StoryList {
  constructor(stories) {
    this.stories = stories;
  }

  static async getStories() {
    const response = await axios({
      url: `${BASE_URL}/stories`,
      method: "GET",
    });

    const stories = response.data.stories.map(story => new Story(story));
    return new StoryList(stories);
  }

  async addStory(user, {title, author, url}) {
    const token = user.loginToken;
    const response = await axios({
      method: "POST",
      url: `${BASE_URL}/stories`,
      data: {token, story: {title, author, url}}
    })
    
    const story = new Story(response.data.story);

    this.stories.unshift(story);
    user.ownStories.unshift(story);

    return story
  }

  async deleteStory(user, storyId) {
    console.debug('deleteStory', user, storyId)
    let token = user.loginToken;
    await axios({
      url: `${BASE_URL}/stories/${storyId}`,
      method: 'DELETE',
      data: {token}
    })

    this.stories = this.stories.filter(s => s.storyId !== storyId)
    user.ownStories = user.ownStories.filter(s => s.storyId !== storyId)
  }
}

class User {
  constructor({
    username, 
    name, 
    createdAt, 
    favorites = [], 
    ownStories = []
  },token) {
    this.username = username;
    this.name = name;
    this.createdAt = createdAt;
    this.favorites = favorites.map(s => new Story(s));
    this.ownStories = ownStories.map(s => new Story(s));
    this.loginToken = token;
  }

  static async signup(username, password, name) {
    const response = await axios({
      url: `${BASE_URL}/signup`,
      method: "POST",
      data: { user: { username, password, name } },
    });

    let { user } = response.data

    return new User(
      {
        username: user.username,
        name: user.name,
        createdAt: user.createdAt,
        favorites: user.favorites,
        ownStories: user.stories
      },
      response.data.token
    );
  }

  static async login(username, password) {
    const response = await axios({
      url: `${BASE_URL}/login`,
      method: "POST",
      data: { user: { username, password } },
    });

    let { user } = response.data;

    return new User(
      {
        username: user.username,
        name: user.name,
        createdAt: user.createdAt,
        favorites: user.favorites,
        ownStories: user.stories
      },
      response.data.token
    );
  }

  static async loginViaStoredCredentials(token, username) {
    try {
      const response = await axios({
        url: `${BASE_URL}/users/${username}`,
        method: "GET",
        params: { token },
      });

      let { user } = response.data;

      return new User(
        {
          username: user.username,
          name: user.name,
          createdAt: user.createdAt,
          favorites: user.favorites,
          ownStories: user.stories
        },
        token
      );
    } catch (err) {
      console.error("loginViaStoredCredentials failed", err);
      return null;
    }
  }

  async addFavorite(story) {
    this.favorites.push(story)
    await this.addOrRemoveFavorite(story, 'add')
  }

  async removeFavorite(story) {
    this.favorites = this.favorites.filter(s => s.storyId !== story.storyId)
    await this.addOrRemoveFavorite(story, 'remove')
  }

  async addOrRemoveFavorite(story, addOrRemove) {
    let method = addOrRemove === 'add' ? 'POST' : 'DELETE'
    let token = this.loginToken
    await axios({
      url: `${BASE_URL}/users/${this.username}/favorites/${story.storyId}`,
      method: method,
      data: {token}
    })
  }
  
  isFavorite(story) {
    return this.favorites.some(s => (s.storyId === story.storyId))
  }
}