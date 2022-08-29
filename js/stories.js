"use strict";

let storyList;

async function getAndShowStoriesOnStart() {
  storyList = await StoryList.getStories();
  $storiesLoadingMsg.remove();

  putStoriesOnPage();
}

function generateStoryMarkup(story, showDeleteBtn = false) {
  console.debug("generateStoryMarkup", story);

  const hostName = story.getHostName();

  const showStar = Boolean(currentUser)
  return $(`
      <li id="${story.storyId}">
        ${showDeleteBtn ? getDeleteHTML() : ''}
        ${showStar ? getStarHTML(story, currentUser) : ''}
        <a href="${story.url}" target="a_blank" class="story-link">
          ${story.title}
        </a>
        <small class="story-hostname">(${hostName})</small>
        <small class="story-author">by ${story.author}</small>
        <small class="story-user">posted by ${story.username}</small>
      </li>
    `);
}

function getDeleteHTML() {
  return `
    <span class="trash-can">
    <i class="fas fa-trash-alt"></i>
    </span>`
}

function getStarHTML(story, user) {
  const isFavorite = user.isFavorite(story)
  const starType = isFavorite ? 'fas' : 'far' 

  return `
    <span class="star">
      <i class="${starType} fa-star"></i>
    </span>`
}


function putStoriesOnPage() {
  console.debug("putStoriesOnPage");

  $allStoriesList.empty();

  for (let story of storyList.stories) {
    const $story = generateStoryMarkup(story);
    $allStoriesList.append($story);
  }

  $allStoriesList.show();
}

async function submitNewStory(e) {
  console.log("submitNewStory begins!")
  e.preventDefault()

  const title = $('#newTitle').val()
  const author = $('#newAuthor').val()
  const url = $('#newUrl').val()
  $submitStory.trigger('reset')
  const username = currentUser.username
  const storyData = {title, author, url, username}

  const story = await storyList.addStory(currentUser, storyData)

  const $storyHTML = generateStoryMarkup(story)
  $allStoriesList.prepend($storyHTML)

  $submitStory.hide()
}

$submitStory.on('submit', submitNewStory)

function showFavoriteStories() {
  console.debug('showFavoriteStories')
  
  $favoriteStories.empty()
  
  let userFavs = currentUser.favorites
  if (userFavs.length === 0) {
    $favoriteStories.append('<h4>You have not added any favorites yet!</h4>')
  } else {
    for (let story of userFavs) {
      const $story = generateStoryMarkup(story)
      $favoriteStories.append($story)
    }
  }

  $favoriteStories.show();
}

function showOwnStories() {
  console.debug('showMyStories');

  $myStories.empty();

  let userStories = currentUser.ownStories
  if (userStories.length === 0) {
    $myStories.append('<h4>You have not uploaded any stories yet! Go to the main page and click submit to add your first story!</h4>')
  } else {
    for (let story of userStories) {
      let $story = generateStoryMarkup(story, true)
      console.log($story)
      $myStories.append($story)
    }
  }

  $myStories.show();
}

async function toggleFavoriteStory(e) {
  console.debug('toggleFavoriteStory');
  const $target = $(e.target);
  const $closestLI = $target.closest('li');
  const storyId = $closestLI.attr('id');
  const story = storyList.stories.find(s => s.storyId === storyId);

  if ($target.hasClass('fas')) {
    await currentUser.removeFavorite(story);
    $target.closest('i').toggleClass('fas far');
  } else {
    await currentUser.addFavorite(story);
    $target.closest('i').toggleClass('fas far');
  }
}

$storiesLists.on('click', '.star', toggleFavoriteStory)

async function deleteMyStory(e) {
  console.debug('deleteMyStory');
  const $target = $(e.target);
  const $closestLI = $target.closest('li');
  const storyId = $closestLI.attr('id');

  await storyList.deleteStory(currentUser, storyId)

  hidePageComponents();
  showOwnStories();
}

$myStories.on('click', '.trash-can', deleteMyStory)