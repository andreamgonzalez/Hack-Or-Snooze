"use strict";

const $userNav = $('#user-nav');

const $navLogin = $("#nav-login");
const $navUserProfile = $("#nav-user-profile");
const $navLogOut = $("#nav-logout");

const $navAll = $('#nav-all')
const $navSubmit = $('#nav-submit-link');
const $submitStory = $('#submit-story');
const $navFavorites = $('#nav-favorites-link')
const $navMyStories = $('#nav-myStories-link')

function navAllStories(evt) {
  console.debug("navAllStories", evt);
  hidePageComponents();
  putStoriesOnPage();
}

$body.on("click", "#nav-all", navAllStories);

function navLoginClick(evt) {
  console.debug("navLoginClick", evt);
  hidePageComponents();
  $loginForm.show();
  $signupForm.show();
}

$navLogin.on("click", navLoginClick);

function updateNavOnLogin() {
  console.debug("updateNavOnLogin");
  $(".main-nav-links").show();
  $navLogin.hide();
  $navLogOut.show();
  $navUserProfile.text(`${currentUser.username}`).show();
  $loginForm.hide();
  $signupForm.hide();
  $userNav.show()
}

function navAllStories() {
  hidePageComponents();
  putStoriesOnPage();
}

function navSubmitStory() {
  $submitStory.show()
}

$navSubmit.on('click', navSubmitStory)

function showFavorites() {
  hidePageComponents();
  showFavoriteStories();
}

$navFavorites.on('click', showFavorites)

function showMyStories() {
  hidePageComponents();
  showOwnStories();
}

$navMyStories.on('click', showMyStories)