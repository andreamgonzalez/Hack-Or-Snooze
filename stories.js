"use strict";

// This is the global list of the stories, an instance of StoryList
let storyList;

/** Get and show stories when site first loads. */

async function getAndShowStoriesOnStart() {
  storyList = await StoryList.getStories();
  $storiesLoadingMsg.remove();

  putStoriesOnPage();
}

/**
 * A render method to render HTML for an individual Story instance
 * - story: an instance of Story
 *
 * Returns the markup for the story.
 */

function generateStoryMarkup(story, showTrash = false) {
  // console.debug("generateStoryMarkup", story);
  const showStar = Boolean(currentUser);
  const hostName = story.getHostName();
  return $(`
      <li id="${story.storyId}">
      ${showTrash ? getDeleteIcon() : ""}
      ${showStar ? getFavoriteIcon(story, currentUser) : ""}
        <a href="${story.url}" target="a_blank" class="story-link">
          ${story.title}
        </a>
        <small class="story-hostname">(${hostName})</small>
        <small class="story-author">by ${story.author}</small>
        <small class="story-user">posted by ${story.username}</small>
      </li>
    `);
}


/** Gets list of stories from server, generates their HTML, and puts on page. */

function putStoriesOnPage() {
  console.debug("putStoriesOnPage");

  $allStoriesList.empty();

  // loop through all of our stories and generate HTML for them
  for (let story of storyList.stories) {
    const $story = generateStoryMarkup(story);
    $allStoriesList.append($story);
  }

  $allStoriesList.show();
}

async function saveNewStory(e){
  console.debug("saveNewStory");
  e.preventDefault();

  let author = $("#author").val();
  let title = $("#title").val();
  let url =  $("#url").val();
  let storyObject = {title, author, url};
  console.log(storyObject);

  const newStory = await storyList.addStory(currentUser, storyObject);

  const $newStory = generateStoryMarkup(newStory);
  $allStoriesList.prepend($newStory);
  console.log(storyObject);

  $newStoryForm.slideUp("slow");
  $newStoryForm.trigger("reset");
}

$newStoryForm.on("submit", saveNewStory);

function getDeleteIcon(story, user){
  return `<span class="trash-can"><i class="fas fa-trash-alt"></i></span>`;
}

async function deleteStory(e){
  const $closestLi = $(e.target).closest("li");
  const storyId = $closestLi.attr("id");

  await storyList.removeStory(currentUser, storyId)
  showUserStories();
}

function getFavoriteIcon(story, user){
  const isFavorite = user.isFavorite(story);
  const iconStyle = isFavorite ? "fas" : "far";
  return `<span class="star"><i class="${iconStyle} fa-star"></i></span>`;
}

function showFavoriteStories() {
  $favoritedStories.empty();

  if(currentUser.favorites != 0) {
    for (let story of currentUser.favorites){
      const $story = generateStoryMarkup(story);
      $favoritedStories.append($story);
    }
  } else {
    $favoritedStories.append("<h5>No favorites added!</h5>");
  }

  $favoritedStories.show();
}

async function toggleStoryFavorite(e){
  console.debug("toggleStoryFavorite");

  const $clicked = $(e.target);
  const $closestLi = $clicked.closest("li");
  const storyId = $closestLi.attr('id');
  const story = storyList.stories.find(s => s.storyId === storyId);

  if ($clicked.hasClass("fas")) {
    await currentUser.removeFavorite(story);
    $clicked.closest("i").toggleClass("fas far");
  } else {
    await currentUser.addFavorite(story);
    $clicked.closest("i").toggleClass("fas far");
  }
}

function showUserStories() {
  $userStories.empty();

  if(currentUser.stories != 0) {
    for (let story of currentUser.ownStories){
      const $story = generateStoryMarkup(story, true);
      $userStories.append($story);
    }
  } else {
    $userStories.append("<h5>You haven't add a staory!</h5>");
  }

  $userStories.show();
}

$allStoriesList.on("click", ".star", toggleStoryFavorite);
$favoritedStories.on("click", ".star", toggleStoryFavorite);
$myStories.on("click", showUserStories);
$userStories.on("click", ".star", toggleStoryFavorite);
$userStories.on("click", ".trash-can", deleteStory);
