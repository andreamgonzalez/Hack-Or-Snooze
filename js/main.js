"use strict";

const $body = $("body");

const $storiesLoadingMsg = $("#stories-loading-msg");
const $allStoriesList = $("#all-stories-list");
const $favoriteStories = $('#favorite-stories');
const $myStories = $('#my-stories');

const $storiesLists = $('.stories-list');

const $loginForm = $("#login-form");
const $signupForm = $("#signup-form");

function hidePageComponents() {
  console.debug("hidePageComponents")
  const components = [
    $loginForm,
    $signupForm,
    $submitStory,
    $allStoriesList,
    $favoriteStories,
    $myStories
  ];
  components.forEach(c => c.hide());
}

async function start() {
  console.debug("start");

  await checkForRememberedUser();
  await getAndShowStoriesOnStart();

  if (currentUser) updateUIOnUserLogin();
}

$(start);